import { SimpleExecutor } from "./SimpleExecutor";

export type JsFunc = (...args: unknown[]) => Promise<unknown>;
type AsyncFunctionConstructor = new (...args: string[]) => JsFunc;
const AsyncFunction = async function (): Promise<void> { }.constructor as AsyncFunctionConstructor;

export function buildJsFunc(code: string, globalNames: string[], expression: boolean, sourceUrl: string): JsFunc {
    const functionBody = expression ? `return (\n${code}\n);` : code;
    const func: JsFunc = new AsyncFunction(...globalNames, `${functionBody}\n//# sourceURL=${encodeURIComponent(sourceUrl)}`);
    return func;
}

export class SandboxExecutor extends SimpleExecutor {

    private static instances = new Map<string, any>();

    excutable(type: string): boolean {
        return type === 'js';
    }

    async execute(module: MiniModule) {
        const api = await this.loadModules(module);
        if (api.Boot) {
            const boot = new api.Boot();
            SandboxExecutor.instances.set(module.id, boot);// 缓存实例实例
            boot.start?.();
            boot.finish?.();
        }
    }

    private async loadModules(context: BatchContext) {
        const tmpFiles = context.files;
        const api: Record<string, any> = {};
        for (const file of tmpFiles) {
            const result = await this.load({ ...context, tmpFiles: context.files, file, api });
            if (result) {
                Object.assign(api, result);
            }
        }
        // 如果有模块导出结果，将其挂载到 pluto.modules
        if (Object.keys(api).length > 0) {
            pluto.third.modules[context.name] = api;
        }
        return api;
    }

    async load(params: ModParams): Promise<any> {
        const { id, name, tmpFiles, file, api } = params;
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
            imports: (clazz: string) => api[clazz],
            api,
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

        // 检测并处理 export class 语句，支持 export class Foo extends Bar { ... }
        let content = file.content;
        const exportClassRegex = /export\s+class\s+(\w+)(\s+extends\s+[\w$.]+)?\s*(\{[\s\S]*?\})(?![\s\S]*\})/g;
        content = content.replace(exportClassRegex, (_match, className, extendsClause = "", classBody) => {
            // 将 export class 转换为普通 class 定义，并将其导出到 module.exports
            return `class ${className}${extendsClause} ${classBody}\nmodule.exports.${className} = ${className};`;
        });

        // 使用沙箱 AsyncFunction 执行处理后的代码
        try {
            const runner = buildJsFunc(`with(ctx) { ${content} }`, ['ctx'], false, `sandbox:${name}/${file.name}`);
            const result = await runner(context);
            // 处理模块导出
            if (result) {
                // 优先使用 return 的结果
                return result;
            } else if (Object.keys(moduleExports).length > 0) {
                // 其次使用 module.exports 或 exports
                return moduleExports;
            }
        } catch (error) {
            console.error(`Error executing module ${name}, file ${file.name}:`, error);
            throw error;
        }
    }

    async install(context: BatchContext) {
        const api = await this.loadModules(context);
        const bootJs = context.files!.find(f => f.name === 'boot.js');
        if (bootJs) {
            const def = await this.load({ ...context, file: bootJs, api: pluto.third.modules[context.name] || {} });
            if (def) {
                const boot = new def.Boot();
                await boot.install?.(context);
                await boot.start?.();
                await boot.finish?.();
                SandboxExecutor.instances.set(context.id, boot);// 缓存实例实例
            }
        }
    }

    async uninstall(context: BatchContext) {
        const boot = SandboxExecutor.instances.get(context.id);
        if (boot) {
            await boot.uninstall?.(context);
            SandboxExecutor.instances.delete(context.id); // 清理实例实例
        }
    }
}