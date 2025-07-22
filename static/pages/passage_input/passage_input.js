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

// demo
const input = document.getElementById('input-box');
let already = false;
input.addEventListener('focus', () => {
    if (already) {return;}
    setTimeout(() => {
        input.value = '';

        const passage = 'Climate prediction accuracy remains a critical challenge in environmental science. This study examines machine learning integration into traditional climate modeling frameworks. Conventional physics-based models struggle with nonlinear climate dynamics and complex atmospheric interactions. Deep learning networks, particularly recurrent neural networks and transformer architectures, demonstrate superior performance in processing temporal climate data sequences. These models identify subtle patterns in temperature, precipitation, and atmospheric pressure variations that traditional methods overlook. Preliminary findings indicate hybrid models combining physics-based approaches with machine learning components achieve 15-20% improved accuracy in short-term weather forecasting. The integration of artificial intelligence into climate modeling represents significant advancement in predictive capabilities, offering enhanced understanding of environmental systems and improved forecasting precision for climate research applications.'
        let counter = 0;
        let timer = setInterval(() => {
            input.value += passage.slice(counter, counter+10);
            counter += 10;
            if (counter>passage.length) {clearInterval(timer);}
            input.dispatchEvent(new Event('input'));
        }, 1)
        
        already = true;
    }, 300)
});
