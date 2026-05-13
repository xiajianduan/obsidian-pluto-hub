import { SimpleExecutor } from "./SimpleExecutor";

export class PageExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'page';
    }
        
    async execute(module: MiniModule): Promise<void> {
        for (const file of module.tmpFiles!) {
            // 将配置挂载到 pluto.assets[模块名]
            pluto.third.assets[module.name][file.name] = file.content;
        };
    }
}
