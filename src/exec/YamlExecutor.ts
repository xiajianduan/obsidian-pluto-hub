import { parseYaml } from "obsidian";
import { SimpleExecutor } from "./SimpleExecutor";

export class YamlExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'yaml';
    }

    async execute(module: MiniModule): Promise<void> {
        for (const file of module.tmpFiles!) {
            // 将配置挂载到 pluto.assets[模块名]
            if (file.name === 'config.yaml' || file.name === 'nav.yaml') {
                await this.readConfigFile(module.name, module.position, file.content);
                return;
            }
            if (file.name === 'css.yaml') {
                const css = parseYaml(file.content);
                pluto.third.assets[module.name][file.name] = css;
                for (const key of Object.keys(css)) {
                    //key值格式为 pluto-background@@bg-work
                    //取值方法 pluto.third.assets['默认皮肤']['pluto-background'].settings.find(t=> t.id==='bg-work')
                    const vars = key.split('@@');
                    const target = pluto.third.assets[module.name][vars[0]!];
                    const object = target.settings.find((t: any) => t.id === vars[1]!);
                    //格式为 {id: 'bg-work', title: 'Activate Image Background', title.zh: '开启背景', type: 'class-toggle', default: false}
                    if (object.type === 'class-toggle' && css[key]) {
                        document.body.classList.add(object.id);
                    } else if (object.type === 'variable-text') {
                        document.body.style.setProperty(`--${vars[1]}`, css[key]);
                    }
                }
                return;
            }
            file.content = parseYaml(file.content);
            pluto.third.assets[module.name][file.name] = file.content;
            return;
        };
    }
    async install(context: BatchContext): Promise<void> {
        for (const file of context.files) {
            if (file.name === 'config.yaml' || file.name === 'nav.yaml') {
                const name = context.name;
                if (context.position === "Z") {
                    let yaml = parseYaml(file.content);
                    pluto.third.assets[name][name] = yaml;
                } else {
                    const configFile = `${pluto.self.settings.configPath}/${name}.yaml`;
                    if (!await app.vault.adapter.exists(configFile)) {
                        await app.vault.adapter.write(configFile, file.content);
                        let yaml = parseYaml(file.content);
                        pluto.third.assets[name][name] = yaml;
                    }
                }

            }
        }
    }

    async readConfigFile(name: string, position: string, content: string): Promise<void> {
        if (position === "Z") {
            let yaml = parseYaml(content);
            pluto.third.assets[name][name] = yaml;
        } else {
            const configFile = `${pluto.self.settings.configPath}/${name}.yaml`;
            content = await app.vault.readRaw(configFile);
            let yaml = parseYaml(content);
            pluto.third.assets[name][name] = yaml;
        }
    }
}
