import { FormModalConfig, FormValues } from "types/form";
import { PlutoFormModal } from "modal/PlutoFormModal";
import { FormJson } from "../modal/FormJson";

export class FormManager {

    async prompt(name: string, required: boolean = true, title: string = ''): Promise<string> {
        const config = FormJson.input(title, name, required);
        return this.openJson(config, {})
            .then((values) => values["name"] as string);
    }

    async create(module: any): Promise<string> {
        const config = FormJson.create();
        return this.openJson(config, module)
            .then((values) => values["name"] as string);
    }

    async openSetting(module: any): Promise<FormValues> {
        const config = FormJson.setting(module.name);
        return this.openJson(config, module as FormValues)
            .then((values) => values);
    }

    async openYaml(config: FormModalConfig, defaultValues: FormValues = {}): Promise<FormValues> {
        return new Promise((resolve, reject) => {
            new PlutoFormModal(config, defaultValues, (values) => {
                console.log('表单提交值:', values);
                resolve(values);
            }, () => {
                reject({ type: 'cancel', message: '用户取消了操作' });
            }).open();
        });
    }

    async openJson(config: FormModalConfig, defaultValues: FormValues = {}): Promise<FormValues> {
        return new Promise((resolve, reject) => {
            new PlutoFormModal(config, defaultValues, (values) => {
                console.log('表单提交值:', values);
                resolve(values);
            }, () => {
                reject({ type: 'cancel', message: '用户取消了操作' });
            }).open();
        });
    }
}