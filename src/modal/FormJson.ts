import { FormModalConfig } from "types/form";
import { t } from "utils/translation";
export class FormJson {

    static input(title: string, name: string): FormModalConfig {
        return {
            title,
            fields: [{
                input: { type: 'text', hidden: false },
                name: "name",
                label: name,
                required: true
            }]
        }
    }
    static ai(files: ModFile[]): FormModalConfig {
        return {
            title: t('pluto.hub.editor.ai.title'),
            fields: [{
                input: { type: 'textarea', hidden: false, placeholder: t('pluto.hub.editor.ai.prompt-placeholder') },
                name: "prompt",
                label: t('pluto.hub.editor.ai.prompt-label'),
                required: true
            },{
                input: {
                    type: 'toggle',
                    hidden: false,
                },
                name: "fast",
                label: t('pluto.hub.editor.ai.fast-label'),
                required: true
            }, {
                input: {
                    type: 'multiselect',
                    hidden: false,
                    multi_select_options: files.map(file => ({ value: file.name, label: file.name })),
                    multi_select_summary: t('pluto.hub.editor.ai.attachments-summary'),
                },
                name: "attachments",
                label: t('pluto.hub.editor.ai.attachments-label'),
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
                label: "分类",
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
            }, {
                name: "position",
                label: "配置位置",
                required: true,
                input: {
                    type: "select",
                    options: [
                        {
                            value: "Z",
                            label: "压缩文件"
                        },
                        {
                            value: "L",
                            label: "本地目录"
                        },
                        {
                            value: "S",
                            label: "浏览存储"
                        }
                    ]
                },
            }]
        }
    }
}