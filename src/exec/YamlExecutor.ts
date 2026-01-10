import { parseYaml } from "obsidian";
import { SimpleExecutor } from "./SimpleExecutor";
import ThemeManager from "manager/ThemeManager";

export class YamlExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'yaml';
    }

    async execute(module: MiniModule, started: boolean): Promise<void> {
        for (const file of module.tmpFiles!) {
            // 将配置挂载到 pluto.assets[模块名]
            if (file.name === 'config.yaml' || file.name === 'nav.yaml') {
                await this.createConfigFile(module.name, file.content, started);
                return;
            }
            if (file.name === 'css.yaml') {
                const css = parseYaml(file.content);
                pluto.third.assets[module.name].yaml.set(file.name, css);
                for (const key of Object.keys(css)) {
                    //key值格式为 pluto-background@@bg-work
                    //取值方法 pluto.third.assets['默认皮肤'].css.get('pluto-background').settings.find(t=> t.id==='bg-work')
                    const vars = key.split('@@');
                    const target = pluto.third.assets[module.name].css.get(vars[0]!);
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
            pluto.third.assets[module.name].yaml.set(file.name, file.content);
            return;
        };
    }

}
