import { FormModalConfig, FormValues } from "types/form";
import { PlutoFormModal } from "modal/PlutoFormModal";
import { App } from "obsidian";

export class FormManager {

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async prompt(name: string, required: boolean = true, title: string = ''): Promise<string> {
        const values = await this.openJson({
                title,
                fields: [{
                input: { type: 'text', hidden: false },
                name: "name",
                label: name,
                required
            }]
        }, {});
        return values["name"] as string;
    }

    async openYaml(config: FormModalConfig, defaultValues: FormValues = {}): Promise<FormValues> {
        return new Promise((resolve, reject) => {
            new PlutoFormModal(this.app, config, defaultValues, (values) => {
                console.log('表单提交值:', values);
                resolve(values);
            }, () => {
                reject({type: 'cancel', message: '用户取消了操作'});
            }).open();
        });
    }

    async openJson(config: FormModalConfig, defaultValues: FormValues = {}): Promise<FormValues> {
        return new Promise((resolve, reject) => {
            new PlutoFormModal(this.app, config, defaultValues, (values) => {
                console.log('表单提交值:', values);
                resolve(values);
            }, () => {
                reject({type: 'cancel', message: '用户取消了操作'});
            }).open();
        });
    }
}