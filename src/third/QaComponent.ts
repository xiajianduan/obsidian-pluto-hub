import { SimpleComponent } from "./SimpleComponent";

export class QaComponent extends SimpleComponent {

    get pluginId(): string {
        return 'quickadd';
    }
}