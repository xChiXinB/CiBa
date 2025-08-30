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
import { UserEventHandler as UEH } from "../../classes/input/UserEventHandler.js";
import { Renderer as R } from "../../classes/input/Renderer.js";
import { NetworkManager as NM } from "../../classes/input/NetworkManager.js";
import { DataManager as DM } from "../../classes/input/DataManager.js";
import { LeftSidebarAnimator as LSA } from "../../classes/input/LeftSidebarAnimator.js";

// 定义主应用
class App {
    constructor(UEH, R, NM, DM, LSA) {
        this.ueh = new UEH();
        this.r = new R();
        this.nm = new NM();
        this.dm = new DM();
        // 侧边栏动画管理
        this.lsa = new LSA();
    }

    run() {
        // 应用运行主程序
        // 监听窗口变动
        console.log('Resizing listening in progress!');
        this.r.translationAutoHeight();
        // 输入框聚焦
        this.ueh.inputBoxAutoFocus();
        // 禁用全部按钮
        console.log('Button disabled!');
        this.r.disableAllBtn();
        // 加载按钮动画
        console.log('Interactive animation initialized!');
        this.r.btnHoverAnim();
        // 监听提交单词行为
        console.log('Running in progress!');
        this.ueh.vocabSubmitService(this.dm, this.r, this.nm);
        // 按钮功能运行
        console.log('Button function activated!');
        this.ueh.buttonServices(this.dm, this.r);
        // 文章录入功能运行
        console.log('Import from passage activated!');
        this.ueh.listenPassageInput(this.dm, this.r, this.nm);
        // 侧边栏动画初始化
        this.lsa.initialize();
    }

    test() {
        this.dm.test();
    }
}

// 定义主程序
function main() {
    const app = new App(UEH, R, NM, DM, LSA);
    app.run();
    app.test();
}

// 运行
main();
