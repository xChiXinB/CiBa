class EventPossessor {
    constructor() {
        this.input_box = document.getElementById('input-box');
        this.passage_display = document.getElementById('passage-display');
        this.text_disassembly = this.is_start_with_vocab = null;
    }

    passageInputService() {
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
            // 遍历单词，将它们渲染到页面上
            this.text_disassembly.forEach((value, index) => {
                // 创建DOM元素
                const span = document.createElement('span')
                span.classList.add('passage-span');
                // 填充元素内容和高亮
                span.textContent = value;
                if (index % 2 === highlighted_modular_res) {
                    span.classList.add('passage-span-highlight');
                }
                // 放置元素
                this.passage_display.appendChild(span);
            });
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
}

export {EventPossessor};
