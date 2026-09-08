// 输入类型扩展：支持 text/toggle/textarea/button/dropdown/hotkey
export type InputType = 'text' | 'toggle' | 'textarea' | 'button' | 'select' | 'hotkey';

// 单个表单字段配置
export interface FormField {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  input: {
    type: InputType;
    hidden?: boolean;
    options?: { label: string; value: string | number }[]; // dropdown 选项
    buttonText?: string; // button 文字
    placeholder?: string; // 输入框占位符
  };
}

// 表单弹窗配置
export interface FormModalConfig {
  title?: string;
  name?: string;
  fields: FormField[];
}

export interface FormSubmitResult {
  status: 'ok' | 'error';
  data?: FormValues;
  error?: string;
}
// 表单值类型
export type FormValues = Record<string, string | boolean | undefined | string[]>;