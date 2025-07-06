//    _____ _ ____        
//   / ____(_)  _ \       
//  | |     _| |_) | __ _ 
//  | |    | |  _ < / _` |
//  | |____| | |_) | (_| |
//   \_____|_|____/ \__,_|
//
//   ____                             _       
//  |  _ \            /\             | |      
//  | |_) |_   _     /  \   _ __   __| |_   _ 
//  |  _ <| | | |   / /\ \ | '_ \ / _` | | | |
//  | |_) | |_| |  / ____ \| | | | (_| | |_| |
//  |____/ \__, | /_/    \_\_| |_|\__,_|\__, |
//          __/ |                        __/ |
//         |___/                        |___/ 

// 导入模块
import { UserEventHandler as UEH } from "./classes/UserEventHandler.js";
import { Renderer as R } from "./classes/Renderer.js";
import { NetworkManager as NM } from "./classes/NetworkManager.js";
import { DataManager as DM } from "./classes/DataManager.js";

// 定义主应用
class App {
    constructor(UEH, R, NM, DM) {
        // 创建模块实例
        this.ueh = new UEH();
        this.r = new R();
        this.nm = new NM();
        this.dm = new DM();
    }

    run() {
        // 应用运行主程序

        // 监听窗口变动
        console.log('Resizing listening in progress!');
        this.r.translationAutoHeight();

        // 禁用全部按钮
        console.log('Button disabled!');
        this.r.disableAllBtn();

        // 加载按钮动画
        console.log('Interactive animation initialized!');
        this.r.btnHoverAnim();

        // 监听提交单词行为
        console.log('Running in progress!');
        this.ueh.vocabSubmitService(this.dm, this.r, this.nm);

        // 保存按钮功能运行
        // 清空按钮功能运行
        console.log('Button function activated!');
        this.ueh.buttonServices(this.dm, this.r);

    }
}

// 定义主程序
function main() {
    const app = new App(UEH, R, NM, DM);
    app.run();
}

// 运行
main();
