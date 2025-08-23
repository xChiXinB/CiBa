// LeftSidebarAnimator.js

class LeftSidebarAnimator {
    constructor() {
        // 获取DOM元素
        this.left_sidebar = document.querySelector('.left');
        this.content = document.querySelector('.content');
        this.toggle_button = this.left_sidebar.querySelector('.left-toggle-btn');
        this.children = Array.from(this.left_sidebar.children).filter(e => !e.classList.contains('left-toggle-btn'));
        this.mask = document.querySelector('.sidebar-mask');

        // 配置信息
        this.duration = 500; // 动画时长（ms）
        this.userCollapsed = false; // 用户主动折叠意愿
        // 动画状态统一管理，键为模块名，值为动画（数组）
        this.animations = {
            sidebar: undefined,
            content: undefined,
            mask: undefined
        };
        // 元素状态管理
        this.sidebar_status = 'extended'; // 'extending' | 'collapsed' | 'collapsing'
        this.mask_status = 'hidden'; // 'existed'

        this.lastIsLargeScreen = true; // 记录上一次是否宽屏
    }

    /**
     * 入口初始化，绑定按钮和resize事件
     */
    initialize() {
        // 按钮和遮罩
        this.toggle_button.addEventListener('click', () => {
            this.handleUserToggle();
        });
        this.mask.addEventListener('click', () => {
            this.handleUserToggle();
        });

        // 宽口宽度变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 初始化响应式
        this.handleResize();
    }

    /**
     * 播放侧边栏（含子元素、按钮）动画
     * @param {'collapsed'|'expanded'} targetState 目标状态
     * @param {boolean} fromCurrent 是否从当前位置出发
     */
    animateSidebar(targetState, fromCurrent = false) {
        let from, to;
        // 根据fromCurrent的值计算from
        if (fromCurrent) {
            // 读取当前transform，确保动画打断时进度连续
            const style = window.getComputedStyle(this.left_sidebar);
            const matrix = new DOMMatrixReadOnly(style.transform);
            const tx = matrix.m41;
            from = Math.abs(tx) / 340;
            // 终止现有动画，防止冲突
            if (this.animations.sidebar !== undefined) {
                this.animations.sidebar.forEach((anim) => {
                    //anim.finish();
                    anim.cancel();
                });
            }
            delete this.animations.sidebar;
        } else {
            from = (targetState === 'collapsed') ? 0 : 1;
        }
        // 根据targetState决定to
        to = (targetState === 'collapsed') ? 1 : 0;

        this.sidebar_status = (targetState === 'collapsed') ? 'collapsing' : 'extending';
        // 主体滑动动画
        const sidebarAnim = this.left_sidebar.animate([
            { transform: `translateX(${-340 * from}px)` },
            { transform: `translateX(${-340 * to}px)` }
        ], {
            duration: this.duration,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4,0,0.2,1)'
        });
        // 子元素缩放动画
        const childrenAnims = this.children.map(child => // 使用map构建子元素动画数组
            child.animate([
                { transform: `scale(${1 - 0.7 * from})` },
                { transform: `scale(${1 - 0.7 * to})` }
            ], {
                duration: this.duration,
                fill: 'forwards',
                easing: 'cubic-bezier(0.4,0,0.2,1)'
            })
        );
        // 按钮旋转动画
        const btnAnim = this.toggle_button.querySelector('img').animate([
            { transform: `rotate(${from * -180}deg)` },
            { transform: `${to === 1 ? 'rotate(-180deg)' : 'rotate(0deg)'}` }
        ], {
            duration: this.duration,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4,0,0.2,1)'
        });
        // 统一存入动画状态，便于打断和判断
        this.animations.sidebar = [sidebarAnim, ...childrenAnims, btnAnim];
        sidebarAnim.onfinish = () => {
            // 动画结束后及时清理状态
            delete this.animations.sidebar;
            this.sidebar_status = (targetState === 'collapsed') ? 'collapsed' : 'extended';
        };
    }

    /**
     * 播放content的margin-left动画
     * @param {number} targetMargin 目标margin-left
     * @param {boolean} fromCurrent 是否从当前位置出发
     */
    animateContentMargin(targetMargin, fromCurrent = false) {
        let from;
        // 计算from
        if (fromCurrent) {
            // 读取当前margin-left，确保动画打断时进度连续
            const style = window.getComputedStyle(this.content);
            from = parseFloat(style.marginLeft);
            if (this.animations.content !== undefined) {
                this.animations.content.forEach((anim) => {
                    //anim.finish();
                    anim.cancel();
                });
            }
            delete this.animations.content;
        } else {
            // 从头播放
            from = (targetMargin === 60) ? 400 : 60;
        }
        // margin-left动画
        const contentAnim = this.content.animate([
            { marginLeft: `${from}px`, width: `calc(100% - ${from}px)` },
            { marginLeft: `${targetMargin}px`, width: `calc(100% - ${targetMargin}px)` }
        ], {
            duration: this.duration,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4,0,0.2,1)'
        });
        this.animations.content = [contentAnim];
        contentAnim.onfinish = () => {
            delete this.animations.content;
        };
    }

    /**
     * 播放遮罩的渐入渐出动画
     * @param {boolean} targetVisibility 目标是否可见
     * @param {boolean} fromCurrent 是否从当前位置出发
     */
    animateMask(targetVisibility, fromCurrent = false) {
        let from, to;
        // 计算from和to
        if (fromCurrent) {
            // 读取当前opacity，确保动画打断时进度连续
            const style = window.getComputedStyle(this.mask);
            from = parseFloat(style.opacity);
            if (this.animations.mask !== undefined) {
                this.animations.mask.forEach((anim) => {
                    //anim.finish();
                    anim.cancel();
                });
                delete this.animations.mask;
            }
        } else {
            from = targetVisibility ? 0 : 1;
        }
        to = targetVisibility ? 1 : 0;

        // 更改遮罩可点击性
        if (targetVisibility) {
            this.mask.style.pointerEvents = 'auto';
            this.mask_status = 'existed';
        } else {
            this.mask.style.pointerEvents = 'none';
            this.mask_status = 'hidden';
        }

        // 播放动画
        const maskAnim = this.mask.animate([
            { opacity: from },
            { opacity: to},
        ], {
            duration: this.duration,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4,0,0.2,1)'
        });
        this.animations.mask = [maskAnim];
        maskAnim.onfinish = () => {
            delete this.animations.mask;
        }
    }

    /**
     * 响应窗口resize事件，只有首次越过1200px界限时才触发动画和状态响应
     */
    handleResize() {
        // 判断屏幕越界
        const isLargeScreen = window.innerWidth >= 1200;
        if (isLargeScreen === this.lastIsLargeScreen) return;
        this.lastIsLargeScreen = isLargeScreen;

        // 处理动画
        // 注意此处逻辑比较复杂，略去注释！
        if (!isLargeScreen) {
            // 小屏
            if (!this.haveAnimation()) {
                if (this.sidebar_status === 'extended') {
                    this.animateSidebar('collapsed', false);
                    this.animateContentMargin(60, false);
                }
            } else {
                if (this.sidebar_status === 'collapsing') {

                } else {
                    this.animateSidebar('collapsed', true);
                    this.animateContentMargin(60, true);
                }
            }
        } else {
            // 大屏
            if (this.userCollapsed) return;
            if (!this.haveAnimation()) {
                this.animateContentMargin(400, false);
                if (this.sidebar_status === 'extended') {
                    this.animateMask(false, false);
                    this.userCollapsed = false;
                } else {
                    this.animateSidebar('expanded', false);
                }
            } else {
                this.animateContentMargin(400, true);
                if (this.sidebar_status === 'extending') {
                    this.animateMask(false, true);
                    this.userCollapsed = false;
                } else {
                    this.animateSidebar('expanded', true);
                }
            }
        }
    }

    /**
     * 响应用户点击按钮或遮罩，按状态机调度动画
     */
    handleUserToggle() {
        if (this.sidebar_status === 'collapsed' || this.sidebar_status === 'collapsing') {
            // 边栏已折叠或正在折叠
            this.animateSidebar('expanded', true);
            if (window.innerWidth > 1200) {
                this.animateContentMargin(400, true);
                this.userCollapsed = false;
            } else {
                this.animateMask(true, true);
            }
        } else {
            // 当前为展开或正在展开
            this.animateSidebar('collapsed', true);
            if (this.mask_status === 'existed') {
                this.animateMask(false, true);
            } else {
                this.animateContentMargin(60, true);
            }
            if (window.innerWidth > 1200) {
                this.userCollapsed = true;
            }
        }
    }

    haveAnimation() {
        // 返回当前是否有动画播放
        let have_animations = true;
        if (this.animations.sidebar === undefined) {
            if (this.animations.content === undefined) {
                if (this.animations.mask === undefined) {
                    // 所有动画都没有，返回假
                    have_animations = false;
                }
            }
        }
        return have_animations;
    }
}

export {LeftSidebarAnimator};
