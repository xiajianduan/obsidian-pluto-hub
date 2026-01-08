import { FormModalConfig, FormValues } from "types/form";
import { PlutoFormModal } from "modal/PlutoFormModal";
import { App } from "obsidian";
import { FormJson } from "./FormJson";

export class FormManager {

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async prompt(name: string, required: boolean = true, title: string = ''): Promise<string> {
        const config = FormJson.input(title, name, required);
        const values = await this.openJson(config, {});
        return values["name"] as string;
    }

    async create(module: any): Promise<string> {
        const config = FormJson.create();
        const values = await this.openJson(config, module);
        return values["name"] as string;
    }

    async openSetting(module: any): Promise<FormValues> {
        const config = FormJson.setting(module.name);
        return await this.openJson(config, module as FormValues);
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