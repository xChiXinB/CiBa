/*
* 1：清空按键，在合适的机会禁用。
* 2：保存按键，在合适的机会禁用。
* 3：输入框，捕捉到Enter时输入单词。（完成）
* 4：Ctrl+C监听，输入剪贴板单词。
*/

function input_word(new_word) {
    /*
    * 1. 查询单词释义
    * 2. 增加表格内容
    */
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
    new_row.cells[2].innerHTML = '获取中……';
    fetch(`http://localhost:50907/vocab/${new_word}`, {
        headers: {
            "Authorization": "Bearer abc123",
        }
    })
        .then((res) => {
            return res.text();
        })
        .then((translation) => {
            new_row.cells[2].innerHTML = translation;
        })
        .catch((e) => {
            new_row.cells[2].innerHTML = '未找到';
        });
    // 修改操作内容
    // 删除表格边距
    new_row.cells[3].style.padding = 0;
    // 创建外部框架
    const border = document.createElement('div');
    border.className = 'operation';
    new_row.cells[3].appendChild(border);
    // 创建框架内的图标和中间的空隙
    const to_edit = document.createElement('img');
    const gap = document.createElement('div');
    const to_delete = document.createElement('img');
    to_edit.src = './images/edit.png';
    to_delete.src = './images/delete.png';
    to_edit.style.height = to_delete.style.height = '18px';
    gap.style.width = '6px';
    border.appendChild(to_edit);
    border.appendChild(gap);
    border.appendChild(to_delete);
    // 创建按钮的事件监视器
    let buttons = {
        'to_edit': to_edit,
        'to_delete': to_delete,
    };
    let callbacks = new Object();
    for (let button in buttons) {
        callbacks[button] = new Object();
        callbacks[button].click = () => {
            table({
                method: 'delete',
                index: new_row.rowIndex,
            });
        };
        callbacks[button].mouseover = () => {
            buttons[button].style.backgroundColor = '#2B3640';
        };
        callbacks[button].mouseleave = () => {
            buttons[button].style.backgroundColor = 'none';
        };
    }
    console.log(callbacks);
    /*
    const delete_click_callback = () => {
        table({
            method: 'delete',
            index: new_row.rowIndex,
        });
        to_delete.removeEventListener()
    };
    const delete_mouseover_callback = () => {
        to_delete.style.backgroundColor = '#2B3640';
    }
    const delete_mouseleave_callback = () => {
        to_delete.style.backgroundColor = 'none';
    }
    const edit_mouseover_callback = () => {
        to_edit.style.backgroundColor = '#2B3640';
    }
    const edit_mouseleave_callback = () => {
        to_edit.style.backgroundColor = 'none';
    }
    to_delete.addEventListener('click', delete_click_callback, {once: true});
    to_delete.addEventListener('mouseover', delete_click_callback);
    to_delete.addEventListener('click', delete_click_callback, {once: true});*/
}

function table(operation) {
    /*
    * operation = {
    *   method: 'insert' or 'delete' or 'edit',
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
                new_row.insertCell(i).className = 'word';
            }
            new_row.style.animation = 'opaquely-fade-in 0.5s ease';
            return new_row;
        case 'delete':
            word_table.deleteRow(operation.index);
            for (let i = operation.index; i < word_table.rows.length; i++) {
                word_table.rows[i].cells[0].innerHTML = i;
            }
            return;
        case 'edit':

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
    const notification = document.getElementById('notification');
    notification.style.display = 'flex';
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
        notification.style.display = 'none';
    }, 5500);
}

function main() {
    const word_table = document.getElementById('word-table');
    const clear = document.getElementById('clear');
    const save = document.getElementById('save');
    const input_box = document.getElementById('input-word');
    let words = new Array();
    // 监听Enter键和Ctrl+V
    document.addEventListener('keydown', (res) => {
        if (res.key == 'Enter') {
            input_word(input_box.value);
            words.push(input_box.value);
            input_box.value = '';
        }
        if (res.ctrlKey && res.key == 'v') {
            setTimeout(() => {
                input_word(input_box.value);
                words.push(input_box.value);
                input_box.value = '';
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
        const workbook = XLSX.utils.table_to_book(word_table);
        XLSX.writeFile(workbook, `生词记录${new Date()}.xlsx`);
    });
};

main();

// test
/*
notice(
    [
        {
            type: 'text',
            content: 'test&nbsp;',
            callback: null,
        },
        {
            type: 'event',
            content: 'click me',
            callback: () => {
                console.log('being clicked');
            },
        },
    ]
);
*/
