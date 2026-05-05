import { parseYaml } from "obsidian";
import { readFileAsText } from "utils/helper";

// 创建一个简单的CoreExecutor实现，用于其他插件
export class SimpleExecutor implements CoreExecutor {

    codes: Map<string, any> = new Map();

    excutable(type: string): boolean {
        return false;
    }

    async execute(block: any, started: boolean): Promise<void> { }

    async executeAll(): Promise<void> {
        for (const block of this.codes.values()) {
            await this.execute(block, false);
        }
    }

    async createConfigFile(name: string, position: string, content: any, started: boolean): Promise<boolean> {
        if(position === "Z") {
            let yaml = parseYaml(content);
            pluto.third.assets[name][name] = yaml;
            return false;
        }
        const configFile = `${pluto.self.settings.configPath}/${name}.yaml`;
        if (started) {
            if (!await app.vault.adapter.exists(configFile)) {
                await app.vault.adapter.write(configFile, content);
                let yaml = parseYaml(content);
                pluto.third.assets[name][name] = yaml;
                return true;
            }
        }
        content = await app.vault.adapter.read(configFile);
        let yaml = parseYaml(content);
        pluto.third.assets[name][name] = yaml;
        return false;
    }

    async read(file: File): Promise<string> {
        return await readFileAsText(file);
    }
    async write(filePath: string, content: string, type: string): Promise<void> {
        return await app.vault.adapter.write(filePath, content);
    }
}