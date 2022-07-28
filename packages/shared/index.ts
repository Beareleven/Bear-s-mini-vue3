// 所有模块的下的通用的工具或者函数
export const extend = Object.assign

// 判断一个值是否是对象
export const isObject = (val) =>{
    return typeof val === 'object' && val !== null;
}

// 比较两个值是否有更新 
export const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal);
}

// 判断该对象上有没有这个属性
export const hasOwn = (value: any, key) => Object.prototype.hasOwnProperty.call(value, key);

// 

 // 首字母大写
export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// 加上foo
export const toHanlderKey = (str) => {
    return str ? "on" + capitalize(str) : "";
}
// 烤肉串命名 -> 驼峰命名
export const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, char) => {
        return char ? char.toUpperCase() : "";
    })
}