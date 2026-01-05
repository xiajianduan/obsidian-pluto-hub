export {}; // 使文件成为模块
import { ModFile } from "./pluto";

declare global {

  export interface Window {
    pluto: Pluto;
  }

  type PlutoProps = "dva" | "react" | "qa" | "templater";
  export interface Pluto {
    web: any;
    images: any;
    third: Third;
  }
  export interface Third {
    assets: any;
    modules: any;
    dva: ThirdComponent;
    react: ThirdComponent;
    qa: ThirdComponent;
    templater: ThirdComponent;
  }

  export interface ThirdComponent {
    op: any;
    api: any;
    codes: Map<string, any>;
    
    /**
     * 注册组件
     * @param key 组件的唯一键名
     * @param code 组件的代码配置对象
     */
    register(key: string, code: any): void;
    /**
     * 绑定组件到 Pluto 实例
     * @param op 操作对象，通常是 Pluto 实例
     * @param prop 组件绑定的属性名
     * @returns 绑定的 ThirdComponent 实例
     */
    bind(op: any, prop: string): ThirdComponent;
    /**
     * 加载组件
     * @param name 组件名称
     * @param file 组件文件对象
     * @param yaml 组件配置的 YAML 对象
     * @param started 是否在启动时加载
     */
    load(name: string, file: ModFile, yaml: any, started: boolean): void;
    /**
     * 执行组件注册
     * @param block 组件代码块对象
     */
    execute(block: any): Promise<void>;
    /**
     * 执行所有注册的组件
     */
    executeAll(): Promise<void>;
  }
}

