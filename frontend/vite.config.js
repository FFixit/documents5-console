import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        watch: {
            usePolling: true,
        },
        proxy: {
            '/backend': {
                target: 'ws://localhost:8001',
                changeOrigin: true,
                secure: false,
                ws: true,
            },
        },
    },
})
