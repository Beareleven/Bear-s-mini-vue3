import {reactive} from '../reactive'
import {effect, stop} from '../effect'

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age : 10
        })

        let nextAge;
        effect(() => {
            nextAge = user.age + 1;
        })

        expect(nextAge).toBe(11);

        // update
        // 触发依赖
        user.age++;
        expect(nextAge).toBe(12)
    })

    it('should return runner when call effect', () => {
        // 1. 调用effect的时候，是会返回一个函数的
        // effect(fn) -> function(runner)
        // 之后我们调用这个返回出来的函数，是会返回fn函数的结果
        // function(runner) -> fn -> res

        let foo = 10;
        let runner = effect(() => {
            foo++;
            return 'foo'
        })

        expect(foo).toBe(11);
        // runner是effect函数执行了一次之后的所返回的函数 function(runner)
        // 再执行runner函数，便会返回effect(fn)中fn所要 return 的结果
        const r = runner();
        expect(foo).toBe(12);
        expect(r).toBe('foo');
    })

    // scheduler的意思是调度者，作用是 当scheduler存在的时候，一开始scheduler不执行
    // 当数据改变到时候，scheduler执行，run函数不执行，当手动调用scheduler里面的run函数的时候,直接看测试用例
    it('scheduler', () => {
        let dummy, run;
        const scheduler = jest.fn(() => {
            run = runner;
        });

        const obj = reactive({foo: 1});
        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            {scheduler}
        );

        // 在第一次调用effect时，scheduler并不会被调用，但fn是会被调用的
        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // 响应式对象 update 拦截方法set 不会再执行fn，而是执行 scheduler
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        expect(dummy).toBe(1);
        // 如果当执行runner的时候，会再次执行fn
        run();
        expect(dummy).toBe(2);
    })

    // stop的作用是停止数据相应，只有手动触发runner函数时，才会执行数据
    // 响应式数据的话，在数据更新的时候会自动去触发（set拦截方法中调用trigger），响应式数据的依赖函数
    // 因此，实现stop方法的时机应该是把响应式数据的dep给清空掉（清空依赖）
    it('stop', () => {
        let dummy;
        const obj = reactive({foo : 1});
        debugger
        const runner1  = effect(() => {
            dummy = obj.foo + 1;
            // 第一次（初始化）：dummy = 2
            // 第二次（数据更新）：1
            // 调用stop后，这个依赖就不触发了
            // 第三次（手动触发）：101
        })
        const runner2 = effect(() => {
            dummy = obj.foo + 10;
            // 第一次（初始化）：dummy = 11
            // 第二次（数据更新）:10
            // 第三次（第二次数据更新）：110
            // 调用stop后，这个依赖就不触发了
        })
        // 数据更新
        obj.foo = obj.foo + 0;
        // 断言
        expect(dummy).toBe(11);
        // 调用stop停止响应
        stop(runner1);
        // 数据更新，但已经停止响应了，数据应不更新
        // 这种赋值操作的只会涉及到set操作
        // 如果采用obj.foo++, 则会是 obj.foo = obj.foo + 1
        // 会同时触发get set 操作，也就是 get 还会重新收集依赖
        // 这意味着我们的stop重新做了无用功 因为get会调用 track 来收集依赖
        // 因此我们需要对其进行优化修改
        // obj.foo = 100;
        obj.foo = obj.foo + 100;
        expect(dummy).toBe(111);
        stop(runner2);
        // 手动触发
        runner1();
        expect(dummy).toBe(102);
    })

    // onStop是调用 stop 后的一个回调函数，允许用户在调用 stop 方法函数做一些其他的操作
    it('onStop', () => {
        const obj = reactive({foo : 1});
        const onStop = jest.fn();
        let dummy;
        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            { onStop }
        )

        stop(runner);
        expect(onStop).toBeCalledTimes(1);
    })
})