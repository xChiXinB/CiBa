class Renderer {
    constructor() {
        this.passage_display = document.getElementById('passage-display');
        this.existed_words = [];
    }

    renderPassage(text_disassembly, highlighted_modular_res, handleWordClick) {
        // 渲染文章
        text_disassembly.forEach((value, index) => {
            // 创建DOM元素
            const span = document.createElement('span')
            span.classList.add('passage-span');
            // 填充元素内容和高亮
            span.textContent = value;
            if (index % 2 === highlighted_modular_res) {
                span.classList.add('passage-span-highlight');
                // 为高亮的单词添加点击事件
                span.addEventListener('click', () => {
                    handleWordClick(value);
                });
            }
            // 放置元素
            this.passage_display.appendChild(span);
        });
        // 高亮单词
        this.highlightExistedWords();
    }

    highlightExistedWords() {
        // 获取所有单词节点
        const spans = Array.from(this.passage_display.getElementsByTagName('span')).filter((element) =>
            // 过滤仅有passage-span的元素
            element.className !== 'passage-span'
        );
        console.log(spans);
        spans.forEach((span) => {
            if (this.existed_words.includes(span.textContent)) {
                span.classList.add('existed-span-highlight');
                span.classList.remove('passage-span-highlight');
            } else {
                span.classList.add('passage-span-highlight');
                span.classList.remove('existed-span-highlight');
            }
        });
    }
}

export {Renderer};
