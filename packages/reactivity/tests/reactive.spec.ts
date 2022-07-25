import {isProxy, isReactive, reactive} from '../reactive'

describe('reactive', () => {
    it('happy path' , () => {
        const original = {foo: 1};
        const observed = reactive(original);

        expect(observed).not.toBe(original);
        // 触发get拦截
        // debugger
        expect(observed.foo).toBe(1);
        // 传入的是 proxy 代理对象
        // debugger
        expect(isReactive(observed)).toBe(true);
        // 传入源对象
        expect(isReactive(original)).toBe(false);
        expect(isProxy(observed)).toBe(true);
    })

    // 嵌套的obj对象是不是reactive对象
    it('nested reactives', () => {
        const original = {
            nested: { 
                foo: 1,
            },
            array: [
                {bar: 1},
                {baz: 2}
            ]
        }
        const observed = reactive(original);

        expect(isReactive(observed.nested)).toBe(true);
        expect(isReactive(observed.array)).toBe(true);
        expect(isReactive(observed.array[1])).toBe(true);
    })
})