import React, { useState, useEffect } from 'react';
import { FormField as FormFieldType } from '../types/form';

// 单个表单字段组件（适配所有输入类型）
interface FormFieldProps {
  field: FormFieldType;
  value: any;
  onChange: (name: string, value: any) => void;
}

export const FormField: React.FC<FormFieldProps> = ({ field, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value ?? '');

  // 同步外部默认值
  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  // 组件渲染映射（替代 switch case）
  const renderComponent = () => {
    const { input, name } = field;
    switch (input.type) {
      case 'text':
        return (
          <input
            type="text"
            className="form-input"
            placeholder={input.placeholder}
            value={localValue as string}
            onChange={(e) => {
              setLocalValue(e.target.value);
              onChange(name, e.target.value);
            }}
            required={field.required}
          />
        );
      case 'toggle':
        return (
          <div className={`checkbox-container ${!!localValue ? 'is-enabled' : ''}`}
            onClick={() => {
              const newValue = !localValue;
              setLocalValue(newValue);
              onChange(name, newValue);
            }}>
            <input
              type="checkbox"
              tabIndex={0}
              checked={localValue as boolean}
            />
          </div>
        );
      case 'textarea':
        return (
          <textarea
            className="form-input"
            rows={10}
            placeholder={input.placeholder}
            value={localValue as string}
            onChange={(e) => {
              setLocalValue(e.target.value);
              onChange(name, e.target.value);
            }}
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            className="form-dropdown"
            value={localValue as string}
            onChange={(e) => {
              setLocalValue(e.target.value);
              onChange(name, e.target.value);
            }}
            required={field.required}
          >
            {/* <option value="">请选择{field.label}</option> */}
            {input.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'button':
        return (
          <button
            className="form-button"
            onClick={() => {
              // 按钮点击时触发 onChange（可自定义逻辑）
              onChange(name, Date.now().toString()); // 示例：传递点击时间戳
            }}
          >
            {input.buttonText || field.label}
          </button>
        );
      case 'hotkey':
        function normalizeKey(event: React.KeyboardEvent<HTMLInputElement>) {
          const key = event.key.toUpperCase();

          if (key === " ") return "SPACE";
          if (key === "CONTROL") return "CTRL";
          if (key === "META") return "CMD";
          if (key === "ALT") return "ALT";
          if (key === "SHIFT") return "SHIFT";
          if (key === "TAB") return "TAB";
          if (key === "ESCAPE") return "ESC";
          if (key === "ENTER") return "ENTER";
          if (key === "BACKSPACE") return "BACKSPACE";

          return key;
        }

        return (
          <input
            className="form-input"
            value={
              Array.isArray(localValue)
                ? localValue.join(' + ')
                : ''
            }
            placeholder={input.placeholder}
            readOnly
            required={field.required}
            onKeyDown={(e) => {
              e.preventDefault();

              const keys = [];

              if (e.ctrlKey) keys.push('CTRL');
              if (e.altKey) keys.push('ALT');
              if (e.shiftKey) keys.push('SHIFT');
              if (e.metaKey) keys.push('CMD');

              const key = normalizeKey(e);

              if (
                !['CTRL', 'ALT', 'SHIFT', 'CMD'].includes(key)
              ) {
                keys.push(key);
              }

              if (keys.length) {
                setLocalValue(keys);
                onChange(name, keys);
              }
            }}
          />
        );
      default:
        return <div>不支持的组件类型：{input.type}</div>;
    }
  };

  if (field.input.hidden) return null;

  return (
    <div className="setting-item" data-field-name={field.name}>
      <div className="setting-item-info">
        <label className={`setting-item-name ${field.required ? 'required' : ''}`}>
          {field.label}
          {field.required ? ' *' : ''}
        </label>
      </div>
      <div className="setting-item-control">
        {renderComponent()}
      </div>
    </div>
  );
};