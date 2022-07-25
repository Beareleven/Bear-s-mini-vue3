import { ReactiveEffect } from "./effect";

class ComputedRefImpl{
    private _getter: any;
    private _dirty: boolean = true;
    private _value: any;
    private _effect: any;
    constructor(getter){
        this._getter = getter;
        // 利用 scheduler 来改变dirty值，并且使得getter不会重复执行
        this._effect = new ReactiveEffect(getter, () => {
            if(!this._dirty) this._dirty = true;
        });
    }

    get value(){
        // 当依赖的响应式对象的值发生改变的时候 dirty 应该变为 true
        // effect 收集一下依赖
        if(this._dirty){
            this._dirty = false;
            this._value = this._effect.run();
        }
        return this._value;
    }
}


export function computed(getter){
    return new ComputedRefImpl(getter);
}