export {}; // 使文件成为模块

import { ImageConverter } from "core/ImageConverter";
import { MiniModule, ModParams } from "./pluto";

declare global {

  export interface Window {
    pluto: IPluto;
  }

  type PlutoProps = "dva" | "react" | "qa" | "templater" | "form";
  export interface IPluto {
    web: any;
    images: ImageConverter;
    third: Third;
    core: Core;
    helper: any;
  }
  export interface Third {
    assets: any;
    modules: any;
    dva: ThirdComponent;
    react: ThirdComponent;
    qa: ThirdComponent;
    templater: ThirdComponent;
    form: ThirdComponent;
  }

  export interface Core {
    css: CoreExecutor;
    json: CoreExecutor;
    image: CoreExecutor;
    markdown: CoreExecutor;
    sandbox: CoreExecutor;
  }

  export interface ThirdComponent {
    op: any;
    api: any;
    codes: Map<string, any>;
    
    get pluginId(): string;
    /**
     * 补丁组件，用于修改组件的行为
     */
    patch(): void;
    /**
     * 绑定组件到 Pluto 实例
     * @param op 操作对象，通常是 Pluto 实例
     * @param prop 组件绑定的属性名
     * @returns 绑定的 ThirdComponent 实例
     */
    bind(op: any, prop: string): ThirdComponent;
    /**
     * 注册组件
     * @param key 组件的唯一键名
     * @param code 组件的代码配置对象
     */
    register(key: string, code: any): void;
    /**
     * 加载组件
     * @param params 组件加载参数对象
     */
    load(params: ModParams): void;
    /**
     * 执行组件注册
     * @param block 组件代码块对象
     */
    execute(block: any): void;
    /**
     * 执行所有注册的组件
     */
    executeAll(): void;
  }
  export interface CoreExecutor {

    codes: Map<string, any>;
    configPath: string;

    excutable(type: string): boolean;
    /**
     * 执行组件注册
     * @param block 组件代码块对象
     */
    execute(module: MiniModule, started: boolean): void;
    /**
     * 执行所有注册的组件
     */
    executeAll(): void;
  }
}

