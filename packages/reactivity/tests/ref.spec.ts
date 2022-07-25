import { effect } from "../effect";
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref, unRef } from "../ref";

describe("ref", () => {
    it("happy path", () => {
        const a = ref(1);
        expect(a.value).toBe(1);
    })
    // 进行ref的数据应该是响应式的
    it("shoule be reactively", () => {
        const a = ref(1);
        let dummy, calls = 0;
        effect(() => {
            calls++;
            dummy = a.value;
        });
        expect(calls).toBe(1);
        expect(dummy).toBe(1);
        // debugger;
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
        // 设置同样的值，不应该触发依赖
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
    })

    // ref的数据嵌套的数据的也应该是响应式的
    it('should make nested properties reactive', () => {
        const a = ref({
            foo : 1
        });

        let dummy
        effect(() => {
            dummy = a.value.foo
        })
        expect(dummy).toBe(1);
        a.value.foo = 2;
        expect(dummy).toBe(2);
    })

    // isRef 检查值是否为一个 ref 对象
    // ref -> ref.value
    it('isRef', () => {
        const a = ref(1);
        const user = reactive({foo: 1});
        expect(isRef(a)).toBe(true);
        expect(isRef(1)).toBe(false);
        expect(isRef(user)).toBe(false);
    })

    // unRef 如果参数是一个 ref，则返回内部值，否则返回参数本身
    it('unRef', () => {
        const a = ref(1);
        expect(unRef(a)).toBe(1);
        expect(unRef(1)).toBe(1);
    })

    // proxyRefs
    // setup返回的数据，不管有没有.value 当你在模板中使用的时候，都可以省略.value，setup返回的结果就调用了这个api
    it('proxyRefs', () => {
        const user = {
            age: ref(10), 
            name: 'John',
        }

        // get -> 判断是不是 ref 是的话就返回 其.value, 不是的话就返回原始值
        const proxyUser = proxyRefs(user);
        expect(user.age.value).toBe(10);
        // 达成可以省略 .value 的目的
        expect(proxyUser.age).toBe(10);
        expect(user.name).toBe('John');

        // set
        // 重置的不是ref,会直接影响到原本的age对象
        // 原本的age是ref的，直接改了就变成不是ref的了

        // set -> not a ref -> 修改他的 .value
        proxyUser.age = 20;
        expect(proxyUser.age).toBe(20);
        expect(user.age.value).toBe(20);

        // set is a ref -> 直接修改
        proxyUser.age = ref(10);
        expect(user.age.value).toBe(10);
        expect(proxyUser.age).toBe(10);
    })
})
