import { camelize, toHanlderKey } from "../shared/index";

export function emit(instance,  event, ...args){
    // emit传进来的事件是 add
    console.log('emit', event);

    // instance.props -> event回调函数
    const {props} = instance;

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