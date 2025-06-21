class UserEventHandler {
    constructor() {
        this.input_box = document.getElementById('input-box');
        this.table = document.getElementById('word-table');
        this.clear = document.getElementById('clear');
        this.save = document.getElementById('save');
    }

    vocabSubmitService(DataManager, Renderer, NetworkManager) {
        // 监听提交单词行为
        this.listenShortcuts(DataManager, Renderer, NetworkManager);
        this.listenEnterKey(DataManager, Renderer, NetworkManager);
    }

    buttonServices(DataManager, Renderer) {
        // 监听保存和清空按钮
        this.save.addEventListener('click', () => {
            this.btnSave(DataManager, Renderer);
        });
        this.clear.addEventListener('click', () => {
            this.btnClear(DataManager, Renderer);
        });
    }

    btnSave(DataManager, Renderer) {
        // 保存表格
        // 1. 移除冗余的内容
        this.table.rows[0].cells[3].textContent = ''; // 移除“操作”
        for (let i = 1; i < this.table.rows.length; i++) {
            const textarea = this.table
                .rows[i].cells[2]
                .querySelector('.translation-input');
            const translation = textarea.value;
            textarea.remove(); // 移除输入框
            this.table
                .rows[i].cells[2]
                .textContent = translation;
        }
        // 2. 利用第三方库导出表格
        const workbook = XLSX.utils.table_to_book(this.table);
        const name = `生词记录 ${new Date().toString()}.xlsx`;
        XLSX.writeFile(workbook, name);
        // 3. 提醒用户导出成功
        Renderer.notify('已保存表格到本地！');
        // 4. 清空表格
        this.btnClear(DataManager, Renderer);
        // 5. 补回“操作”
        this.table.rows[0].cells[3].textContent = '操作';
    }

    btnClear(DataManager, Renderer) {
        // 清空表格
        // 1. 删除，然后放置新的tbody
        document.getElementById('word-tbody').remove();
        const tbody = document.createElement('tbody');
        tbody.id = 'word-tbody';
        this.table.appendChild(tbody);
        // 2. 清空DataManager的数据
        DataManager.vocabulary = {};
        // 3. 禁用所有按钮
        Renderer.disableAllBtn();
        // 4. 通知用户
        Renderer.notify('表格已被清空！');
    }

    listenShortcuts(DataManager, Renderer, NetworkManager) {
        // 监听用户使用Ctrl+V或Command+V输入单词
        console.log('Listening Ctrl+V');
        document.addEventListener('keydown', (res) => {
            if ((res.ctrlKey || res.metaKey) && res.key === 'v') {
                setTimeout(() => {
                    this.submitVocab(DataManager, Renderer, NetworkManager);
                }, 10)
            }
        });
    }

    listenEnterKey(DataManager, Renderer, NetworkManager) {
        // 监听用户使用Enter输入单词
        console.log('Listening Enter');
        document.addEventListener('keydown', (res) => {
            console.log('Res triggered!');
            if (res.key === 'Enter') {
                this.submitVocab(DataManager, Renderer, NetworkManager);
            }
        });
    }

    async submitVocab(DataManager, Renderer, NetworkManager) {
        // 提交单词
        console.log('submitting...');
        const new_vocabulary = this.canSubmitNow(DataManager, Renderer);
        // 检查提交条件，如果不能提交则new_vocabulary === false
        if (typeof new_vocabulary === 'string') {
            // 启用清空按钮
            Renderer.enableClearBtn();
            // 禁用保存按钮
            Renderer.disableSaveBtn();
            // 新增单词数据（对应单词未查询完毕，false）
            DataManager.vocabulary[new_vocabulary] = false;
            // 更新上次提交时间
            DataManager.lastSubmitTime = Date.now();
            // 新增一行表格，并获取返回的行和删除按钮的引用
            const { new_row, delete_btn } = Renderer.insertCompleteRow(new_vocabulary);
            // 监听删除按钮
            this.listenDeleteBtn(delete_btn, DataManager, Renderer);
            // 清空输入框
            this.input_box.value = '';
            // fetch释义数据
            try {
                const translation = await NetworkManager.fetchTranslation(new_vocabulary);
                // 成功后展示翻译
                Renderer.addTranslation(new_row, translation);
            } catch (err) {
                Renderer.notify(`请求出现问题：${err.message}`);
                // 失败后展示“出现错误”
                Renderer.addTranslation(new_row, '出现错误！');
            } finally {
                // 如果单词没被删，更新单词数据（true）
                if (DataManager.vocabulary[new_vocabulary] !== undefined) {
                    DataManager.vocabulary[new_vocabulary] = true;
                }
                // 尝试解禁按钮
                Renderer.tryEnableSaveBtn(DataManager);
            }
        }
    }

    canSubmitNow(DataManager, Renderer) {
        // 检测是否可以提交单词
        // 焦点不在输入框
        if (document.activeElement !== this.input_box) {
            return false;
        }
        // 输入为空
        const new_vocabulary = this.input_box.value;
        if (new_vocabulary === '') {
            return false;
        }
        // 输入重复
        if (DataManager.vocabulary[new_vocabulary] !== undefined) {
            this.input_box.value = ''; // 清空输入框
            // 获取单词释义并通知用户
            const translation = this.table.rows[
                // 获取单词索引
                Object
                    .keys(DataManager.vocabulary)
                    .indexOf(new_vocabulary) + 1
            ]
                .cells[2]
                .querySelector('.translation-input')
                .value;
            Renderer.notify(
                `${new_vocabulary}重复！释义：
                ${translation.length > 10?
                    `${translation.slice(0, 10)}...`:
                    translation
                }`
            );
            console.log(Object.keys(DataManager.vocabulary).indexOf(new_vocabulary));
            return false;
        }
        // 输入过于频繁（小于2秒）
        if (Date.now() - DataManager.lastSubmitTime <= 2000) {
            Renderer.notify('操作过于频繁，请稍后再试。');
            return false;

        }
        return new_vocabulary;
    }

    listenDeleteBtn(button, DataManager, Renderer) {
        // 绑定删除按钮的事件监视器
        // 鼠标覆盖
        button.addEventListener('mouseover', () => {
            button.src = `${button.src.slice(0, -4)}_over.png`;
            // 先去掉'.png'字段，再加入'_over.png'
        });
        // 鼠标离开
        button.addEventListener('mouseleave', () => {
            button.src = `${button.src.slice(0, -9)}.png`
            // 先去掉'_over.png'字段，再加入'.png'
        });
        // 鼠标点击
        button.addEventListener('click', () => {
            // 获取单词和单词索引
            const row_index = button.closest('tr').rowIndex;
            const vocab = button.closest('tr').cells[1].textContent;
            // 删除数据
            delete DataManager.vocabulary[vocab];
            // 删除表格该行
            Renderer.removeIndex(row_index, DataManager);
            // 通知用户
            Renderer.notify(`已删除${vocab}。`);
        });
    }
}

export {UserEventHandler};
