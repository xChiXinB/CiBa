class DataManager {
    constructor() {
        this.vocabulary = new Map(
            // vocabulary: value,
            // ......
            //
            // value可能的值：
            // true（查询完毕）；
            // false（未查询完毕）；
            // undefined （不存在）；
            // 'errored' （出现错误）；
        );
    }

    test() {
        // 保存原始方法
        const originalSet = Map.prototype.set;
        const originalDelete = Map.prototype.delete;
        const originalClear = Map.prototype.clear;

        function logMap(map, action, key, value) {
            const entries = Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v }));
            console.log(`Map ${action}${key !== undefined ? ` (key=${key}, value=${value})` : ""}`);
            console.table(entries);
        }

        // 覆写 set
        Map.prototype.set = function(key, value) {
            const result = originalSet.call(this, key, value);
            logMap(this, "set", key, value);
            return result;
        };

        // 覆写 delete
        Map.prototype.delete = function(key) {
            const result = originalDelete.call(this, key);
            logMap(this, "delete", key);
            return result;
        };

        // 覆写 clear
        Map.prototype.clear = function() {
            const result = originalClear.call(this);
            logMap(this, "clear");
            return result;
        };
    }
}

export {DataManager};
