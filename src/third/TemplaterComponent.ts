import { Notice } from "obsidian";
import { SimpleComponent } from "./SimpleComponent";

export class TemplaterComponent extends SimpleComponent {

    get pluginId(): string {
        return 'templater-obsidian';
    }

    patch(): void {
        if (this.op.templater) {
            this.op.templater.functions_generator.internal_functions.generate_params = function (params: any) {
                let t: any = {};
                for (let r of this.modules_array) {
                    t[r.getName()] = r.static_object;
                }
                return { ...t, params };
            };
        }
    }
    async load(params: ModParams): Promise<void> {
        const { module, file, started } = params;
        const name = module.name;
        const block = {
            code: file.content,
            name: name
        };
        this.register(`${name}-${file.name}`, block);
        // 运行代码
        if (started) await this.execute(block);
    }
    async execute(block: any): Promise<void> {
        this.check();
        const mod = {
            name: block.name,
            configPath: this.configPath,
            configFile: `${this.configPath}/${block.name}.yaml`
        };
        if (this.op.templater) {
            const current = this.op.templater.functions_generator.internal_functions.generate_params(mod);
            if(!this.op.templater.parser) await sleep(3000);
            await this.op.templater.parser.parse_commands(block.code, current);
        }
    }
}