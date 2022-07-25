import { isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readOnly } from "./reactive";

// 优化点，函数初始化,后续的get、set拦截就不用重复创建函数了
const get = createGetter(false);
const set = createSetter();
const readOnlyGet = createGetter(true);
const shallowReadOnlyGet = createGetter(true, true);

// 代码重构 保持代码结构一致性
function createGetter(isReadOnly, shallowReadOnly = false) {
    // 返回的是一个 Proxy 代理对象
    return function get(target, key){
        // 如果进来的 key 是 __v_isReactive 或者 __v_isReadOnly
        // 说明本次触发 getter 事件的目的是验证某一个对象是否是 reactive 对象 或者 readOnly对象
        if(key === ReactiveFlags.IS_REACTIVE){
            return !isReadOnly;
        }else if(key === ReactiveFlags.IS_READONLY){
            return isReadOnly;
        }
        
        const res = Reflect.get(target, key);

        if(shallowReadOnly){
            return res;
        }

        // 自顶向下 开发模式
        // 先实现想要达到的效果，再去编写下层的函数
        if(isObject(res)){
            return isReadOnly ? readOnly(res) : reactive(res);
        }

        // TODO 依赖收集
        if(!isReadOnly) track(target, key)
        return res;
    }
}

function createSetter(isReadOnly = false) {
    return function set(target, key, value){
        const res = Reflect.set(target, key, value);
        // TODO 触发依赖
        if(!isReadOnly) trigger(target, key);
        return res;
    }
}

export const mutableHandlers = {
    // 优化点，这里我们每次拦截get方法的都都需要创建一个createGetter或createSetter函数，因此我们可以将其抽离出来，做一个初始化
    // 后续在使用的时候，就一直使用初始化的那个就可以了
    get: get,
    set: set
}

export const readOnlyHandlers = {
    get: readOnlyGet,
    set(target, key, value){
        console.warn(`key: ${key} set 失败， 因为 target 是 readOnly，${target}`)
        return true;
    }
}

export const shallowReadOnlyHandlers = {
    get: shallowReadOnlyGet,
    set(target, key, value){
        console.warn(`key: ${key} set 失败， 因为 target 是 readOnly，${target}`)
        return true;
    }
}