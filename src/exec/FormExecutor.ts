import { SimpleExecutor } from "./SimpleExecutor";

export class FormExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'form';
    }
        
    async execute(context: BatchContext): Promise<void> {
        for (const file of context.files) {
            // 将配置挂载到 pluto.assets[模块名]
            pluto.third.assets[context.name][file.name] = JSON.parse(file.content);
        };
    }
}
