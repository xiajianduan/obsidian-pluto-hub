import { SimpleExecutor } from "./SimpleExecutor";

export class SandboxExecutor extends SimpleExecutor {

    private static instances = new Map<string, any>();

    excutable(type: string): boolean {
        return type === 'js';
    }

    async execute(module: MiniModule) {
        const bootJs = module.tmpFiles!.find(f => f.name === 'boot.js');
        if (bootJs) {
            const def = this.load({ ...module, file: bootJs });
            if (def) {
                const boot = new def.Boot();
                SandboxExecutor.instances.set(module.id, boot);// 缓存实例实例
                boot.start();
                this.execModule(module);
                boot.finish?.();
            }
        } else {
            this.execModule(module);
        }
    }

    private execModule(module: MiniModule) {
        const jsFiles = module.tmpFiles!.filter(f => f.name !== 'boot.js');
        const object = jsFiles.reduce((prev: any, file) => {
            const result = this.load({ ...module, tmpFiles: module.tmpFiles!, file });
            return Object.assign(prev, result);
        }, {});
        // 如果有模块导出结果，将其挂载到 pluto.modules
        if (Object.keys(object).length > 0) {
            pluto.third.modules[module.name] = object;
        }
    }

    load(params: ModParams): any {
        const { id, name, tmpFiles, file } = params;
        // 创建模块导出对象
        const moduleExports: Record<string, any> = {};
        const exports = moduleExports;
        const configPath = pluto.self.settings.configPath;

        const context = {
            pluto,
            // 将模块信息暴露给脚本
            params: {
                id,
                name,
                configPath,
                configFile: `${configPath}/${name}.yaml`
            },
            // 允许 JS 访问同模块下的其他文件
            getFile: (name: string) => tmpFiles!.find(f => f.name === name)?.content,
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

    async install(context: BatchContext): Promise<void> {
        const bootJs = context.files!.find(f => f.name === 'boot.js');
        if (bootJs) {
            const def = this.load({ ...context, file: bootJs });
            if (def) {
                const boot = new def.Boot();
                SandboxExecutor.instances.set(module.id, boot);// 缓存实例实例
                boot.install?.(context);
            }
        }
    }

    async uninstall(context: BatchContext): Promise<void> {
        const boot = SandboxExecutor.instances.get(context.id);
        if (boot) {
            boot.uninstall?.(context);
            SandboxExecutor.instances.delete(context.id);  // 清理实例实例
        }
    }
}
