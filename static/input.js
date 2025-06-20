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

// 定义主程序
class Main {
    constructor(UEH, R, NM, DM) {
        // 创建模块实例
        this.ueh = new UEH();
        this.r = new R();
        this.nm = new NM();
        this.dm = new DM();
    }

    run() {
        // 监听提交单词行为
        console.log('Running in progress!');
        this.ueh.vocabSubmitService(this.dm, this.r, this.nm);
    }
}

function main() {
    const app = new Main(UEH, R, NM, DM);
    app.run();
}

main();

// import { ButtonManager as BM } from "./classes/ButtonManager.js";

// function input_word(information) {
//     /*
//     * 1. 查询单词释义
//     * 2. 增加表格内容
//     */
//     // return条件
//     const input_box = document.getElementById('input-box');
//     if (document.activeElement != input_box) {
//         // 焦点不在输入框
//         return;
//     }
//     const new_word = input_box.value;
//     if (new_word == '' ) {
//         // 输入为空
//         return;
//     }
//     const word_table = document.getElementById('word-table');
//     const index = information.words.indexOf(new_word);
//     if (index != -1) {
//         // 输入重复
//         const existed_translation = word_table.rows[index + 1].cells[2]
//             .querySelector('.translation-container')
//             .querySelector('.translation-input')
//             .value;
//         notice([
//             {
//                 type: 'text',
//                 content: `${new_word}重复！释义：
//                     ${existed_translation.length > 10?
//                         existed_translation.slice(0, 10) + '...':
//                         existed_translation
//                     }`, // 截取释义的前十个字符
//             },
//         ]);
//         input_box.value = '';
//         console.log(information.words.indexOf(new_word));
//         return;
//     }
//     const latest_input_time = parseInt(word_table.rows[word_table.rows.length - 1].id);
//     if (Date.now() - latest_input_time <= 2000) {
//         // 两次单词输入间隔小于2秒
//         notice([
//             {
//                 type: 'text',
//                 content: '操作过于频繁，请稍后再试。',
//             },
//         ]);
//         return;
//     }
//     console.log(`输入了单词：${new_word}`);
//     // 禁用保存按钮，并申请后续的启用
//     information.bm.register({
//         target: 'save',
//         disabled: true,
//         isInstant: true,
//     });
//     const UUID = information.bm.register({
//         applier: new_word,
//         target: 'save',
//         disabled: false,
//         isInstant: false,
//     });
//     // 启用清空按钮
//     if (information.bm.query_button('clear')) {
//         information.bm.register({
//             target: 'clear',
//             disabled: false,
//             isInstant: true,
//         });
//     }
//     // 新增一行表格
//     const new_row = table({
//         method: 'insert',
//         index: -1,
//     });
//     // 修改序号内容
//     new_row.cells[0].innerHTML = new_row.rowIndex;
//     // 修改单词内容
//     new_row.cells[1].innerHTML = new_word;
//     // 访问Python服务器，展示释义内容
//     // 创建释义输入框外包
//     const translation_container = document.createElement('div');
//     translation_container.className = 'translation-container';
//     new_row.cells[2].appendChild(translation_container);
//     // 创建释义输入框本体
//     const translation_input = document.createElement('textarea');
//     translation_input.className = 'translation-input';
//     translation_input.value = '获取中……';
//     translation_container.appendChild(translation_input);
//     // 滚动到视图
//     translation_input.scrollIntoView({
//         behavior: 'smooth',
//         block: 'end',
//     });
//     // 事件监视器（自适应更改高度）
//     translation_input.addEventListener('input', () => {
//         translation_input.style.height = '';
//         translation_input.style.height = `${translation_input.scrollHeight}px`;
//     });
//     fetch(`http://${location.host}/vocab/${new_word}`, {
//         headers: {
//             "Authorization": "Bearer abc123",
//         }
//     })
//         .then((res) => {
//             return res.text();
//         })
//         .then((translation) => {
//             translation_input.value = translation;
//         })
//         .catch((e) => {
//             translation_input.value = '未找到';
//             notice([
//                 {
//                     type: 'text',
//                     content: `出现错误：${e}`,
//                 },
//             ]);
//         })
//         .finally(() => {
//             // 调整textarea高度
//             translation_input.dispatchEvent(new Event('input'));
//             // 滚动到视图
//             translation_input.scrollIntoView({
//                 behavior: 'smooth',
//                 block: 'end',
//             });
//             // 尝试解禁按钮
//             information.bm.execute(UUID);
//             console.log('fetch的finally结束');
//         });
//     // 修改操作内容
//     const operations_container = document.createElement('div');
//     operations_container.className = 'operations-container';
//     new_row.cells[3].appendChild(operations_container);
//     const to_delete = document.createElement('img');
//     to_delete.src = './static/images/delete.png';
//     to_delete.style.height = '18px';
//     operations_container.appendChild(to_delete);
//     // 创建按钮的事件监视器
//     const delete_mouseover = information.callbacks.mouseover.bind(null, to_delete);
//     const delete_mouseleave = information.callbacks.mouseleave.bind(null, to_delete);
//     const delete_click = information.callbacks.delete_click.bind(null, to_delete);
//     to_delete.addEventListener('mouseover', delete_mouseover);
//     to_delete.addEventListener('mouseleave', delete_mouseleave);
//     to_delete.addEventListener('click', delete_click);
//     // 收尾工作
//     information.words.push(new_word);
//     input_box.value = '';
// }

// function table(operation) {
//     /*
//     * operation = {
//     *   method: 'insert' or 'delete',
//     *   index: int,
//     * }
//     * 增加或删除词表
//     */
//     // 处理异常
//     if (typeof operation.index != 'number') {
//         throw new TypeError('索引应为整数！')
//     }
//     const word_table = document.getElementById('word-table');
//     switch (operation.method) {
//         case 'insert':
//             const new_row = word_table.tBodies[0].insertRow(operation.index);
//             for (let i = 0; i < 4 ; i++) { // i < 4 因为表格只有四列
//                 new_row.insertCell(i).className = 'table-data';
//                 new_row.id = Date.now()
//             }
//             new_row.style.animation = 'opaquely-fade-in 0.5s ease';
//             return new_row;
//         case 'delete':
//             const word = word_table.rows[operation.index].cells[1].textContent;
//             console.log(word);
//             notice([
//                 {
//                     type: 'text',
//                     content: `已删除单词 ${word} ！`,
//                 },
//             ]);
//             word_table.deleteRow(operation.index);
//             if (word_table.rows.length == 1) {
//                 // 处理表格为空
//                 return;
//             } else {
//                 // 处理表格序列
//                 for (let i = operation.index; i < word_table.rows.length; i++) {
//                     word_table.rows[i].cells[0].textContent = i;
//                 }
//             }
//             return;
//         default:
//             throw new ReferenceError(`方法${operation.method}未被定义！`);
//             return;
//     }
// }

// function notice(components) {
//     /*
//     * components = [
//     *   {
//     *   type: 'text' or 'event',
//     *   content: str,
//     *   callback: null or function,
//     *   }, more...
//     * ]
//     */
//     const notification = document.createElement('div');
//     notification.className = 'notification';
//     document.getElementById('notifications-container').appendChild(notification);
//     notification.style.animation = 'fade-in 0.5s ease';
//     // 遍历通知成分
//     for (let i = 0; i < components.length; i++) {
//         // 添加段落
//         let new_p = document.createElement('p');
//         new_p.innerHTML = components[i].content
//         new_p.className = 'notification-text';
//         notification.appendChild(new_p);
//         if (components[i].type == 'event') {
//             // 绑定事件
//             new_p.addEventListener('click', components[i].callback);
//             // 样式
//             new_p.style.fontWeight = 'bolder';
//             new_p.style.textDecoration = 'underline';
//             // 5秒后删除事件
//             setTimeout(() => {
//                 new_p.removeEventListener('click', components[i].callback);
//             }, 5000);
//         }
//         // 5.5秒后删除段落
//         setTimeout(() => {
//             new_p.remove();
//         }, 5500);
//     }
//     // 5秒后播放出场动画
//     setTimeout(() => {
//         notification.style.animation = 'fade-out 0.5s ease';
//     }, 5000);
//     // 5.5秒后隐藏通知
//     setTimeout(() => {
//         notification.remove();
//     }, 5500);
// }
/* */
// function main() {
//     // 初始化
//     const word_table = document.getElementById('word-table');
//     const clear = document.getElementById('clear');
//     const save = document.getElementById('save');
//     const information = {
//         words: [],
//         bm: new BM(),
//         callbacks: {
//             mouseover: (element) => {
//                 element.src = `${element.src.slice(0, -4)}_over.png`;
//             },
//             mouseleave: (element) => {
//                 element.src = `${element.src.slice(0, -9)}.png`; // 裁掉_over字段
//             },
//             delete_click: (element) => {
//                 debugger;
//                 // 需要从图片元素开始，找到自己所在行的索引
//                 const index = element.closest('tr').rowIndex;
//                 const applier = element.closest('tr').cells[1].textContent;
//                 information.words.splice(index - 1, 1); // 删除第index-1个单词
//                 table({
//                     method: 'delete',
//                     index: index,
//                 });
//                 // 删除未完成的申请
//                 information.bm.exclude(applier);
//                 // 确定按钮的状态
//                 const register_num = information.bm.query_condition(function() {
//                     return Object.keys(this.registers).length;
//                 });
//                 if (register_num == 0) {
//                     // 如果没有正在查询的单词，那么恢复save按钮
//                     information.bm.register({
//                         target: 'save',
//                         disabled: false,
//                         isInstant: true,
//                     });
//                 }
//             },
//         },
//     }; // 传递变量
/* */
//     // 监听Enter键和Ctrl+V
//     document.addEventListener('keydown', (res) => {
//         if (res.key == 'Enter') {
//             input_word(information);
//         }
//         if ((res.ctrlKey || res.metaKey) && res.key == 'v') {
//             setTimeout(() => {
//                 input_word(information);
//             }, 10);
//         }
//     });
    
//     // 监听窗口变动
//     let timeout;
//     window.addEventListener('resize', () => {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => {
//             for (let i = 1; i < word_table.rows.length; i++) {
//                 word_table.rows[i].cells[2]
//                     .querySelector('.translation-container')
//                     .querySelector('.translation-input')
//                     .dispatchEvent(new Event('input'));
//             }
//         }, 250);
//     });
//     // 按钮覆盖动画
//     const zoom_in = (element) => {
//         element.style.animation = 'zoom-in 0.5s ease'
//         setTimeout(() => {
//             element.style.transform = 'scale(1.1)';
//         }, 490); // 延迟比动画少10ms是为了解决按钮大小抽搐
//     }
//     const zoom_out = (element) => {
//         element.style.animation = 'zoom-out 0.5s ease'
//         setTimeout(() => {
//             element.style.transform = 'scale(1.0)';
//         }, 490);
//     }
//     clear.addEventListener('mouseover', () => {zoom_in(clear)});
//     save.addEventListener('mouseover', () => {zoom_in(save)});
//     clear.addEventListener('mouseleave', () => {zoom_out(clear)});
//     save.addEventListener('mouseleave', () => {zoom_out(save)});
//     // 禁用按钮
//     clear.disabled = save.disabled = true;
//     // 保存按钮功能
//     save.addEventListener('click', () => {
//         // 修改表格
//         word_table.rows[0].cells[3].innerHTML = '';
//         for (let i = 1; i < word_table.rows.length; i++) {
//             const translation = word_table.rows[i].cells[2].querySelector('textarea').value;
//             word_table.rows[i].cells[2].querySelector('textarea').remove();
//             word_table.rows[i].cells[2].innerHTML = translation;
//         }
//         const workbook = XLSX.utils.table_to_book(word_table);
//         const name = `生词记录${new Date()}.xlsx`;
//         XLSX.writeFile(workbook, name);
//         notice([
//             {
//                 type: 'text',
//                 content: '已保存表格到本地！',
//             },
//         ]);
//         word_table.rows[0].cells[3].innerHTML = '操作';
//         clear.dispatchEvent(new Event('click'));
//     });
//     // 清空按钮功能
//     clear.addEventListener('click', () => {
//         // 注意删除过程中表格的动态变化
//         const length = word_table.rows.length;
//         for (let i = 1; i < length; i++) {
//             word_table.deleteRow(1);
//         }
//         notice([
//             {
//                 type: 'text',
//                 content: '已清空表格！',
//             },
//         ]);
//         // 清空后禁用按钮
//         for (let target of ['clear', 'save']) {
//             information.bm.register({
//                 target: target,
//                 disabled: true,
//                 isInstant: true,
//                 isExcluded: true,
//             });
//         }
//     });
// };

// main();
