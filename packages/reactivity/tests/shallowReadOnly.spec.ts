import { isReadOnly, shallowReadOnly } from "../reactive";


describe("shallowReadOnly", () => {
    it("should not make non-reactive properties reactive", () => {
        const props = shallowReadOnly({ n : {foo: 1}});
        expect(isReadOnly(props)).toBe(true);
        expect(isReadOnly(props.n)).toBe(false);
    })

    it('warn then call set', () => {
        // consloe.warn()
        // mock 技术
        console.warn = jest.fn()

        const user = shallowReadOnly({
            age : 10
        })

        user.age = 11;
        expect(console.warn).toBeCalled();
    })
})