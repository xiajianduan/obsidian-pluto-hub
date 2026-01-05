import { MiniModule, ModParams } from "types/pluto";
import { SimpleCoreExecutor } from "./SimpleCoreExecutor";

export class SandboxExecutor extends SimpleCoreExecutor {

    excutable(type: string): boolean {
        return type === 'js';
    }

    async execute(module: MiniModule) {
        const mainJs = module.files.find(f => f.name === 'main.js');
        if (!mainJs) return;
        const def = this.load({ module, file: mainJs, started: true });
        const main = new def.Main();
        main.before();
        const jsFiles = module.files.filter(f => this.excutable(f.type) && f.name !== 'main.js');
        const object = jsFiles.reduce((prev: any, file) => {
            const result = this.load({ module, file, started: true });
            return Object.assign(prev, result);
        }, {});
        // 如果有模块导出结果，将其挂载到 pluto.modules
        if (Object.keys(object).length > 0) {
            window.pluto.third.modules[module.name] = object;
        }
        main.after();
    }

    load(params: ModParams): any {
        const { module, file } = params;
        // 创建模块导出对象
        const moduleExports: Record<string, any> = {};
        const exports = moduleExports;

        const context = {
            pluto: window.pluto,
            // 将模块信息暴露给脚本
            params: {
                ...module,
                configPath: this.configPath,
                configFile: `${this.configPath}/${module.name}.json`
            },
            // 允许 JS 访问同模块下的其他文件
            getFile: (name: string) => module.files.find(f => f.name === name)?.content,
            // 添加 CommonJS 模块导出支持
            module: { exports: moduleExports },
            exports: exports,
            // 添加 ES 模块导出支持
            exportVar: function (name: string, value: any) {
                moduleExports[name] = value;
            }
        };

        // 检测并处理 export class 语句
        let content = file.content;
        const exportClassRegex = /export\s+class\s+(\w+)\s*(\{[\s\S]*?\})(?![\s\S]*\})/g;
        content = content.replace(exportClassRegex, (_match, className, classBody) => {
            // 将 export class 转换为普通 class 定义，并将其导出到 module.exports
            return `class ${className} ${classBody}\nmodule.exports.${className} = ${className};`;
        });

        // 使用 new Function 执行处理后的代码
        const runner = new Function('ctx', `with(ctx) { ${content} }`);
        const result = runner(context);

        // 处理模块导出
        if (result) {
            // 优先使用 return 的结果
            return result;
        } else if (Object.keys(moduleExports).length > 0) {
            // 其次使用 module.exports 或 exports
            return moduleExports;
        }
    }
}
