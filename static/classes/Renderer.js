// Renderer类，主要负责按钮、表格、通知的前端管理。

class Renderer {
    constructor() {
        this.clear = document.getElementById('clear');
        this.save = document.getElementById('save');
        this.table = document.getElementById('word-table');
        this.notifications_container = document.getElementById('notifications-container');
    }

    disableAllBtn() {
        // 禁用所有按钮
        this.clear.disabled = this.save.disabled = true;
    }

    enableClearBtn() {
        // 启用清空按钮
        this.clear.disabled = false;
    }

    disableSaveBtn() {
        // 禁用保存按钮
        this.save.disabled = true;
    }

    tryEnableSaveBtn(DataManager) {
        // 尝试启用保存按钮
        if (Object
            .values(DataManager.vocabulary)
            .indexOf(false) === -1 && 
            Object
            .keys(DataManager.vocabulary)
            .length > 0) {
            // 有词汇，且词汇全部查询完毕
            this.save.disabled = false;
        }
    }

    insertCompleteRow(new_vocabulary) {
        // 插入表格新的一行
        const new_row = this.table.tBodies[0].insertRow(-1);
        // 补全表格cell
        for (let i = 0; i < 4; i++) {
            const cell = new_row.insertCell(-1);
            cell.className = 'table-data';
        }
        const { delete_btn } = this.modifyRow(new_row, new_vocabulary);
        return {
            new_row: new_row,
            delete_btn: delete_btn,
        };
    }

    modifyRow(row, vocabulary) {
        // 添加新行的细节
        // 添加动画
        row.style.animation = 'opaquely-fade-in 0.5s ease';
        // 添加部分表格内容
        row.cells[0].textContent = row.rowIndex;
        row.cells[1].textContent = vocabulary;
        // 添加释义输入框外容器
        const translation_container = document.createElement('div');
        translation_container.className = 'translation-container';
        row.cells[2].appendChild(translation_container);
        // 添加释义输入框
        const translation = document.createElement('textarea');
        translation.className = 'translation-input';
        translation_container.appendChild(translation);
        translation.value = '获取中……';
        // 添加操作按钮外容器
        const operations_container = document.createElement('div');
        operations_container.className = 'operations-container';
        row.cells[3].appendChild(operations_container);
        // 添加操作按钮
        const delete_btn = document.createElement('img');
        delete_btn.src = './static/images/delete.png';
        delete_btn.className = 'operations';
        operations_container.appendChild(delete_btn);
        // 将行滚动到视图
        translation.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
        // 自适应行高
        translation.addEventListener('input', () => {
            translation.style.height = '';
            translation.style.height = `${translation.scrollHeight}px`;
        });
        return {
            delete_btn: delete_btn
        };
    }

    addTranslation(row, translation) {
        const translation_textarea = row // 这一行
        .cells[2] // 的第二列
        .querySelector('.translation-container') // 的外容器
        .querySelector('.translation-input'); // 的输入框
        // 补充翻译的信息
        translation_textarea.value = translation; // 的值
        // 将行滚动到视图
        translation_textarea.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
        // 调整行高
        translation_textarea.dispatchEvent(new Event('input'));
    }

    removeIndex(row_index) {
        // 删除表格
        this.table.deleteRow(row_index);
        // 如果不剩单词，就禁用所有按钮
        if (this.table.rows.length === 1) {
            this.disableAllBtn();
        // 如果还剩单词，就尝试恢复保存按钮
        } else {
            this.tryEnableSaveBtn();
        }
    }

    notify(message) {
        // 向用户弹出通知
        // 创建单个通知容器
        const single_notification = document.createElement('div');
        single_notification.className = 'notification';
        // 将单个通知容器放入全部通知容器中
        this.notifications_container.appendChild(single_notification);
        // 添加动画
        single_notification.style.animation = 'fade-in 0.5s ease';
        // 书写通知内容
        const paragraph = document.createElement('p');
        paragraph.textContent = message.toString();
        single_notification.appendChild(paragraph);
        // 延迟5秒，播放出场动画
        setTimeout(() => {
            single_notification.style.animation = 'fade-out 0.5s ease';
            // 再延迟0.5秒，删除通知
            setTimeout(() => {
                single_notification.remove();
            }, 500);
        }, 5000);
    }
}

export {Renderer};
