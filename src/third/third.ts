// 创建一个简单的ThirdComponent实现，用于其他插件
export class SimpleThirdComponent implements ThirdComponent {
    
    op: any;
    api: any;
    codes: Map<string, any> = new Map();

    register(key: string, code: any) {
        this.codes.set(key, code);
    }

    bind(op: any, prop: PlutoProps): ThirdComponent {
        this.op = op;
        this.api = op.api;
        window.pluto.third[prop] = this;
        console.log(`[Pluto Hub] ${prop} successfully bound to pluto.third.${prop}`);
        return this;
    }

    execute(block: any){ }

    executeAll(): void { }
}

export class ReactComponent extends SimpleThirdComponent {

    execute(block: any){
        this.op.registerComponent(block.code, block.name, block.namespace, block.suppressRefresh);
    }

    executeAll(): void {
        this.codes.forEach(t => {
            this.op.registerComponent(t.code, t.name, t.namespace, t.suppressRefresh);
        });
    }
}
export class DvaComponent extends SimpleThirdComponent { }
export class TemplaterComponent extends SimpleThirdComponent { }
export class QaComponent extends SimpleThirdComponent { }

// ThirdComponent工厂类，用于根据prop创建相应的组件实例
export class ThirdFactory {
    // 使用映射对象替代switch case，根据prop创建相应的组件实例
    private static componentMap: Record<string, any> = {
        'react': ReactComponent,
        'dva': DvaComponent,
        'templater': TemplaterComponent,
        'qa': QaComponent
    };

    static create(prop: string): ThirdComponent {
        // 从映射对象中获取对应的组件类，如果不存在则使用SimpleThirdComponent
        const ComponentClass = this.componentMap[prop] || SimpleThirdComponent;
        return new ComponentClass();
    }
}