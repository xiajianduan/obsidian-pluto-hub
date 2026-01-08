import { SimpleComponent } from "./SimpleComponent";

export class DvaComponent extends SimpleComponent {
    get pluginId(): string {
        return 'dataview';
    }
}