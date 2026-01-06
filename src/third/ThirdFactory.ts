import { DvaComponent } from "./DvaComponent";
import { FormComponent } from "./FormComponent";
import { QaComponent } from "./QaComponent";
import { ReactComponent } from "./ReactComponent";
import { SimpleThirdComponent } from "./SimpleThirdComponent";
import { TemplaterComponent } from "./TemplaterComponent";

// ThirdComponent工厂类，用于根据prop创建相应的组件实例
export class ThirdFactory {
    // 使用映射对象替代switch case，根据prop创建相应的组件实例
    static componentMap: Record<PlutoProps, any> = {
        'react': ReactComponent,
        'dva': DvaComponent,
        'templater': TemplaterComponent,
        'qa': QaComponent,
        'form': FormComponent
    };

    static create(prop: PlutoProps, configPath: string): ThirdComponent {
        // 从映射对象中获取对应的组件类，如果不存在则使用SimpleThirdComponent
        const ComponentClass = this.componentMap[prop] || SimpleThirdComponent;
        return new ComponentClass(configPath);
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
}
