import { h } from '../../lib/bear-s-mini-vue.esm.js'
import { Foo } from './foo.js';

window.self = null;
export const App = {
    name: 'App',
    render(){
        // emit
        // type, props?, children?
        return h('div', {}, [h('div', {}, " "), h(Foo, {
            // emit on + Event
            onAdd(a,b){
                console.log('Foo 里的 emit：onAdd',a,b)
            },
            onAddFoo(a,b){
                console.log('Foo 里的 emit：onAddFoo',a,b)
            }
        })]);
    },
    setup(){
        return {};
    }
}