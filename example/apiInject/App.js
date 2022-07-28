import { h , createTextVnode, getCurrentInstance, provide, inject} from '../../lib/bear-s-mini-vue.esm.js'
import { Foo } from './foo.js';

const Provider = {
    name: 'provider',
    setup(){
        provide('foo', 'fooVal');
        provide('bar', 'barVal');
    },
    render(){
        return h('div', {}, [h('p', {}, "Provider"), h(ProviderTwo)]);
    }
}

const ProviderTwo = {
    name: 'providerTwo',
    setup(){
        provide('foo', 'fooTwoVal');
        const foo = inject('foo');

        return {
            foo
        }
    },
    render(){
        return h('div', {}, [h('div', {}, "ProviderTwo " + this.foo), h(Consumer)]);
    }
}

const Consumer = {
    name: 'consumer',
    setup(){
        const foo = inject("foo");
        const bar = inject("bar");
        const baz = inject("baz", 'dedede');
        const bbb = inject("bbb", () => 'aaaaaa')
        return {
            foo,
            bar,
            baz,
            bbb
        }
    },

    render(){
        return h('div', {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz} - ${this.bbb}`);
    }
}

export const App = {
    name: 'App',
    setup(){},
    render(){
        return h('div', {}, [h('p', {}, 'apiInject'), h(Provider)])
    }
}