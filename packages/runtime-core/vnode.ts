import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type, props?, children?){
    const vnode = { 
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el : null,
    }

    // children
    // 判断 vnode 的child 是什么类型的 一个shapeFlags是一个存储多种类型状态的
    if(typeof children === 'string'){
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.text_children
    }else{
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.array_children
    }

    // 判断是不是一个slot
    // 必须是一个是 组件类型 + children 必须是一个object
    if(vnode.shapeFlag & ShapeFlags.stateful_component){
        if(typeof children === 'object'){
            vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.slot_children;
        }
    }
    return vnode;
}

// 总体来讲，为vnode的shapeFlags做了一个初始化
// 判断 type 是一个element（一个可渲染的标签（div， p））还是一个组件
function getShapeFlag(type){
    return typeof type === 'string' ? ShapeFlags.element : ShapeFlags.stateful_component;
}