import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container){
    // patch
    patch(vnode, container)
}

function patch(vnode, container){
    // 检查虚拟节点的类型
    // console.log(vnode)

    // componen处理
    // element处理
    // 解构出vnode的shapeflag
    const { shapeFlag } = vnode;
    // 使用与运算符进行查找
    if(shapeFlag & ShapeFlags.element){
        processElement(vnode, container);
    }else if(shapeFlag & ShapeFlags.stateful_component){
        processComponent(vnode, container);
    }

    // if(typeof vnode.type === "string"){
    //     processElement(vnode, container);
    // }else if(isObject(vnode.type)){
    //     processComponent(vnode, container);
    // }

}

function processComponent(vnode: any, container: any) {
    // 挂载组件
    mountComponent(vnode, container);
}

function mountComponent(initialVnode, container) {
    // 通过虚拟节点创建组件实例对象
    // 后续组件会有自己的 props slots 等
    const instance = createComponentInstance(initialVnode)
    setupComponent(instance);
    // debugger
    setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance: any, initialVnode ,container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);

    // vnode -> patch
    // vnode -> element -> mountElement
    // console.log(subTree)
    patch(subTree, container)

    // 要在所有的 element -> mount 之后
    initialVnode.el = subTree.el
}

function processElement(vnode: undefined, container: any) {
    mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
    // vnode.el 把根节点 存储到 vnode上
    // vnode -> element -> div
    const el = vnode.el = document.createElement(vnode.type);

    // children
    // string array
    const { children, shapeFlag } = vnode;
    if(shapeFlag & ShapeFlags.text_children){
        // debugger
        el.textContent = children
    }else if(shapeFlag & ShapeFlags.array_children){
        mountChildren(vnode, el)
    }
    
    // if(typeof children === 'string') {
    //     el.textContent = children
    // }else if(Array.isArray(children)){
    //     mountChildren(vnode, el)
    // }
    // props
    // 渲染 挂载到真实dom节点上
    const { props } = vnode;
    for(let key in props) {
        const val = props[key];
        console.log(key);
        // 规范 ： on + 事件名 on + Click
        // 具体的 click ->  重构 -> 通用
        // 具体 -> 重构 -> 通用
        const isOn = (key) => /^on[A-Z]/.test(key);
        if(isOn(key)){
            const event = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event, val)
        }else{
            el.setAttribute(key, val)
        }   
    }

    container.append(el);
}

function mountChildren(vnode: any, container: any){
    vnode.children.forEach((_vnode) => {
        patch(_vnode, container);
    })
}