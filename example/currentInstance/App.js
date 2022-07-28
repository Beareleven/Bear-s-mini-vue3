import { h , createTextVnode, getCurrentInstance} from '../../lib/bear-s-mini-vue.esm.js'
import { Foo } from './foo.js';


window.self = null;
export const App = {
    name: 'App',
    render(){
        const app = h('div', {}, 'App');
        const foo = h(Foo, {}, 
            {
                header: ({ age }) => [
                    h("p", {}, 'header' + age),
                    // 要渲染的必须是一个虚拟节点，因此，应该把文本给包裹起来
                    createTextVnode('你好啊')
                ],
                footer: () => h("a", {}, 'footer')
            }
        );
        // const foo = h(Foo, {}, h("p", {}, '123'));

        return h('div', {
            class: 'test'
        }, [foo]);
        // return h('div', {}, '1231232');
        // return h('div', {}, [h('p', {}, '123'), h('p', {}, '456')]);
    },
    setup(){
        const instance = getCurrentInstance();
        console.log('App: ', instance)

        return {};
    }
}