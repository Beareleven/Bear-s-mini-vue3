import { render } from "./render";

export function createApp(rootComponent){
    return {
        mount(rootContainer){
            // 先转换为 vNode
            // component ->vNode
            // 所有的逻辑操作 都在vNode 上进行处理

            // 组件转换为虚拟节点（vNode）
            const vnode = createApp(rootContainer);

            render(vnode, rootContainer);
        }
    }
}

