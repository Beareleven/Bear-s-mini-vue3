import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode){
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    }
    return component;
}

export function setupComponent(instance){
    // TODO
    // initProps();
    // initSlots();

    // 有状态的组件
    setupStateComponent(instance)
}

function setupStateComponent(instance){
    // 获取到用户的 page
    const Component = instance.type;

    // 初始化代理对象
    // ctx
    instance.proxy = new Proxy({_ : instance}, PublicInstanceProxyHandlers)
    const { setup } = Component;

    if(setup){
        // setup 是可以返回一个function 或者 object的
        // 1. 返回function，我们就认为返回当前组件的一个 render函数
        // 2. 返回object，会把返回的object注入到当前组件的上下文中
        const setupResult = setup();

        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult){
    // TODO
    // 返回为 function 处理

    if(typeof setupResult === "object"){
        instance.setupState = setupResult;
    }

    finishComponetSetup(instance);
}

function finishComponetSetup(instance: any) {
    const Component = instance.type;
    // 检测

    instance.render = Component.render;
}
