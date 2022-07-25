import { isProxy, isReadOnly, readOnly } from "../reactive";

describe('readOnly', () => {
    it('happy path', () => {
        // 功能总体来说是跟reactive是没有较大的差别
        // 但是他对应的响应式数据不能被set，也就是不能被更新
        // 也就是说readOnly不会被触发依赖，那自然也就不用收集依赖了
        const original = {foo: 1, bar: {baz: 2} };
        const wrapped = readOnly(original);

        expect(wrapped).not.toBe(original);
        expect(wrapped.foo).toBe(1)

        expect(isReadOnly(wrapped)).toBe(true);
        expect(isReadOnly(wrapped.bar)).toBe(true);
        expect(isReadOnly(original)).toBe(false);
        expect(isReadOnly(original.bar)).toBe(false);
        expect(isProxy(wrapped)).toBe(true);

    })

    it('warn then call set', () => {
        // consloe.warn()
        // mock 技术
        console.warn = jest.fn()

        const user = readOnly({
            age : 10
        })

        user.age = 11;
        expect(console.warn).toBeCalled();
    })

    it
})