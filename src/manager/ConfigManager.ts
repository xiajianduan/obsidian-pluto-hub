import { parseYaml, stringifyYaml } from "obsidian";
import { ModStorage } from "storage";

export class ConfigManager {
    
    async getLive(name: string) {
        const module = await ModStorage.loadModule(name);
        if(module.position === "Z") {
            return this.getConfigOps(name);
        }
        return await this.getConfigLocal(name);
    }

    getCached(name: string) {
        return this.getConfigOps(name);
    }

    getConfigOps(name: string) {
        const config = pluto.third.assets[name][name];
        if(config) return config;
        return pluto.third.assets[name]["data.json"];
    }

    async getConfigLocal(name: string) {
        const content = await app.vault.adapter.read(`${pluto.self.settings.configPath}/${name}.yaml`);
        const config = parseYaml(content);
        pluto.third.assets[name][name] = config;
        if(config) return config;
    }

    async write(name: string, list: any) {
        const module = await ModStorage.loadModule(name);
        if(module.position === "Z") {
            const config = module.files.find(f => f.name === "config.yaml");
            if(config) {
                config.content = stringifyYaml(list);
                ModStorage.saveModule(module);
            }
        }else {
            const yaml = stringifyYaml(list);
            await app.vault.adapter.write(`${pluto.self.settings.configPath}/${name}.yaml`, yaml);
        }
    }
}