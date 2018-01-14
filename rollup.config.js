import typescript from 'rollup-plugin-typescript2';

export default {
    input: './src/rxios.ts',
    output: [
        {
            name: 'rxios',
            file: './dist/vue-di.esm.js',
            format: 'es',
            sourcemap: true,
        },
        {
            name: 'rxios',
            file: './dist/vue-di.cjs.js',
            format: 'cjs',
            sourcemap: true,
        },
    ],
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    declaration: true,
                },
                include: ["src/**/*.ts"]
            },
            typescript: require('typescript'),
        }),
    ],
};
