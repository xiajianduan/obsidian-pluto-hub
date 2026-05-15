import { parseYaml, stringifyYaml } from "obsidian";
import { ModStorage } from "storage";

export class ConfigManager {
    
    async getLive(name: string, id: string) {
        const module = await ModStorage.loadModule(name);
        if(module.position === "Z") {
            return this.getConfigOps(module, id);
        }
        return await this.getConfigLocal(name, id);
    }

    getCached(name: string, id: string) {
        if(id) return pluto.third.assets[name][`${id}.json`];
        const config = pluto.third.assets[name][name];
        if(config) return config;
        return pluto.third.assets[name]["data.json"];
    }

    getConfigOps(module: MiniModule, id: string) {
        if(id) {
            const config = module.files.find(t=> t.name === `${id}.json`);
            if(config) return JSON.parse(config.content);
        }
        const config = module.files.find(t=> t.name === "config.yaml");
        if(config) return parseYaml(config.content);
        const data = module.files.find(t=> t.name === "data.json");
        if(data) return JSON.parse(data.content);
        return [];
    }

    async getConfigLocal(name: string, id: string) {
        if(id) {
            const config = await app.vault.readJson(`${pluto.self.settings.configPath}/${id}.json`);
            pluto.third.assets[name][`${id}.json`] = config;
            return config;
        }else {
            const content = await app.vault.readRaw(`${pluto.self.settings.configPath}/${name}.yaml`);
            const config = parseYaml(content);
            pluto.third.assets[name][name] = config;
            if(config) return config;
        }
    }

    async write(name: string, list: any, id: string) {
        const module = await ModStorage.loadModule(name);
        if(module.position === "Z") {
            if(id) {
                const config = module.files.find(f => f.name === `${id}.json`);
                if(config) {
                    config.content = JSON.stringify(list, void 0, 2);
                }else {
                    module.files.push({
                        name: `${id}.json`,
                        content: JSON.stringify(list, void 0, 2),
                        type: "json",
                    });
                }
                ModStorage.saveModule(module);
            }else {
                const config = module.files.find(f => f.name === "config.yaml");
                if(config) {
                    config.content = stringifyYaml(list);
                    ModStorage.saveModule(module);
                }
            }
        }else {
            if(id) {
                const content = JSON.stringify(list, void 0, 2);
                await app.vault.adapter.write(`${pluto.self.settings.configPath}/${id}.json`, content);
            }else {
                const yaml = stringifyYaml(list);
                await app.vault.adapter.write(`${pluto.self.settings.configPath}/${name}.yaml`, yaml);
            }
        }
    }
}