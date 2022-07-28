import { isObject } from "../shared/index";
import { mutableHandlers, readOnlyHandlers, shallowReadOnlyHandlers } from "./baseHandler";

export const enum ReactiveFlags  {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadOnly',
}

export function reactive(raw){
    return createActiveObject(raw, mutableHandlers);
}

// readOnly其实就是reactive只读方法的一种实现
export function readOnly(raw){
    return createActiveObject(raw, readOnlyHandlers);
}

// 对象表层响应式并且只读
export function shallowReadOnly(raw){
    return createActiveObject(raw, shallowReadOnlyHandlers);
}

export function isReactive(value){ 
    // 如果不是readOnly，那就是reactive了
    // 这里获取的是value的 ReactiveFlags.IS_REACTIVE 属性
    // 因此传过去的target 是 value key 就是为 ReactiveFlags.IS_REACTIVE 的值
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadOnly(value){
    return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value){
    return isReactive(value) || isReadOnly(value);
}
// 可以看到 return new Proxy(raw, readOnlyHandlers); 这个语句是相同的，同样我们也可以进行抽离
function createActiveObject(raw, baseHandler){
    // 对象坚持
    if(!isObject(raw)){
        console.warn(`target ${raw} 必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandler);
}

