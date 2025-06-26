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
        this.notificationsData = {
            // id: {
            //     element: element,
            //     opacity: number,
            //     animation: Animation,
            // },
        };
        this.animationLength = 500;
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
        // 创建新通知
        const new_height_offset = this.addNotificationObj(message);

        // 遍历通知
        const notification_list = Object.values(this.notificationsData).map(
            value => value.element
        );
        notification_list.forEach((value, key, parent) => {
            // 获取这个通知的id
            const id = value.id
            console.group(id);
            // 根据通知的新旧程度进行不同操作
            if (key === parent.length - 1) {
                console.log('新通知');
                // 新通知
                // 添加动画
                const final_opacity = this.notificationsData[id].opacity;
                console.log('应该把透明度设置为：');
                console.log(final_opacity);
                const { keyframes, options } = this.getAnimation(id, final_opacity, 0);
                console.log(keyframes);
                console.log(options);
                this.notificationsData[id].animation = value.animate(keyframes, options);
                // 添加事件监视器
                this.notificationsData[id].animation.addEventListener('finish', () => {
                    // 注意动画可能已经被删除
                    console.log('这个动画似乎结束了');
                    this.notificationsData[id]?.animation.commitStyles();
                    this.notificationsData[id]?.animation.cancel();
                });
                console.log('设置了删除timeout');
                this.removeNotificationTimeout(id, true)
            } else {
                console.log('旧通知');
                // 旧通知
                // 降低透明度
                let opacity = this.notificationsData[id].opacity;
                const OPACITY_DECREMENT = 0.2;
                if (opacity < OPACITY_DECREMENT) {
                    opacity = 0;
                } else {
                    opacity = opacity - OPACITY_DECREMENT;
                }
                this.notificationsData[id].opacity = opacity;

                // 添加上移动动画
                const currentTranslateY = this.getTranslateY(id);
                // 取消旧动画
                this.notificationsData[id].animation.commitStyles();
                this.notificationsData[id].animation.cancel();
                value.style.transform = `translateY(${currentTranslateY + new_height_offset}px)`;
                const { keyframes, options } = this.getAnimation(id, this.notificationsData[id].opacity, 0);
                // 更新新动画
                this.notificationsData[id].animation = value.animate(keyframes, options);
                // 添加事件监视器
                this.notificationsData[id].animation.addEventListener('finish', () => {
                    this.notificationsData[id]?.animation.commitStyles();
                    this.notificationsData[id]?.animation.cancel();
                    // 如果透明度为零，移除自己
                    if (this.notificationsData[id]?.opacity === 0) {
                        this.removeNotificationTimeout(id, false);
                    }
                });
            }
            console.groupEnd(id)
        });
    }

    addNotificationObj(message) {
        // 创建单个通知和缝隙容器
        const notification_and_gap = document.createElement('div');
        notification_and_gap.classList.add('notification-and-gap');
        this.notifications_container.appendChild(notification_and_gap);
        // 注册信息
        const id = crypto.randomUUID();
        this.notificationsData[id] = {
            element: notification_and_gap,
            opacity: 0.7,
        };
        notification_and_gap.id = id;

        // 创建单个通知
        const single_notification = document.createElement('div');
        single_notification.classList.add('notification');
        // 将单个通知容器放入全部通知容器中
        notification_and_gap.appendChild(single_notification);
        // 书写通知内容
        const paragraph = document.createElement('p');
        paragraph.textContent = message.toString();
        single_notification.appendChild(paragraph);
        // 创建通知之间的间隙
        const gap = document.createElement('div');
        const GAP_HEIGHT = 8;
        gap.style.height = `${GAP_HEIGHT}px`;
        notification_and_gap.appendChild(gap);

        // 提前计算新通知高度
        const NEW_HEIGHT = Number(
            getComputedStyle(notification_and_gap).getPropertyValue('height')
                .match(/[+-]?\d+(\.\d+)?/)[0] // 提取数字
        );
        return NEW_HEIGHT;
    }

    getAnimation(id, final_opacity, final_translateY) {
        // 自动化返回关键帧和选项
        const options = {
            duration: this.animationLength,
            iterations: 1,
            fill: 'forwards',
            easing: 'ease',
        };

        // 组装关键帧
        const keyframes = [];
        const keyframe1 = {};
        const keyframe2 = {};
        // 从现在的transform开始
        console.log(id);
        keyframe1.transform = getComputedStyle(document.getElementById(id))
            .getPropertyValue('transform');
        keyframe2.opacity = final_opacity;
        keyframe2.transform = `translateY(${final_translateY}px)`;
        keyframes.push(keyframe1, keyframe2)
        return {
            keyframes: keyframes,
            options: options,
        };
    }

    removeNotificationTimeout(id, displayAnimation) {
        // 移除一个通知
        const targetNotification = document.getElementById(id);
        // 计算timeout时间
        const delayTime = displayAnimation ? 5000 : 0;
        const removeDelayTime = displayAnimation ? this.animationLength : 0;

        setTimeout(() => {
            if (displayAnimation) {
                // 播放出场动画
                const { keyframes, options } = this.getAnimation(id, 0, 40)
                targetNotification.animate(keyframes, options);
            }
            // 移除注册信息
            delete this.notificationsData[id];
            // 彻底移除通知
            setTimeout(() => {
                targetNotification.remove();
            }, removeDelayTime);
        }, delayTime);
    }

    getTranslateY(id) {
        console.group('获取tY');
        // 获取一个元素的TranslateY
        const targetNotification = document.getElementById(id);
        console.log(
            getComputedStyle(targetNotification).getPropertyValue('transform')
        );
        const transform = getComputedStyle(targetNotification).getPropertyValue('transform')
            .match(/[+-]?\d+(\.\d+)?/g);
        console.groupEnd('获取tY');
        return Number(
            transform[transform.length - 1]
        );
    }
}

export {Renderer};
