import { hasChanged, isObject } from "../shared";
import { isTrack, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

// ref 跟 reactive 
// ref 传过来的都是单值， 比如 1，true，'str'
// 这种值我们如何知道他被 set get 呢，之前的 reactive 都是一个Proxy代理对象
// Proxy 只针对对象 对于我们值类型就不起作用了
// 因此 ref 我们就需要对其进行包裹 也就是 refImpl 这个类。在这个类里面我们实现了 value，get，set等方法
// 我们就可以知道什么时候回触发 set get，我们知道这个时机之后便可以进行 依赖收集、依赖触发等等操作了
class refImpl{
    private _value: any;
    public dep;
    private _rawValue: any;
    public __v_isRef : any = true;
    constructor(value){
        // 1. 如果传进来的是，对象，需要对其进行reactive处理
        // 2. 对象进行reactive处理过后，就会变成一个Proxy对象，但我们在set的时候，对比是两个是不是object
        // 3. 但我们在set的时候，新传过来的值可能会是一个object，而不是一个Proxy
        // 因此，我们需要存储一个原始值
        this._rawValue = value;
        this._value= convertValue(value);
        // this._value = isObject(value) ? reactive(value) : value;
        this.dep = new Set();
    }

    get value(){
        // 依赖收集 track
        if(isTrack()) trackEffect(this.dep)
        return this._value;
    }

    set value(newValue){
        // 先修改 value 再去触发
        // hasChanged(this._value, newValue)
        // 将原始值和新传进来的值做对比，如果发生改变
        // 1. 将原始值进行更改
        // 2. 判断value是否为对象，是否需要响应式进行赋值
        // 3. 触发依赖
        if(hasChanged(this._rawValue, newValue)){
            this._rawValue = newValue;
            this._value = convertValue(newValue);
            // this._value = isObject(newValue) ? reactive(newValue) : newValue;
            triggerEffect(this.dep)
        }
    }
}

// 判断是否为嵌套对象，嵌套对象也需要做响应式 给原始值做转换
function convertValue(value){
    return isObject(value) ? reactive(value) : value;
}
export function ref(value){
    return new refImpl(value);
}


export function isRef(ref){
    return !!ref.__v_isRef;
}

export function unRef(ref){
    // 如果是ref对象，返回ref.value
    return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithProxy){
    return new Proxy(objectWithProxy, {
        // get -> age isRef -> age.value
        // not a ref -> age
        get(target, key){
            return unRef(Reflect.get(target, key))
        },
        set(target, key, value){
            if(isRef(target[key]) && !isRef(value)){
                // 修改.value
                return target[key].value = value;
            }else{
                // 替换
                return Reflect.set(target, key, value);
            }
        }
    })
}