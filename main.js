// main.js

/*
* 1：清空按键，在合适的机会禁用。
* 2：保存按键，在合适的机会禁用。
* 3：输入框，捕捉到Enter时输入单词。（完成）
* 4：Ctrl+C监听，输入剪贴板单词。
*/

function input_word(information) {
    /*
    * 1. 查询单词释义
    * 2. 增加表格内容
    */
    // return条件
    const input_box = document.getElementById('input-word');
    if (document.activeElement != input_box) {
        return;
    }
    const new_word = input_box.value;
    if (new_word == '' ) {
        return;
    }
    if (information.words.indexOf(new_word) != -1) {
        notice([
            {
                type: 'text',
                content: `${new_word}已添加过了！`,
            },
        ]);
        input_box.value = '';
        return;
    }
    // 新增一行表格
    const new_row = table({
        method: 'insert',
        index: -1,
    });
    // 修改序号内容
    new_row.cells[0].innerHTML = new_row.rowIndex;
    // 修改单词内容
    new_row.cells[1].innerHTML = new_word;
    // 访问Python服务器，修改释义内容
    // 创建释义输入框
    const translation_container = document.createElement('div');
    translation_container.className = 'translation-container';
    new_row.cells[2].appendChild(translation_container);
    const translation_input = document.createElement('textarea');
    translation_input.className = 'translation-input';
    translation_input.value = '获取中……';
    translation_container.appendChild(translation_input);
    translation_input.addEventListener('input', () => {
        translation_input.style.height = '';
        translation_input.style.height = `${translation_input.scrollHeight}px`;
    });
    fetch(`http://localhost:50907/vocab/${new_word}`, {
        headers: {
            "Authorization": "Bearer abc123",
        }
    })
        .then((res) => {
            return res.text();
        })
        .then((translation) => {
            translation_input.value = translation;
            // 调整textarea高度
            translation_input.dispatchEvent(new Event('input'));
        })
        .catch((e) => {
            translation_input.value = '未找到';
            translation_input.dispatchEvent(new Event('input'));
            notice([
                {
                    type: 'text',
                    content: `出现错误：${e}`,
                },
            ]);
        });
    // 修改操作内容
    const operations_container = document.createElement('div');
    operations_container.className = 'operations-container';
    new_row.cells[3].appendChild(operations_container);
    const to_delete = document.createElement('img');
    to_delete.src = './images/delete.png';
    to_delete.style.height = '18px';
    operations_container.appendChild(to_delete);
    // 创建按钮的事件监视器
    delete_mouseover = information.callbacks.mouseover.bind(null, to_delete);
    delete_mouseleave = information.callbacks.mouseleave.bind(null, to_delete);
    delete_click = information.callbacks.delete_click.bind(null, to_delete);
    to_delete.addEventListener('mouseover', delete_mouseover);
    to_delete.addEventListener('mouseleave', delete_mouseleave);
    to_delete.addEventListener('click', delete_click);
    // 收尾工作
    information.words.push(new_word);
    input_box.value = '';
}

function table(operation) {
    /*
    * operation = {
    *   method: 'insert' or 'delete',
    *   index: int,
    * }
    * 增加或删除词表
    */
    // 处理异常
    if (typeof operation.index != 'number') {
        throw new TypeError('索引应为整数！')
    }
    const word_table = document.getElementById('word-table');
    switch (operation.method) {
        case 'insert':
            const new_row = word_table.tBodies[0].insertRow(operation.index);
            for (let i = 0; i < 4 ; i++) { // i < 4 因为表格只有四列
                new_row.insertCell(i).className = 'table-data';
            }
            new_row.style.animation = 'opaquely-fade-in 0.5s ease';
            return new_row;
        case 'delete':
            const word = word_table.rows[operation.index].cells[1].innerHTML;
            console.log(word);
            notice([
                {
                    type: 'text',
                    content: `已删除单词 ${word} ！`,
                },
            ]);
            word_table.deleteRow(operation.index);
            for (let i = operation.index; i < word_table.rows.length; i++) {
                word_table.rows[i].cells[0].innerHTML = i;
            }
            return;
        default:
            throw new ReferenceError(`方法${operation.method}未被定义！`);
            return;
    }
}

function notice(components) {
    /*
    * components = [
    *   {
    *   type: 'text' or 'event',
    *   content: str,
    *   callback: null or function,
    *   }, more...
    * ]
    */
    const notification = document.createElement('div');
    notification.className = 'notification';
    document.getElementById('notifications-container').appendChild(notification);
    notification.style.animation = 'fade-in 0.5s ease';
    // 遍历通知成分
    for (let i = 0; i < components.length; i++) {
        // 添加段落
        let new_p = document.createElement('p');
        new_p.innerHTML = components[i].content
        new_p.className = 'notification-text';
        notification.appendChild(new_p);
        if (components[i].type == 'event') {
            // 绑定事件
            new_p.addEventListener('click', components[i].callback);
            // 样式
            new_p.style.fontWeight = 'bolder';
            new_p.style.textDecoration = 'underline';
            // 5秒后删除事件
            setTimeout(() => {
                new_p.removeEventListener('click', components[i].callback);
            }, 5000);
        }
        // 5.5秒后删除段落
        setTimeout(() => {
            new_p.remove();
        }, 5500);
    }
    // 5秒后播放出场动画
    setTimeout(() => {
        notification.style.animation = 'fade-out 0.5s ease';
    }, 5000);
    // 5.5秒后隐藏通知
    setTimeout(() => {
        notification.remove();
    }, 5500);
}

function main() {
    const word_table = document.getElementById('word-table');
    const clear = document.getElementById('clear');
    const save = document.getElementById('save');
    const information = {
        words: [],
        callbacks: {
            mouseover: (element) => {
                element.src = `${element.src.slice(0, -4)}_over.png`;
            },
            mouseleave: (element) => {
                element.src = `${element.src.slice(0, -9)}.png`; // 裁掉_over字段
            },
            delete_click: (element) => {
                // 需要从图片元素开始，找到自己所在行的索引
                const index = element.closest('tr').rowIndex;
                table({
                    method: 'delete',
                    index: index,
                });
                information.words.splice(index - 1, 1); // 删除第index-1个单词
                console.log(information);
            },
        },
    };
    // 监听Enter键和Ctrl+V
    document.addEventListener('keydown', (res) => {
        if (res.key == 'Enter') {
            input_word(information);
        }
        if (res.ctrlKey && res.key == 'v') {
            setTimeout(() => {
                input_word(information);
            }, 10);
        }
    });
    // 按钮覆盖动画
    const zoom_in = (element) => {
        element.style.animation = 'zoom-in 0.5s ease'
        setTimeout(() => {
            element.style.transform = 'scale(1.1)';
        }, 490); // 延迟比动画少10ms是为了解决按钮大小抽搐
    }
    const zoom_out = (element) => {
        element.style.animation = 'zoom-out 0.5s ease'
        setTimeout(() => {
            element.style.transform = 'scale(1.0)';
        }, 490);
    }
    clear.addEventListener('mouseover', () => {zoom_in(clear)});
    save.addEventListener('mouseover', () => {zoom_in(save)});
    clear.addEventListener('mouseleave', () => {zoom_out(clear)});
    save.addEventListener('mouseleave', () => {zoom_out(save)});
    // 判断按钮禁用状态
    clear.disabled = save.disabled = true;
    setInterval(() => {
        if (word_table.rows.length == 1) {
            // 禁用按钮
            clear.disabled = save.disabled = true;
        } else {
            // 激活按钮
            clear.disabled = save.disabled = false;
        }
    }, 100);
    // 保存按钮功能
    save.addEventListener('click', () => {
        // 修改表格
        word_table.rows[0].cells[3].innerHTML = '';
        for (let i = 1; i < word_table.rows.length; i++) {
            const translation = word_table.rows[i].cells[2].querySelector('textarea').value;
            word_table.rows[i].cells[2].querySelector('textarea').remove();
            word_table.rows[i].cells[2].innerHTML = translation;
        }
        const workbook = XLSX.utils.table_to_book(word_table);
        const name = `生词记录${new Date()}.xlsx`;
        XLSX.writeFile(workbook, name);
        notice([
            {
                type: 'text',
                content: '已保存表格到本地！',
            },
        ]);
        word_table.rows[0].cells[3].innerHTML = '操作';
        clear.dispatchEvent(new Event('click'));
    });
    // 清空按钮功能
    clear.addEventListener('click', () => {
        // 注意删除过程中表格的动态变化
        const length = word_table.rows.length;
        for (let i = 1; i < length; i++) {
            word_table.deleteRow(1);
        }
        notice([
            {
                type: 'text',
                content: '已清空表格！',
            },
        ]);
    });
};

main();