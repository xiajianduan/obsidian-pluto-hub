import { parseYaml, stringifyYaml } from "obsidian";

// 创建一个简单的CoreExecutor实现，用于其他插件
export class SimpleExecutor implements CoreExecutor {

    codes: Map<string, any> = new Map();
    configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
    }

    excutable(type: string): boolean {
        return false;
    }

    async execute(block: any, started: boolean): Promise<void> { }

    async executeAll(): Promise<void> {
        for (const block of this.codes.values()) {
            await this.execute(block, false);
        }
    }

    async createConfigFile(name: string, content: any, started: boolean): Promise<boolean> {
        const configFile = `${pluto.self.settings.configPath}/${name}.yaml`;
            if(started) {
                if(!await app.vault.adapter.exists(configFile)) {
                    const parsed = stringifyYaml(content);
                    await app.vault.adapter.write(configFile, parsed);
                    pluto.third.assets[name].yaml.set("config.yaml", content);
                    return true;
                }
            }
            const ymlContent = await app.vault.adapter.read(configFile);
            let yaml = parseYaml(ymlContent);
            pluto.third.assets[name].yaml.set("config.yaml", yaml);
            return false;
    }
}