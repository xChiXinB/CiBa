class UserEventHandler {
    constructor() {
        this.input_box = document.getElementById('input-box');
        this.table = document.getElementById('word-table');
        this.clear = document.getElementById('clear');
        this.save = document.getElementById('save');
        this.passage_input_btn = document.getElementById('passage-input-btn');
        // 新增：用于记录passage-input子窗口引用
        this.passageInputWindow = undefined;
        // 是否有单词在重试
        this.retry_target = null;
    }

    inputBoxAutoFocus() {
        this.input_box.focus();
        
        window.addEventListener('focus', () => {
            this.input_box.focus();
        });
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
        // 监听文章录入按钮
        this.passage_input_btn.addEventListener('click', () => {
            this.openPassageInput(Renderer);
        });
    }

    btnSave(DataManager, Renderer) {
        // 保存表格
        // 1. 移除冗余的内容
        this.table.rows[0].cells[3].textContent = ''; // 移除“操作”
        for (let i = 1; i < this.table.rows.length; i++) {
            const textarea = this.table
                .rows[i]
                .getElementsByClassName('translation-input')[0];
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
        DataManager.vocabulary.clear();
        // 3. 禁用所有按钮
        Renderer.disableAllBtn();
        // 4. 通知用户
        Renderer.notify('表格已被清空！');
        // 清空后广播词表
        this.broadcastInputWordList(DataManager);
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
        const enter_callback = (res) => {
            if (res.key === 'Enter') {
                if (this.retry_target !== null) {
                    this.doRetry(DataManager, Renderer, NetworkManager);
                    return;
                }
                this.submitVocab(DataManager, Renderer, NetworkManager);
                
            }
        }
        document.addEventListener('keydown', enter_callback);
    }

    async submitVocab(DataManager, Renderer, NetworkManager, ignoreFocus=false, isRetry=false) {
        // 提交单词
        const new_vocabulary = this.canSubmitNow(DataManager, Renderer, ignoreFocus);
        // 检查提交条件，如果不能提交则new_vocabulary === false
        if (new_vocabulary === false) return false;
        let vocab_row;
        if (isRetry) {
            Renderer.notify(`正在重新提交${new_vocabulary}！`);
            vocab_row = this.retry_target;
        } else {
            // 启用清空按钮
            Renderer.enableClearBtn();
            // 新增一行表格，并获取返回的行和删除按钮的引用
            const { new_row_private, delete_btn } = Renderer.insertCompleteRow(new_vocabulary);
            vocab_row = new_row_private; // 变量作用到外层块
            // 监听删除按钮
            this.listenDeleteBtn(delete_btn, DataManager, Renderer);
        }
        // 清空输入框
        this.input_box.value = '';
        // 禁用保存按钮
        Renderer.disableSaveBtn();
        // 设定单词数据（对应单词未查询完毕，false）
        DataManager.vocabulary.set(new_vocabulary, false);
        // 广播词表
        this.broadcastInputWordList(DataManager);
        // fetch释义数据
        let is_fetch_successful;
        try {
            const translation = await NetworkManager.fetchTranslation(new_vocabulary);
            // 成功后展示翻译
            Renderer.addTranslation(vocab_row, translation)
            is_fetch_successful = true;
            return is_fetch_successful; // 成功录入
        } catch (err) {
            // 提示用户出错
            Renderer.notify(`请求出现问题：${err.message}`);
            // 失败后展示错误信息
            const error = err.message;
            Renderer.addTranslation(vocab_row, error);
            is_fetch_successful = false;
            return is_fetch_successful; // 录入失败
        } finally {
            const vocab_not_deleted = DataManager.vocabulary.get(new_vocabulary) !== undefined;
            if (vocab_not_deleted && is_fetch_successful) {
                DataManager.vocabulary.set(new_vocabulary, true);
            } else if (vocab_not_deleted && (!is_fetch_successful)) {
                DataManager.vocabulary.set(new_vocabulary, 'errored');
            }
            // 尝试解禁按钮
            Renderer.tryEnableSaveBtn(DataManager);
            // 刷新表格
            Renderer.refreshTableStatus(DataManager, this.listenRetryBtn());
        }
    }

    canSubmitNow(DataManager, Renderer, ignoreFocus=false) {
        // 检测是否可以提交单词
        // 判断焦点是否在输入框问题
        let is_focus_oK;
        if (ignoreFocus) {
            is_focus_oK = true;
        } else {
            is_focus_oK = document.activeElement === this.input_box;
        }
        if (!is_focus_oK) {
            return false;
        }
        // 输入为空
        const new_vocabulary = this.input_box.value;
        if (new_vocabulary === '') {
            return false;
        }
        // 输入重复
        if (DataManager.vocabulary.get(new_vocabulary) !== undefined) {
            this.input_box.value = ''; // 清空输入框
            // 获取单词释义并通知用户
            const index_of_new_vocab = Array.from(
                DataManager.vocabulary.keys()
            ).indexOf(new_vocabulary) + 1;
            const translation = this.table.rows[
                index_of_new_vocab
            ].getElementsByClassName('translation-input')[0].value;
            Renderer.notify(
                `${new_vocabulary}重复！释义：
                ${translation.length > 10
                    ? `${translation.slice(0, 10)}...`
                    : translation
                }`
            );
            return false;
        }
        return new_vocabulary;
    }

    listenDeleteBtn(button, DataManager, Renderer) {
        // 绑定删除按钮的事件监视器
        // 鼠标覆盖
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#FF000050';
        });
        // 鼠标离开
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#00000000';
        });
        // 鼠标点击
        button.addEventListener('click', () => {
            // 获取单词和单词索引
            const row = button.closest('tr')
            const row_index = row.rowIndex;
            let vocab = row.cells[1].textContent;
            if (vocab === '') {
                vocab = row.cells[1]._textContent;
                clearInterval(row.cells[1].getElementsByClassName('retry-input')[0]._intervalNotice);
            }
            // 删除数据
            DataManager.vocabulary.delete(vocab);
            // 删除表格该行
            Renderer.removeIndex(row_index, DataManager);
            // 通知用户
            Renderer.notify(`已删除${vocab}。`);
            // 删除后广播词表
            this.broadcastInputWordList(DataManager);
        });
    }

    listenRetryBtn() {
        const mouseover = function(button) {
            button.style.transform = 'rotate(0.1turn) scale(1.2)';
        };
        const mouseleave = function(button) {
            button.style.transform = 'rotate(0turn) scale(1)';
        };
        const click = (Renderer, button) => {
            if (this.retry_target) return;
            this.retry_target = button.closest('tr');

            const vocab_cell = this.retry_target.cells[1];
            const vocab = vocab_cell.textContent;
            Renderer.notify(`正在修改出错的单词 ${vocab}！`, true);
            Renderer.notify('按下Enter以尝试重新提交！', true);

            // 添加输入框
            vocab_cell._textContent = vocab;
            vocab_cell.textContent = '';
            const retry_input = document.createElement('input');
            retry_input.classList.add('retry-input');
            vocab_cell.appendChild(retry_input);
            retry_input.value = vocab
            retry_input.focus();

            // 操作提醒
            retry_input._intervalNotice = setInterval(() => {
                Renderer.notify('请按下Enter以重新提交单词！', true);
            }, 10000);
        };
        const functions = {
            mouseover: mouseover,
            mouseleave: mouseleave,
            click: click,
        };
        return functions;
    }

    async doRetry(DataManager, Renderer, NetworkManager) {
        // 删除重试按钮
        Array.from(
            document.getElementsByClassName('retry-input')[0]
                .closest('tr')
                .getElementsByClassName('operations')
        ).find((element) => 
            element.src.includes('retry.png')
        ).remove();

        // 恢复输入框内容
        const vocab_cell = this.retry_target.cells[1];
        const retry_input = vocab_cell.getElementsByClassName('retry-input')[0];
        this.input_box.value = vocab_cell.textContent = retry_input.value;
        clearInterval(retry_input._intervalNotice);
        retry_input.remove();

        DataManager.vocabulary.delete(vocab_cell._textContent); 
        Renderer.addTranslation(this.retry_target, '正在重试……');

        const success = await this.submitVocab(DataManager, Renderer, NetworkManager, true, true);
        this.retry_target = null;
        if (success) {
            Renderer.notify(`单词${vocab_cell.textContent}查询成功！`);
        }
    }

    openPassageInput(Renderer) {
        // 只允许打开一个passage-input子窗口
        if (this.passageInputWindow !== undefined) {
            Renderer.notify('请勿重复操作！');
            return;
        }
        // 打开新窗口并保存引用
        this.passageInputWindow = window.open('/passageinput', 'passage_input', 'width=800,height=600');
        Renderer.notify('已开启文章录入模式！');
        // 监听窗口关闭事件，关闭时清空引用
        const timer = setInterval(() => {
            if (this.passageInputWindow.closed) {
                clearInterval(timer);
                this.passageInputWindow = undefined;
            }
        }, 500);
    }

    listenPassageInput(DataManager, Renderer, NetworkManager) {
        // 监听来自passage-input页面的消息
        window.addEventListener('message', async (event) => {
            if (event.data.type === 'word_click') {
                const word = event.data.word;
                // 模拟输入框输入单词
                this.input_box.value = word;
                // 提交单词
                const success = await this.submitVocab(DataManager, Renderer, NetworkManager, true);
                if (success) {
                    Renderer.notify(`已录入文章中的${word}单词！`);
                }
            } else if (event.data.type === 'word_query') {
                this.broadcastInputWordList(DataManager);
            }
        });
    }

    broadcastInputWordList(DataManager) {
        // 广播词表
        if (this.passageInputWindow === undefined) return;
        const words = Array.from(DataManager.vocabulary.keys());
        this.passageInputWindow.postMessage({
            type: 'word_sync',
            words: words,
        }, '*');
        console.log('已经发送消息了！');
    }
}

export {UserEventHandler};
