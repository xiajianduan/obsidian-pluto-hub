import { Notice } from "obsidian";
import { SimpleComponent } from "./SimpleComponent";

export class TemplaterComponent extends SimpleComponent {

    get pluginId(): string {
        return 'templater-obsidian';
    }

    patch(): void {
        if (this.self.templater) {
            this.self.templater.functions_generator.internal_functions.generate_params = function (params: any) {
                let t: any = {};
                for (let r of this.modules_array) {
                    t[r.getName()] = r.static_object;
                }
                return { ...t, params };
            };
        }
    }
    async load(params: ModParams): Promise<void> {
        const { name, file } = params;
        const block = {
            code: file.content,
            name: name  
        };
        this.register(name, block);
    }
    async execute(block: any): Promise<void> {
        this.check();
        const mod = {
            name: block.name,
            configPath: this.configPath,
            configFile: `${this.configPath}/${block.name}.yaml`
        };
        const templater = this.self.templater;
        if (templater) {
            const current = templater.functions_generator.internal_functions.generate_params(mod);
            if(!templater.parser) await sleep(3000);
            await templater.parser.parse_commands(block.code, current);
        }
    }
}