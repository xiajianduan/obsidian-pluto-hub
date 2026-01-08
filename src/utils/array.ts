export class Arrays {
    /**
     * 加载数组扩展函数
     */
    static loadFunctions() {
        // 扩展 Array.prototype.groupBy 方法
        Array.prototype.groupBy = function <T, K extends string | number | symbol>(
            this: T[], // 绑定数组自身
            keyGetter: (item: T) => K
        ): Record<K, T[]> {
            // 核心：用 reduce 分组，this 指向当前数组
            return this.reduce((result, item) => {
                // 获取当前项的分组键（支持任意字段，而非固定 type）
                const key = keyGetter(item);
                // 初始化分组数组
                if (!result[key]) {
                    result[key] = [];
                }
                // 推入当前项
                result[key].push(item);
                return result;
            }, {} as Record<K, T[]>); // 初始值为空对象
        };

        // 防止 TS 报 "修改只读属性" 错误
        Object.defineProperty(Array.prototype, 'groupBy', {
            writable: true,
            configurable: true
        });
    }
}