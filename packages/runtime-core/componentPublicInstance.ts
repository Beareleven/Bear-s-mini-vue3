const publicInstanceMap = {
    $el: (instance: any) => instance.vnode.el
}

export const PublicInstanceProxyHandlers = {
    get({_ : instance}, key){
        // setupState 里的值
        const { setupState } = instance;
        if(key in setupState){
            return Reflect.get(setupState, key);
        }

        // key -> $el (this.$el)
        const publicGetter = publicInstanceMap[key];
        if(publicGetter){
            return publicGetter(instance);
        }
    }
}