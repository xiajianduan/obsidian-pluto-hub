import { parseYaml } from "obsidian";
import { ThirdFactory } from "third/ThirdFactory";
import { readFileAsText } from "utils/helper";

// 创建一个简单的CoreExecutor实现，用于其他插件
export class SimpleExecutor implements CoreExecutor {

    codes: Map<PlutoProps, any> = new Map();

    async install(context: BatchContext): Promise<void> { }

    async uninstall(context: BatchContext): Promise<void> { }

    excutable(type: string): boolean {
        return false;
    }

    async execute(context: BatchContext): Promise<void> { }

    async executeAll(): Promise<void> {
        const executions: Promise<void>[] = [];
        ThirdFactory.loop((prop: PlutoProps) => {
            executions.push(pluto.third[prop].executeAll());
        });
        await Promise.all(executions);
    }
    

    async read(file: File): Promise<string> {
        return await readFileAsText(file);
    }
    async write(filePath: string, content: string, type: string): Promise<void> {
        return await app.vault.adapter.write(filePath, content);
    }
}