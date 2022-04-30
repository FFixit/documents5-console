import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        watch: {
            usePolling: true,
        },
        proxy: {
            'ws://.*': {
                target: 'ws://localhost:8001',
                changeOrigin: true,
                ws: true,
            },
        },
    },
})
