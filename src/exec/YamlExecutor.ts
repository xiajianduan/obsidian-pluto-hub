import { parseYaml } from "obsidian";
import { SimpleExecutor } from "./SimpleExecutor";

export class YamlExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'yaml';
    }
        
    async execute(module: MiniModule, started: boolean): Promise<void> {
        for (const file of module.tmpFiles!) {
            // 将配置挂载到 pluto.assets[模块名]
            if(file.name !== 'config.yaml') {
                file.content = parseYaml(file.content);
                pluto.third.assets[module.name].yaml.set(file.name, file.content);
                return;
            }
            await this.createConfigFile(module.name, file.content, started);
        };
    }
}
