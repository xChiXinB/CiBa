class ButtonManager {
    constructor() {
        this.clear = document.getElementById('clear');
        this.save = document.getElementById('save');
        this.registers = {};
    }

    register(application) {
        /*
        * 注册一个按钮状态变动的申请
        * application = {
        *   applier: 申请人，为已记录的单词
        *   target: 'clear' or 'save',
        *   disabled: boolean,
        *   isInstant: boolean, // 是否立即执行
        *   isExcluded: boolean or null, // 是否清除它人已注册的申请
        * }
        */
        // 清除申请
        if (application.isExcluded) {
            this.registers = {};
        }
        // 执行申请
        if (application.isInstant) {
            this.registers['instant'] = application;
            this.execute('instant');
        } else {
            const UUID = crypto.randomUUID();
            this.registers[UUID] = application;
            return UUID;
        }
    }

    execute(id) {
        if (this.registers[id] == undefined) {
            return null;
        }
        // 执行指定的申请
        (this.registers[id].target == 'clear'?
            this.clear:
            this.save)
            .disabled = this.registers[id].disabled;
        console.log(`执行了一个申请${this.registers[id]}`);
        delete this.registers[id]
        console.log(JSON.parse(JSON.stringify(this.registers)));
    }

    exclude(applier) {
        // 删除指定申请人的第一个申请
        for (let id in this.registers) {
            if (this.registers[id].applier == applier) {
                delete this.registers[id];
                return;
            }
        }
    }

    query_button(target) {
        // 查询按钮禁用状态
        return target == 'clear'?
            this.clear.disabled:
            this.save.disabled;
    }

    query_condition(func) {
        // 查询条件是否满足
        return func.call(this);
    }
}

export {ButtonManager};
