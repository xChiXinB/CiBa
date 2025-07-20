// passage_input.js

import {Renderer as R} from '../../classes/passage-input/Renderer.js'
import {EventPossessor as EP} from '../../classes/passage-input/EventPossessor.js'

class App {
    constructor(R, EP) {
        this.r = new R();
        this.ep = new EP();
    }

    run() {
        // 运行从文章输入页面
        this.ep.passageInputService();
    }
}

function main() {
    // 检查是否通过input页面打开
    if (!window.opener) {
        // 直接访问，阻止正常显示
        // 清空body内容
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // 创建提示元素
        const placeholderDiv = document.createElement('div');
        placeholderDiv.style.textAlign = 'center';
        placeholderDiv.style.padding = '50px';
        placeholderDiv.style.fontSize = '24px';
        placeholderDiv.style.color = '#ef4444';
        placeholderDiv.textContent = 'placeholder';
        document.body.appendChild(placeholderDiv);
        return;
    }
    
    const app = new App(R, EP);
    app.run();
}

main();
