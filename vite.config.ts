import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: [{ find: '@', replacement: path.resolve('src/') }]
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
                @import "@/styles/variables.scss";
                @import "@/styles/_mixin.scss";
                `
            }
        }
    },
    preview: {
        port: 3000
    }
});
