// 所有模块的下的通用的工具或者函数
// 判断一个值是否是对象
const isObject = (val) => {
    return typeof val === 'object' && val !== null;
};
// 判断该对象上有没有这个属性
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
// 
// 首字母大写
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// 加上foo
const toHanlderKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};
// 烤肉串命名 -> 驼峰命名
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, char) => {
        return char ? char.toUpperCase() : "";
    });
};

// 收集依赖函数
// 全局变量映射，便于在track函数和trigger函数中使用
const targetMap = new Map();
// reactive梳理map 触发依赖
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
// 触发依赖
function triggerEffect(dep) {
    for (const effect of dep) {
        // 当有scheduler方法时，执行scheduler
        // 否则继续执行run
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

// 优化点，函数初始化,后续的get、set拦截就不用重复创建函数了
const get = createGetter(false);
const set = createSetter();
const readOnlyGet = createGetter(true);
const shallowReadOnlyGet = createGetter(true, true);
// 代码重构 保持代码结构一致性
function createGetter(isReadOnly, shallowReadOnly = false) {
    // 返回的是一个 Proxy 代理对象
    return function get(target, key) {
        // 如果进来的 key 是 __v_isReactive 或者 __v_isReadOnly
        // 说明本次触发 getter 事件的目的是验证某一个对象是否是 reactive 对象 或者 readOnly对象
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (key === "__v_isReadOnly" /* ReactiveFlags.IS_READONLY */) {
            return isReadOnly;
        }
        const res = Reflect.get(target, key);
        if (shallowReadOnly) {
            return res;
        }
        // 自顶向下 开发模式
        // 先实现想要达到的效果，再去编写下层的函数
        if (isObject(res)) {
            return isReadOnly ? readOnly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter(isReadOnly = false) {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // TODO 触发依赖
        if (!isReadOnly)
            trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    // 优化点，这里我们每次拦截get方法的都都需要创建一个createGetter或createSetter函数，因此我们可以将其抽离出来，做一个初始化
    // 后续在使用的时候，就一直使用初始化的那个就可以了
    get: get,
    set: set
};
const readOnlyHandlers = {
    get: readOnlyGet,
    set(target, key, value) {
        console.warn(`key: ${key} set 失败， 因为 target 是 readOnly，${target}`);
        return true;
    }
};
const shallowReadOnlyHandlers = {
    get: shallowReadOnlyGet,
    set(target, key, value) {
        console.warn(`key: ${key} set 失败， 因为 target 是 readOnly，${target}`);
        return true;
    }
};

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
// readOnly其实就是reactive只读方法的一种实现
function readOnly(raw) {
    return createActiveObject(raw, readOnlyHandlers);
}
// 对象表层响应式并且只读
function shallowReadOnly(raw) {
    return createActiveObject(raw, shallowReadOnlyHandlers);
}
// 可以看到 return new Proxy(raw, readOnlyHandlers); 这个语句是相同的，同样我们也可以进行抽离
function createActiveObject(raw, baseHandler) {
    // 对象坚持
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandler);
}

function emit(instance, event, ...args) {
    // emit传进来的事件是 add
    console.log('emit', event);
    // instance.props -> event回调函数
    const { props } = instance;
    // TPP 开发技巧
    // 先去写一个特定的行为 -> 重构 -> 通用行为
    // add -> Add
    // add-foo -> AddFoo
    // 通用函数抽离到 share
    // 首字母大写
    // const capitalize = (str) => {
    //     return str.charAt(0).toUpperCase() + str.slice(1);
    // }
    // // 加上foo
    // const toHanlderKey = (str) => {
    //     return str ? "on" + capitalize(str) : "";
    // }
    // // 烤肉串命名 -> 驼峰命名
    // const camelize = (str) => {
    //     return str.replace(/-(\w)/g, (_, char) => {
    //         return char ? char.toUpperCase() : "";
    //     })
    // }
    const handlerName = toHanlderKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicInstanceMap = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState 里的值
        const { setupState, props } = instance;
        // if(key in setupState){
        //     return Reflect.get(setupState, key);
        // }
        if (hasOwn(setupState, key)) {
            return Reflect.get(setupState, key);
        }
        else if (hasOwn(props, key)) {
            return Reflect.get(props, key);
        }
        // key -> $el (this.$el)
        const publicGetter = publicInstanceMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children];
    // 不一定都有children，有children也不一定都是slots类型
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.slot_children */) {
        const slots = {};
        for (const key in children) {
            // slot -> function
            const value = children[key];
            slots[key] = (props) => normalizeSlotValue(value(props));
        }
        instance.slots = slots;
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
    };
    // 小技巧，使用bind去填充的一个参数，这样用户在传入的时候，就是直接传入第二个了
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
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
        const setupResult = setup(shallowReadOnly(instance.props), {
            emit: instance.emit,
        });
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
    // 解构出vnode的shapeflag
    const { shapeFlag } = vnode;
    // 使用与运算符进行查找
    if (shapeFlag & 1 /* ShapeFlags.element */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.stateful_component */) {
        processComponent(vnode, container);
    }
    // if(typeof vnode.type === "string"){
    //     processElement(vnode, container);
    // }else if(isObject(vnode.type)){
    //     processComponent(vnode, container);
    // }
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
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* ShapeFlags.text_children */) {
        // debugger
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.array_children */) {
        mountChildren(vnode, el);
    }
    // if(typeof children === 'string') {
    //     el.textContent = children
    // }else if(Array.isArray(children)){
    //     mountChildren(vnode, el)
    // }
    // props
    // 渲染 挂载到真实dom节点上
    const { props } = vnode;
    for (let key in props) {
        const val = props[key];
        console.log(key);
        // 规范 ： on + 事件名 on + Click
        // 具体的 click ->  重构 -> 通用
        // 具体 -> 重构 -> 通用
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
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
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    // children
    // 判断 vnode 的child 是什么类型的 一个shapeFlags是一个存储多种类型状态的
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.text_children */;
    }
    else {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.array_children */;
    }
    // 判断是不是一个slot
    // 必须是一个是 组件类型 + children 必须是一个object
    if (vnode.shapeFlag & 2 /* ShapeFlags.stateful_component */) {
        if (typeof children === 'object') {
            vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.slot_children */;
        }
    }
    return vnode;
}
// 总体来讲，为vnode的shapeFlags做了一个初始化
// 判断 type 是一个element（一个可渲染的标签（div， p））还是一个组件
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.element */ : 2 /* ShapeFlags.stateful_component */;
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

function renderSlots(slots, name, props) {
    const slot = slots[name];
    // slot -> function
    if (slot) {
        if (typeof slot === "function") {
            return createVNode('div', {}, slot(props));
        }
    }
}

export { createApp, h, renderSlots };
