import { hasOwn } from "../shared/index";

const publicInstanceMap = {
    $el: (instance: any) => instance.vnode.el,
    $slots: (instance: any) => instance.slots
}

export const PublicInstanceProxyHandlers = {
    get({_ : instance}, key){
        // setupState 里的值
        const { setupState, props } = instance;
        // if(key in setupState){
        //     return Reflect.get(setupState, key);
        // }

        if(hasOwn(setupState, key)){
            return Reflect.get(setupState, key);
        }else if(hasOwn(props, key)){
            return Reflect.get(props, key);
        }

        // key -> $el (this.$el)
        const publicGetter = publicInstanceMap[key];
        if(publicGetter){
            return publicGetter(instance);
        }
    }
}