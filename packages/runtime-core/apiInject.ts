import { getCurrentInstance } from "./component";

export function provide(key, value){
    // 存
    // 获取当前的实例对象
    const currentInstance: any = getCurrentInstance();

    if(currentInstance){
        let { provides } = currentInstance;
        const ParentProvides = currentInstance.parent.provides;
        // 初始化的时候，provides 肯定是更 他父组件的 provides想听的，因此，这就是一个判断的时机
        if(provides === ParentProvides){
            // 将父组件的 provides 作为 当前实例的 原型对象，这样获取值当时候便会跟js取值时一样，不断得去父组件上查找
            provides = currentInstance.provides = Object.create(ParentProvides);
        }
        provides[key] = value;
    }

}

export function inject(key, defaultValue) {
    // 取 父级组件
    const currentInstance: any = getCurrentInstance();

    if(currentInstance){
        const parentProvides = currentInstance.parent.provides;
        if(key in parentProvides){
            return parentProvides[key];
        }else if(defaultValue){
            if(typeof defaultValue === 'function'){
                return defaultValue();
            }
            return defaultValue;
        }
    }
}