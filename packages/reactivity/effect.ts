import { extend } from "../shared";

let activeEffect;
let shouldTrack = false;

export class ReactiveEffect{
    private _fn: any;
    deps = [];
    active: boolean = true;
    // onStop 类型为一个回调函数
    onStop? : () => void;
    // ? 代表可选值，可选也不选
    // public 表示公开方法，可以在外界直接访问
    constructor(fn, public scheduler?){
        this._fn = fn;
    }
    run(){
        // this是 新创建的实例 _effect
        // 将全局的 activeEffect 赋值为 effect 传递进来的fn参数
        // 为收集依赖（也就是传递进来的fn函数）时提供便利

        // active是我们用来判断是否调用过 stop 的一个变量。因此，我们可以通过 active 来判断是否应该继续收集依赖
        // active 为false，说明不应该收集依赖。直接 return 函数
        // shouldTrack 的初始值为 false，我们没有对其进行修改，故在收集之前，就会被退出
        if(!this.active){
            // debugger;
            return this._fn();
        }
        // 没有直接返回出去说明不是 stop 状态，应该收集依赖
        // 全局变量 shouldTrack 被我们初始化为 false，这里应该收集，就需要重新赋值
        shouldTrack = true;
        activeEffect = this;
        // 在这里会触发 get拦截操作 track会有一个添加依赖的动作
        const result = this._fn();
        // reset 添加完依赖之后把 shouldTrack 重新变为 false
        shouldTrack = false;
        return result;
    }
    stop(){
        // 利用active来判断之前是否已经调用过 stop 方法，避免二次清除容器，做无用功
        if(this.active){
            cleanupEffect(this);
            // stop回调
            if(this.onStop){
                this.onStop();
            }
            this.active = false;
        }
    }
}
// 清除依赖容器
function cleanupEffect(effect){
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    })
    // 优化点 清空
    effect.deps.length = 0;
}

// 收集依赖函数
// 全局变量映射，便于在track函数和trigger函数中使用
const targetMap = new Map();
export function track(target, key){
    // // 没有 activeEffect 说明还没有调用effect方法，自然也就没有依赖了，直接return
    // if(!activeEffect) return;
    // // 当shouldTrack 为false，也就是不应该收集依赖时，退出
    // if(!shouldTrack) return;

    // 重构抽离
    if(!isTrack()) return;

    // target -> key -> dep(容器)
    // 通过传进来的 target 找到 对应的依赖映射
    // 再通过 target 得到的map去找对应属性（key）的依赖函数
    // 一个属性可能会有多个依赖且依赖不能重复，故应采用set来对依赖进行存储
    // 在之后对象的属性被修改时，便可以通过这一条路径：
    // 1. depsMap = targetMap.get(target), 获取对象容器
    // 2. dep = depsMap.get(key), 获取对象属性对应的一个或多个依赖
    // 3. 通过for...of 依次触发依赖

    let depsMap = targetMap.get(target);
    // 初始化depsMap
    if(!depsMap){
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if(!dep){
        // 收集的依赖不能是重复的，因此此处使用Set数据结构
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffect(dep);
    
}
// 是否要进行依赖收集
export function isTrack(){
    return shouldTrack && activeEffect !== undefined;
}
// 收集依赖
export function trackEffect(dep){
    // 依赖收集
    if(dep.has(activeEffect)) return;

    dep.add(activeEffect)
    // 把容器都收集起来，当调用 stop 时便可以通过 实例的deps中的容器删除掉对应的依赖了
    activeEffect.deps.push(dep);
}
// reactive梳理map 触发依赖
export function trigger(target, key){
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);

    triggerEffect(dep);
}

// 触发依赖
export function triggerEffect(dep){
    for(const effect of dep){
        // 当有scheduler方法时，执行scheduler
        // 否则继续执行run
        if(effect.scheduler){
            effect.scheduler();
        }else{
            effect.run();
        }
    }
}

export function effect(fn, options :any = {}) {
    // fn
    // fn是一上来就需要调用的函数
    const scheduler = options.scheduler;
    const _effect = new ReactiveEffect(fn, scheduler);
    // 代码优化：后续可能还会有很多的options
    // 可以利用 Object.assign把 多个 option 挂载到 _effect 对象上
    // Object.assign(_effect, options)
    // _effect.onStop = options.onStop;

    // extend 把 Object.assign 重命名为 extend 意为扩展，富有语义化
    extend(_effect, options);

    _effect.run();
    // 挂载runner
    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

// stop方法
export function stop(runner){
    runner.effect.stop();
}