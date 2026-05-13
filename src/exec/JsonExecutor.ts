import { SimpleExecutor } from "./SimpleExecutor";

export class JsonExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'json';
    }
        
    async execute(module: MiniModule): Promise<void> {
        for (const file of module.tmpFiles!) {
            const config = JSON.parse(file.content);
            // 将配置挂载到 pluto.assets[模块名]
            pluto.third.assets[module.name][file.name] = config;
        };
    }
}
