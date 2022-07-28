import { h } from '../../lib/bear-s-mini-vue.esm.js'

export const Foo = {
    setup(props) {
        // 1. props 把值传过来setup
        console.log(props)
        // 2. rende 中通过 this访问到props
        // 3. props 是不能被修改的 ShallowReadOnly 单向数据流
        props.count++;
    },
    render(){
        return h('div', {}, "foo: " + this.count);
    }
}