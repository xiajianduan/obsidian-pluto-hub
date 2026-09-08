import { FormModalConfig, FormSubmitResult, FormValues } from "types/form";
import { PlutoFormModal } from "modal/PlutoFormModal";
import { FormJson } from "../modal/FormJson";

export class FormManager {

    async prompt(name: string, title: string = ''): Promise<string> {
        const config = FormJson.input(title, name);
        return this.openForm(config, {})
            .then((result) => result.data?.["name"] as string);
    }

    async ai(files: ModFile[]): Promise<AiFormResult> {
        const config = FormJson.ai(files);
        const result = await this.openForm(config, {fast: true, attachments: []});
        const data = result.data ?? {};
        return {
            prompt: data.prompt as string,
            fast: data.fast as boolean,
            attachments: Array.isArray(data.attachments) ? data.attachments : [],
        };
    }

    async create(module: any): Promise<string> {
        const config = FormJson.create();
        return this.openForm(config, module)
            .then((result) => result.data?.["name"] as string);
    }

    async openSetting(module: any): Promise<FormSubmitResult> {
        const config = FormJson.setting(module.name);
        return this.openForm(config, module as FormValues);
    }

    async openForm(config: FormModalConfig, defaultValues: FormValues = {}): Promise<FormSubmitResult> {
        return new Promise((resolve, reject) => {
            new PlutoFormModal(config, defaultValues, (values) => {
                console.log('表单提交值:', values);
                resolve({status: 'ok', data: values});
            }, () => {
                reject({ type: 'cancel', message: '用户取消了操作' });
            }).open();
        });
    }
}