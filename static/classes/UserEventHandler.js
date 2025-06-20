class UserEventHandler {
    constructor() {
        this.input_box = document.getElementById('input-box');
    }

    vocabSubmitService(DataManager, Renderer, NetworkManager) {
        // 监听提交单词行为
        this.listenShortcuts(DataManager, Renderer, NetworkManager);
        this.listenEnterKey(DataManager, Renderer, NetworkManager);
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
                // 更新单词数据（查询完毕，true）
                DataManager.vocabulary[new_vocabulary] = true;
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
            Renderer.removeIndex(row_index);
        })
    }
}

export {UserEventHandler};
