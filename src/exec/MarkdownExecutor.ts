import { ThirdFactory } from "third/ThirdFactory";
import { SimpleExecutor } from "./SimpleExecutor";
import { getFrontMatterInfo, parseYaml } from "obsidian";

export class MarkdownExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'md';
    }

    async execute(module: MiniModule): Promise<void> {
        for (const file of module.tmpFiles!) {
            const info = getFrontMatterInfo(file.content);
            const frontmatter = info.frontmatter;
            if (!frontmatter) continue;
            const yaml = parseYaml(frontmatter);
            const plutoLanguage = yaml['pluto-language'];
            if (plutoLanguage) {
                const prop = plutoLanguage as PlutoProps;
                this.codes.set(prop, { ...module, file, yaml });
            }
        };
        if (this.codes.size === 0) return;
        pluto.third.assets[module.name].component = {};
        for (const prop of this.codes.keys()) {
            pluto.third.assets[module.name].component[prop] = ThirdFactory.getInstance(prop);
        }
        this.codes.forEach(async (params, prop) => {
            const component = pluto.third.assets[module.name].component as Record<string, ThirdComponent>;
            await component[prop]!.load(params);
        });
    }

    async install(context: BatchContext): Promise<void> {
        // for (const file of module.tmpFiles!) {
        //     const block = {
        //         code: context.content,
        //         name: context.name
        //     };
        //     await this.execute(block);
        // }
    }
}
