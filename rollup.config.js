import typescript from "@rollup/plugin-typescript"
import pkg from './package.json'
export default {
    input: './packages/index.ts',
    output: [
        // 1. cjs -> commonjs
        // 2. esm -> module
        {
            format: "cjs",
            file: pkg.main,
        },
        {
            format: "es",
            file: pkg.module,
        }
    ],

    plugins: [ typescript() ],
}