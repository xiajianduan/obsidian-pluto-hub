export {}; // 使文件成为模块
import { App } from "obsidian";

declare global {

  export interface Window {
    pluto: Pluto;
  }

  export interface Pluto {
    config: any;
    modules: any;
    web: any;
    images: any;
    react: ThirdComponent;
    dv: ThirdComponent;
    // 添加索引签名，允许使用字符串索引访问属性
    [key: string]: any;
  }

  export interface ThirdComponent {
    op: any;
    api: any;
    codes: any[];
    /**
     * 注册组件配置
     * @param config 组件配置对象，包含组件代码、名称、命名空间等
     */
    register(config: any): void;
    /**
     * 绑定组件到 Pluto 实例
     * @param op 操作对象，通常是 Pluto 实例
     * @param prop 组件绑定的属性名
     * @returns 绑定的 ThirdComponent 实例
     */
    bind(op: any, prop: string): ThirdComponent;
    /**
     * 执行组件注册
     */
    execute(): void;
  }
}

