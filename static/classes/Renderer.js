// Renderer类，主要负责按钮、表格、通知的前端管理。

class Renderer {
    constructor() {
        this.clear = document.getElementById('clear');
        this.save = document.getElementById('save');
        this.table = document.getElementById('word-table');
        this.notifications_container = document.getElementById('notifications-container');
        // 用于translationAutoHeight
        this.auto_height_timeout = undefined;
        // 用于btnHoverAnim
        this.mouseover = (element) => {
            element.style.animation = 'zoom-in 0.5s ease'
            setTimeout(() => {
                element.style.transform = 'scale(1.1)';
            }, 490); // 延迟比动画少10ms是为了解决按钮大小抽搐
        };
        this.mouseleave = (element) => {
            element.style.animation = 'zoom-out 0.5s ease'
            setTimeout(() => {
                element.style.transform = 'scale(1.0)';
            }, 490);
        };
        // 用于管理动画
        this.notifications = [];
    }

    translationAutoHeight() {
        // 监听窗口变动，并时刻调整翻译textarea的高度
        window.addEventListener('resize', () => {
            // 如果resize过于频繁，就不会更改高度
            clearTimeout(this.auto_height_timeout);
            this.auto_height_timeout = setTimeout(() => {
                // 遍历table，给其中的每一个textarea加上input事件
                for (let i = 1; i < this.table.rows.length; i++) {
                    this.table
                        .rows[i].cells[2]
                        .querySelector('.translation-input')
                        .dispatchEvent(new Event('input'));
                }
            }, 250); // resize不再触发250ms后，更改高度
        });
    }

    btnHoverAnim() {
        // 加载按钮的悬停动画
        this.clear.addEventListener('mouseover', () => {this.mouseover(this.clear);});
        this.clear.addEventListener('mouseleave', () => {this.mouseleave(this.clear);});
        this.save.addEventListener('mouseover', () => {this.mouseover(this.save);});
        this.save.addEventListener('mouseleave', () => {this.mouseleave(this.save);});
    }

    disableAllBtn() {
        // 禁用所有按钮
        this.clear.disabled = this.save.disabled = true;
    }

    enableClearBtn() {
        // 启用清空按钮
        this.clear.disabled = false;
    }

    disableSaveBtn() {
        // 禁用保存按钮
        this.save.disabled = true;
    }

    tryEnableSaveBtn(DataManager) {
        // 尝试启用保存按钮
        if (Object
            .values(DataManager.vocabulary)
            .indexOf(false) === -1 && 
            Object
            .keys(DataManager.vocabulary)
            .length > 0) {
            // 有词汇，且词汇全部查询完毕
            this.save.disabled = false;
        }
    }

    insertCompleteRow(new_vocabulary) {
        // 插入表格新的一行
        const new_row = this.table.tBodies[0].insertRow(-1);
        // 补全表格cell
        for (let i = 0; i < 4; i++) {
            const cell = new_row.insertCell(-1);
            cell.className = 'table-data';
        }
        // 加入表格细节
        const { delete_btn } = this.modifyRow(new_row, new_vocabulary);
        return {
            new_row: new_row,
            delete_btn: delete_btn,
        };
    }

    modifyRow(row, vocabulary) {
        // 添加新行的细节
        // 添加动画
        row.style.animation = 'opaquely-fade-in 0.5s ease';
        // 添加部分表格内容
        row.cells[0].textContent = row.rowIndex;
        row.cells[1].textContent = vocabulary;
        // 添加释义输入框外容器
        const translation_container = document.createElement('div');
        translation_container.className = 'translation-container';
        row.cells[2].appendChild(translation_container);
        // 添加释义输入框
        const translation = document.createElement('textarea');
        translation.className = 'translation-input';
        translation_container.appendChild(translation);
        translation.value = '获取中……';
        // 添加操作按钮外容器
        const operations_container = document.createElement('div');
        operations_container.className = 'operations-container';
        row.cells[3].appendChild(operations_container);
        // 添加操作按钮
        const delete_btn = document.createElement('img');
        delete_btn.src = './static/images/delete.png';
        delete_btn.className = 'operations';
        operations_container.appendChild(delete_btn);
        // 将行滚动到视图
        translation.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
        // 自适应行高
        translation.addEventListener('input', () => {
            translation.style.height = '';
            translation.style.height = `${translation.scrollHeight}px`;
        });
        return {
            delete_btn: delete_btn
        };
    }

    addTranslation(row, translation) {
        // 补充单词的翻译信息
        const translation_textarea = row // 这一行
        .cells[2] // 的第二列
        .querySelector('.translation-input'); // 的输入框
        // 补充翻译的信息
        translation_textarea.value = translation; // 的值
        // 调整行高
        translation_textarea.dispatchEvent(new Event('input'));
        // 将行滚动到视图
        translation_textarea.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    }

    removeIndex(row_index, DataManager) {
        // 删除表格的某一行
        this.table.deleteRow(row_index);
        // 如果不剩单词，就禁用所有按钮
        if (this.table.rows.length === 1) {
            this.disableAllBtn();
        // 如果还剩单词，就尝试恢复保存按钮
        } else {
            this.tryEnableSaveBtn(DataManager);
        }
    }

    notify(message) {
        // 向用户弹出通知
        /*	伪代码
        add a new notification display
	
        define x as (get all notification displays as a list)
        for each of the item, as notification, in x:
            if index of notification in x is biggest // technically, equals to x's length minus one
                add an upward moving animation, lasting 500 ms
                add an increasing opacity animation, lasting 500 ms
                set a timeout, execute
                    remove notification
                after 450 ms
            else
                decrease notification's opacity
                if notification's opacity is zero:
                    add notification into remove list
                else
                    add an upward moving animation, lasting 500 ms

	    remove all notifications in remove list 
        伪代码结束 */

        // 创建单个通知容器
        const single_notification = document.createElement('div');
        single_notification.classList.add('notification');
        single_notification.style.opacity = '0.7';
        // 将单个通知容器放入全部通知容器中
        this.notifications_container.appendChild(single_notification);
        // 书写通知内容
        const paragraph = document.createElement('p');
        paragraph.textContent = message.toString();
        single_notification.appendChild(paragraph);
        // 创建通知之间的间隙
        const gap = document.createElement('div');
        const GAP_HEIGHT = 8;
        gap.style.height = `${GAP_HEIGHT}px`;
        this.notifications_container.appendChild(gap);
        // 修改动画数据
        this.notifications.push({
            element: single_notification,
            animation: undefined,
        });
        // 提前计算新通知高度
        const NEW_HEIGHT = Number(
            getComputedStyle(single_notification).getPropertyValue('height')
        );

        // 遍历通知
        const notification_list = this.notifications.map(value => value.element);
        const remove_list = []; // 删除列表
        debugger;
        notification_list.forEach((value, key, parent) => {
            if (key === parent.length - 1) {
                // 新通知
                // 添加动画
                const { keyframes, options } = this.getAnimation(0, 0.7, 40, 0);
                this.notifications[key].animation = value.animate(keyframes, options);
                // 延迟后清除通知
                setTimeout(() => {
                    const { keyframes, options } = this.getAnimation(undefined, 0, 0, 40);
                    this.notifications[key].animation = value.animate(keyframes, options);
                    setTimeout(() => {
                        value.remove();
                        this.notifications.splice(key, 1);
                    }, 450);
                }, 5000);
            } else {
                // 降低透明度
                const computedStyle = getComputedStyle(value);
                let opacity = Number(computedStyle.getPropertyValue('opacity'));
                const OPACITY_DECREMENT = 0.2;
                if (opacity < OPACITY_DECREMENT) {
                    value.style.opacity = 0;
                } else {
                    value.style.opacity = opacity - OPACITY_DECREMENT;
                }
                // 根据最终透明度，移除元素或加动画
                opacity = computedStyle.getPropertyValue('opacity');
                if (opacity === 0) {
                    // 加入移除队列
                    remove_list.push(key);
                } else {
                    // 动态计算偏移高度，施加动画
                    let initial_translateY = NEW_HEIGHT + GAP_HEIGHT;
                    if (this.notifications[key].animation.playState !== 'finished') {
                        this.notifications[key].animation.finish();
                    }
                    const { keyframes, options } = this.getAnimation(undefined, undefined, initial_translateY, 0);
                    this.notifications[key].animation = value.animate(keyframes, options);
                }
            }
        });
        // // 添加动画
        // single_notification.classList
        //     .add('translationally-fade-in', 'opaquely-fade-in');
        // // 延迟5秒，播放出场动画
        // setTimeout(() => {
        //     single_notification.classList
        //         .remove('translationally-fade-in', 'opaquely-fade-in');
        //     single_notification.classList
        //         .add('translationally-fade-out', 'opaquely-fade-out');
        //     // 再延迟0.45秒，删除通知和缝隙
        //     setTimeout(() => {
        //         single_notification.remove();
        //         gap.remove();
        //     }, 450);
        // }, 5000);
        // 渐隐远古通知，防止通知溢出
        // this.notifications_container
        //     .querySelectorAll('.notification')
        //     .forEach((element, index, arr) => {
        //         // 再调整透明度
        //         const opacity = Number(element.style.opacity);
        //         // 如果element的序号是最后一个，则不更改
        //         if (index === arr.length - 1) {
        //             ;
        //         } else {
        //             // 移除透明度动画
        //             element.classList.remove('opaquely-fade-in');
        //             if (opacity < 0.2) {
        //             // 如果opacity过小，就设为0    
        //                 element.style.opacity = 0;
        //             } else {
        //             // 如果都不是，就把opacity减小0.2
        //                 element.style.opacity = opacity - 0.2;
        //             }
        //         }
        //     });
    }

    getAnimation(initial_opacity, final_opacity, initial_translateY, final_translateY) {
        // 自动化返回关键帧和选项
        const options = {
            duration: 3000,
            iterations: 1,
            easing: 'ease',
        }
        // 组装关键帧
        const keyframes = [];
        const keyframe1 = {};
        const keyframe2 = {};
        if (initial_opacity !== undefined) {
            keyframe1.opacity = initial_opacity;
        }
        keyframe1.transform = `translateY(${initial_translateY}px)`;
        if (final_opacity !== undefined) {
            keyframe2.opacity = final_opacity;
        }
        keyframe2.transform = `translateY(${final_translateY}px)`;
        keyframes.push(keyframe1, keyframe2)
        return {
            keyframes: keyframes,
            options: options,
        };
    }
}

export {Renderer};
