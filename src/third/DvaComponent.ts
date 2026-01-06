import { SimpleThirdComponent } from "./SimpleThirdComponent";

export class DvaComponent extends SimpleThirdComponent {
    get pluginId(): string {
        return 'dataview';
    }
}