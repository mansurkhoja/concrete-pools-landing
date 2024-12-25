import { defineConfig } from 'vite'
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import injectHTML from 'vite-plugin-html-inject'
import autoprefixer from 'autoprefixer'

export default defineConfig({
	plugins: [
		injectHTML({
			debug: {
				logPath: false,
			},
		}),
		ViteMinifyPlugin(),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						return 'vendor'
					}
					return null
				},
			},
		},
	},
	css: {
		postcss: {
			plugins: [
				autoprefixer({
					overrideBrowserslist: ['> 1%'],
				}),
			],
		},
	},
})
