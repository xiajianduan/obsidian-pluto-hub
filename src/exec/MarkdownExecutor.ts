import { ThirdFactory } from "third/ThirdFactory";
import { SimpleExecutor } from "./SimpleExecutor";
import { getFrontMatterInfo, parseYaml } from "obsidian";

export class MarkdownExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'md';
    }

    async execute(context: BatchContext): Promise<void> {
        for (const file of context.files) {
            const info = getFrontMatterInfo(file.content);
            const frontmatter = info.frontmatter;
            if (!frontmatter) continue;
            const yaml = parseYaml(frontmatter);
            const plutoLanguage = yaml['pluto-language'];
            if (plutoLanguage) {
                const prop = plutoLanguage as PlutoProps;
                this.codes.set(prop, { ...context, file, yaml });
            }
        };
        if (this.codes.size === 0) return;
        pluto.third.assets[context.name].component = {};
        for (const prop of this.codes.keys()) {
            pluto.third.assets[context.name].component[prop] = ThirdFactory.getInstance(prop);
        }
        this.codes.forEach(async (params, prop) => {
            const component = pluto.third.assets[context.name].component as Record<string, ThirdComponent>;
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
