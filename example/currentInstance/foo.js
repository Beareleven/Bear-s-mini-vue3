import { h, renderSlots, getCurrentInstance } from '../../lib/bear-s-mini-vue.esm.js'

export const Foo = {
    name: "Foo",
    setup(){
        // 获取当前组件的实例对象
        const instance = getCurrentInstance();
        console.log('Foo: ', instance)
        return {}
    },
    render() {
        const foo = h('p', {}, 'foo')
        // 具名插槽：
        // 作用域插槽
        const age = 18;
        return h('div', {}, [
            renderSlots(this.$slots, 'header', {
                age,
            }),
            foo,
            renderSlots(this.$slots, 'footer')
        ])
    }
}