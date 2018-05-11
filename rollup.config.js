import typescript from 'rollup-plugin-typescript2';

export default {
    input: './src/axios-rx.ts',
    output: [
        {
            name: 'rxios',
            file: './dist/axios-rx.esm.js',
            format: 'es',
            sourcemap: true,
        },
        {
            name: 'rxios',
            file: './dist/axios-rx.cjs.js',
            format: 'cjs',
            sourcemap: true,
        },
    ],
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    module: 'es2015',
                    declaration: true,
                },
                exclude: ['test/**/*.ts'],
            },
            typescript: require('typescript'),
        }),
    ],
};
