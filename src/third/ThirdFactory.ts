import { DvaComponent } from "./DvaComponent";
import { QaComponent } from "./QaComponent";
import { ReactComponent } from "./ReactComponent";
import { SimpleComponent } from "./SimpleComponent";
import { TemplaterComponent } from "./TemplaterComponent";

// ThirdComponent工厂类，用于根据prop创建相应的组件实例
export class ThirdFactory {
    // 使用映射对象替代switch case，根据prop创建相应的组件实例
    private static componentMap: Record<PlutoProps, any> = {
        'react': ReactComponent,
        'dva': DvaComponent,
        'templater': TemplaterComponent,
        'qa': QaComponent
    };
    private static instances = new Map<PlutoProps, ThirdComponent>();

    static create(prop: PlutoProps, configPath: string): ThirdComponent {
        // 从映射对象中获取对应的组件类，如果不存在则使用SimpleThirdComponent
        const ComponentClass = ThirdFactory.componentMap[prop] || SimpleComponent;
        const component = new ComponentClass(configPath);
        ThirdFactory.instances.set(prop, component);
        return component;
    }

    static createThirdComponent(configPath: string): Third {
        const third:any = {
            assets: {},
            modules: {}
        };
        Object.keys(ThirdFactory.componentMap).forEach((prop: PlutoProps) => {
            third[prop] = ThirdFactory.create(prop, configPath);
        });
        return third;
    }

    static loop(callback: (prop: PlutoProps) => void) {
        Object.keys(ThirdFactory.componentMap).forEach((prop: PlutoProps) => callback(prop));
    }

    static getInstance(prop: PlutoProps): ThirdComponent {
        return ThirdFactory.instances.get(prop)!;
    }
}
