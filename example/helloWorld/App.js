export const App = {
    // .vue
    // <template></template> -> 编译成render函数

    // render 函数
    render(){
        return h('div', 'hi,' + this.msg)
    },

    setup(){
        // composition api
        return {
            msg: 'mini-vue'
        }
    }
}