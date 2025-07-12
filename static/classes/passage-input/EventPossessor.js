class EventPossessor {
    constructor() {
        this.input_box = document.getElementById('input-box');
        this.passage_display = document.getElementById('passage-display');
    }

    passageInputService() {
        console.log('passage service activated!');
        // 用户输入文章上传单词的服务
        this.input_box.addEventListener('input', () => {
            // 解析单词
            console.log(this.input_box.value);
            const {text_disassembly, is_start_with_vocab} = this.analyzeText(this.input_box.value);
            // 定义需要高亮的index % 2
            const highlighted_modular_res = is_start_with_vocab ? 0 : 1;
            // 遍历单词，将它们渲染到页面上
            text_disassembly.forEach((value, index) => {

            });
        });
    }

    analyzeText(text) {
        // 分析文章结构
        // 返回“是否以单词开始”
        const text_disassembly = text.match(/\w+|[^\w]+/g) // 捕捉所有连续英文字母和连续非英文字母
        const beginning = text_disassembly[0] // 获取开始字符
        return {
            text_disassembly: text_disassembly,
            is_start_with_vocab: beginning.match(/\w/g) !== null, // 开始部分包含字母
        };
    }
}

export {EventPossessor};
