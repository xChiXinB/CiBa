class EventPossessor {
    constructor() {
        this.input_box = document.getElementById('input-box');
        this.passage_display = document.getElementById('passage-display');
        this.text_disassembly = this.is_start_with_vocab = null;
    }

    passageInputService(Renderer) {
        console.log('passage service activated!');
        // 用户输入文章上传单词的服务
        this.input_box.addEventListener('input', () => {
            // 清除已存在文章
            this.passage_display.querySelectorAll('span').forEach((element) => {
                element.remove();
            });
            // 解析单词
            console.log(this.input_box.value);
            try {
                ({
                    text_disassembly: this.text_disassembly,
                    is_start_with_vocab: this.is_start_with_vocab
                } = this.analyzeText(
                    this.input_box.value
                ));
            } catch (err) {
                // 大概率说明文章是空的
                return;
            }
            // 定义需要高亮的index % 2
            const highlighted_modular_res = this.is_start_with_vocab ? 0 : 1;
            // 渲染文章到页面上
            Renderer.renderPassage(
                this.text_disassembly,
                highlighted_modular_res,
                this.handleWordClick
            );
        });
    }

    analyzeText(text) {
        // 分析文章结构
        // 返回“是否以单词开始”
        const text_disassembly = text.match(/\w+|[^\w]+/g) // 捕捉所有连续英文字母和连续非英文字母
        if (text_disassembly === null) {
            // 未匹配到文本，抛出错误
            throw new Error('Nothing is matched!');
        }
        const beginning = text_disassembly[0] // 获取开始字符
        return {
            text_disassembly: text_disassembly,
            is_start_with_vocab: beginning.match(/\w/g) !== null, // 开始部分包含字母
        };
    }

    handleWordClick(word) {
        // 处理单词点击事件
        // 向input页面发送消息
        window.opener.postMessage({
            type: 'word_click',
            word: word
        }, '*');
    }

    queryExistedWords() {
        // 主动请求存在单词列表
        window.opener.postMessage({
            type: 'word_query',
        }, '*');
    }

    messageReceiveService(Renderer) {
        // 接受同步input页面的单词信息
        console.log('Message Receiver Activated!');
        window.addEventListener('message', (event) => {
            console.log('接收到新的单词列表了');
            if (event.data.type === 'word_sync') {
                Renderer.existed_words = event.data.words;
                Renderer.highlightExistedWords();
            }
        });
    }
}

export {EventPossessor};
