import { computed } from "../computed";
import { reactive } from "../reactive"

describe("happy path", () => {
    it("comptued", () => {
        const user = reactive({age: 10});
        const age = computed(() =>{
            return user.age;
        })
        expect(age.value).toBe(10)
    })

    it("should compute lazily", () => {
        const value = reactive({
            foo: 1,
        })
        const getter = jest.fn(() => {
            return value.foo;
        });

        const cValue = computed(getter);

        // lazy 懒执行 如果不调用 cValue.value 的话，是不会去调用 getter函数的
        expect(getter).not.toHaveBeenCalled();

        expect(cValue.value).toBe(1);
        expect(getter).toHaveBeenCalledTimes(1);

        // 再次执行 cValue.value 不应该再执行一遍getter
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(1);

        // 改变响应式对象的值
        value.foo = 2;
        expect(getter).toHaveBeenCalledTimes(1);

        cValue.value;
        expect(getter).toHaveBeenCalledTimes(2);
    })
}) 