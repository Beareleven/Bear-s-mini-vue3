import { render } from "./render";
import { createVNode } from "./vnode";

export function createApp(rootComponent){
    return {
        mount(rootContainer){
            // 先转换为 vNode
            // component ->vNode
            // 所有的逻辑操作 都在vNode 上进行处理

            // 组件转换为虚拟节点（vNode）
            // rootContainer 根容器
            // debugger
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    }
}

