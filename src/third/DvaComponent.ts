import { SimpleComponent } from "./SimpleComponent";

export class DvaComponent extends SimpleComponent {
    get pluginId(): string {
        return 'dataview';
    }

    async execute(block: any): Promise<void> {
        super.execute(block);
        this.api.renderValue(block.text, block.contentEl);
    }
}