import { FormModalConfig } from "types/form";
import { t } from "utils/translation";

export class FormJson {

    static input(title: string, name: string, required: boolean): FormModalConfig {
        return {
            title,
            fields: [{
                input: { type: 'text', hidden: false },
                name: "name",
                label: name,
                required
            }]
        }
    }
    static create(): FormModalConfig {
        return {
            title: t('pluto.hub.module-name-prompt'),
            fields: [{
                name: "name",
                label: "模块名称",
                required: true,
                input: { type: 'text', hidden: false },
            }, {
                name: "type",
                label: "类型",
                required: true,
                input: {
                    type: "select",
                    options: [
                        {
                            value: "G",
                            label: "一般"
                        },
                        {
                            value: "I",
                            label: "重要"
                        }
                    ]
                },
            }]
        }
    }

    static setting(title: string): FormModalConfig {
        return {
            title: title,
            name: "form-module",
            fields: [{
                name: "type",
                label: "类型",
                required: true,
                input: {
                    type: "select",
                    options: [
                        {
                            value: "G",
                            label: "一般"
                        },
                        {
                            value: "I",
                            label: "重要"
                        }
                    ]
                },
            }]
        }
    }
}