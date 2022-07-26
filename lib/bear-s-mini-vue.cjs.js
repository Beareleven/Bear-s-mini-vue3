'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// 所有模块的下的通用的工具或者函数
// 判断一个值是否是对象
const isObject = (val) => {
    return typeof val === 'object' && val !== null;
};

const publicInstanceMap = {
    $el: (instance) => instance.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState 里的值
        const { setupState } = instance;
        if (key in setupState) {
            return Reflect.get(setupState, key);
        }
        // key -> $el (this.$el)
        const publicGetter = publicInstanceMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps();
    // initSlots();
    // 有状态的组件
    setupStateComponent(instance);
}
function setupStateComponent(instance) {
    // 获取到用户的 page
    const Component = instance.type;
    // 初始化代理对象
    // ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // setup 是可以返回一个function 或者 object的
        // 1. 返回function，我们就认为返回当前组件的一个 render函数
        // 2. 返回object，会把返回的object注入到当前组件的上下文中
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO
    // 返回为 function 处理
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponetSetup(instance);
}
function finishComponetSetup(instance) {
    const Component = instance.type;
    // 检测
    instance.render = Component.render;
}

function render(vnode, container) {
    // patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // 检查虚拟节点的类型
    // console.log(vnode)
    // componen处理
    // element处理
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode, container);
}
function mountComponent(initialVnode, container) {
    // 通过虚拟节点创建组件实例对象
    // 后续组件会有自己的 props slots 等
    const instance = createComponentInstance(initialVnode);
    setupComponent(instance);
    // debugger
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    // console.log(subTree)
    patch(subTree, container);
    // 要在所有的 element -> mount 之后
    initialVnode.el = subTree.el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // vnode.el 把根节点 存储到 vnode上
    // vnode -> element -> div
    const el = vnode.el = document.createElement(vnode.type);
    // children
    // string array
    const { children } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    for (let key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((_vnode) => {
        patch(_vnode, container);
    });
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换为 vNode
            // component ->vNode
            // 所有的逻辑操作 都在vNode 上进行处理
            // 组件转换为虚拟节点（vNode）
            // rootContainer 根容器
            // debugger
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
