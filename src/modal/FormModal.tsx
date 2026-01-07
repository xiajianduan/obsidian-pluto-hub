import React, { useState, useEffect } from 'react';
import { FormModalConfig, FormValues } from '../types/form';
import { FormField } from './FormField';
import { Notice } from 'obsidian';

// React 表单弹窗组件
interface FormModalProps {
  config: FormModalConfig;
  defaultValues: FormValues;
  onSubmit: (values: FormValues) => void;
  onClose: () => void;
}

export const FormModalContent: React.FC<FormModalProps> = ({ config, defaultValues, onSubmit, onClose }) => {
  const [formValues, setFormValues] = useState<FormValues>(defaultValues);

  // 同步默认值
  useEffect(() => {
    setFormValues(defaultValues);
  }, [defaultValues]);

  // 字段值变更回调
  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // 表单提交校验
  const handleSubmit = () => {
    // 校验必填项
    const requiredFields = config.fields.filter(f => f.isRequired && !f.input.hidden);
    const missingFields = requiredFields.filter(f => !formValues[f.name]);

    if (missingFields.length > 0) {
      new Notice(`请填写必填项：${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    onSubmit(formValues);
    onClose();
  };

  return (
    <>
      <div className="modal-header">
        <h2>{config.title}</h2>
      </div>
      <div className="modal-content pluto-form">
        {config.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={formValues[field.name]}
            onChange={handleFieldChange}
          />
        ))}
        <div className="setting-item">
          <div className="setting-item-control">
            <button className="form-button" style={{ backgroundColor: '#6c757d' }} onClick={onClose}>
              取消
            </button>
            <button className="form-button" onClick={handleSubmit}>
              提交
            </button>
          </div>
        </div>
      </div>
    </>
  );
};