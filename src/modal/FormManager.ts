import { FormModalConfig, FormValues } from "types/form";
import { PlutoFormModal } from "modal/PlutoFormModal";
import { App, Notice } from "obsidian";

export class FormManager {

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async prompt(name: string, title: string = 'Pluto Form'): Promise<string> {
        const values = await this.openJson({
            title, fields: [{
                input: { type: 'text', hidden: false },
                name: "name",
                label: name
            }]
        }, {});
        return values["name"] as string;
    }

    async openYaml(config: FormModalConfig, defaultValues: FormValues = {}): Promise<FormValues> {
        return new Promise((resolve, reject) => {
            new PlutoFormModal(this.app, config, defaultValues, (values) => {
                console.log('表单提交值:', values);
                new Notice(`✅ 表单提交成功: ${JSON.stringify(values)}`);
                resolve(values);
            }).open();
        });
    }

    async openJson(config: FormModalConfig, defaultValues: FormValues = {}): Promise<FormValues> {
        return new Promise((resolve, reject) => {
            new PlutoFormModal(this.app, config, defaultValues, (values) => {
                console.log('表单提交值:', values);
                new Notice(`✅ 表单提交成功: ${JSON.stringify(values)}`);
                resolve(values);
            }).open();
        });
    }
}