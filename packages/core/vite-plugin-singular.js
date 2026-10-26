// packages/core/vite-plugin-singular.ts
import { transformWithEsbuild } from 'vite';
export function singularJSX() {
    return {
        name: 'singular-jsx',
        async transform(code, id) {
            // Only transform .tsx and .jsx files
            if (!id.endsWith('.tsx') && !id.endsWith('.jsx')) {
                return null;
            }
            // Transform JSX using esbuild with Singular runtime
            const result = await transformWithEsbuild(code, id, {
                loader: id.endsWith('.tsx') ? 'tsx' : 'jsx',
                jsx: 'automatic',
                jsxImportSource: 'singular-core/jsx',
                jsxDev: process.env.NODE_ENV === 'development',
            });
            return result;
        },
    };
}
