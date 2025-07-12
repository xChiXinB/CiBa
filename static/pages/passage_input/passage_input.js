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
    const app = new App(R, EP);
    app.run();
}

main();
