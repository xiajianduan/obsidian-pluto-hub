import { SimpleComponent } from "./SimpleComponent";

export class TemplaterComponent extends SimpleComponent {

    get pluginId(): string {
        return 'templater-obsidian';
    }

    patch(): void {
        const internalFunctions = this.self.templater?.functions_generator?.internal_functions;
        if (!internalFunctions || typeof internalFunctions.generate_params === 'function') return;
        internalFunctions.generate_params = function (params: any) {
            const values: any = {};
            for (const module of this.modules_array) {
                values[module.getName()] = module.static_object;
            }
            return { ...values, params };
        };
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
        const internalFunctions = templater.functions_generator.internal_functions;
        const current = internalFunctions.generate_params(mod);
        await templater.parser.parse_commands(block.code, current);
    }
}