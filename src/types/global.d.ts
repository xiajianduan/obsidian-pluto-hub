import { FormManager } from "modal/FormManager";
import { App, PluginManifest, PlutoPlugin } from "obsidian";

export { }; // 使文件成为模块
declare global {
    interface Array<T> {
        /**
         * 按指定字段分组
         * @param keyGetter - 分组键获取函数（比如 item => item.type）
         * @returns 分组后的对象
         */
        groupBy<K extends string | number | symbol>(
            keyGetter: (item: T) => K
        ): Record<K, T[]>;
    }

    export interface Window {
        pluto: IPluto;
    }
    export const pluto: IPluto;
    export const app: App;

    type PlutoProps = "dva" | "react" | "qa" | "templater";

    // 定义插件设置接口
    export interface PlutoSettings {
        moduleStoragePath: string;
        backupFolderName: string;
        configPath: string;
        enableIcon: boolean;
        quality: number;
    }
    export interface IPluto {
        web: any;
        images: any;
        third: Third;
        core: Core;
        helper: any;
        form: FormManager;
        skin: any;
        self: PlutoPlugin;
    }
    export interface Third {
        assets: any;
        modules: any;
        dva: ThirdComponent;
        react: ThirdComponent;
        qa: ThirdComponent;
        templater: ThirdComponent;
    }

    export interface Core {
        css: CoreExecutor;
        json: CoreExecutor;
        image: CoreExecutor;
        markdown: CoreExecutor;
        sandbox: CoreExecutor;
        yaml: CoreExecutor;
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
         * 检查组件是否可用
         */
        check(): void;
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
        load(params: ModParams): Promise<void>;
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
    export interface CoreExecutor {

        codes: Map<string, any>;
        configPath: string;

        excutable(type: string): boolean;
        /**
         * 执行组件注册
         * @param block 组件代码块对象
         */
        execute(module: MiniModule, started: boolean): Promise<void>;
        /**
         * 执行所有注册的组件
         */
        executeAll(): Promise<void>;
    }

    // 定义模块的元数据接口
    export interface MiniModule {
        id: string;
        name: string;
        type: string;
        order: number;
        enabled: boolean;
        bgColor?: string; // 用于存储随机渐变色
        files: ModFile[]; // 直接在MiniModule中包含文件数组
        tmpFiles?: ModFile[]; // 临时存储文件数组，用于执行
        bgUrl?: string | null; // 用于存储图片 URL
    }
    export interface ModFile {
        name: string;
        type: string;
        content: string;
        blobUrl?: string; // 用于存储图片 Blob URL
    }
    export interface ModParams {
        module: MiniModule;
        file: ModFile;
        yaml?: any;
        started: boolean;
    }
}

