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