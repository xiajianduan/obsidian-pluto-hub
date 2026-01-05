import { DvaComponent } from "./DvaComponent";
import { QaComponent } from "./QaComponent";
import { ReactComponent } from "./ReactComponent";
import { SimpleThirdComponent } from "./SimpleThirdComponent";
import { TemplaterComponent } from "./TemplaterComponent";

// ThirdComponent工厂类，用于根据prop创建相应的组件实例
export class ThirdFactory {
    // 使用映射对象替代switch case，根据prop创建相应的组件实例
    private static componentMap: Record<string, any> = {
        'react': ReactComponent,
        'dva': DvaComponent,
        'templater': TemplaterComponent,
        'qa': QaComponent
    };

    static create(prop: string, configPath: string): ThirdComponent {
        // 从映射对象中获取对应的组件类，如果不存在则使用SimpleThirdComponent
        const ComponentClass = this.componentMap[prop] || SimpleThirdComponent;
        return new ComponentClass(configPath);
    }

    static createThirdComponent(configPath: string): Third {
        return {
            assets: {},
            modules: {},
            dva: ThirdFactory.create('dva', configPath), // Dataview
            react: ThirdFactory.create('react', configPath), // React Components
            qa: ThirdFactory.create('qa', configPath), // QuickAdd
            templater: ThirdFactory.create('templater', configPath), // Templater
        };
    }
}
