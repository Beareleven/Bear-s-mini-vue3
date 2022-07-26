import { h } from '../../lib/bear-s-mini-vue.esm.js'

window.self = null;
export const App = {
    // .vue
    // <template></template> -> 编译成render函数

    // render 函数
    render(){
        window.self = this;
        // h()创建虚拟节点 是一个虚拟节点树
        return h(
            'div', 
            {
                id: 'root',
            },
            // setupState 中的值
            // this.$el 当前组件的根元素 -> get root element
            // this.$data
            // 代理模式 proxy 把这些都给代理起来，便于用户注重逻辑
            // string
            'hi, ' + this.msg

            // array
            // [h('p', { class: 'red'}, 'hi'), h('p', { class: 'bule'}, 'minimini-vue')]
        );
    },
    setup(){
        // composition api
        return {
            msg: 'mini-vue-hahaha'
        }
    }
}