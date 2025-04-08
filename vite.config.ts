import { defineConfig } from 'vite'
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import injectHTML from 'vite-plugin-html-inject'
import autoprefixer from 'autoprefixer'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
	plugins: [
		injectHTML({
			debug: {
				logPath: false,
			},
		}),
		ViteMinifyPlugin(),
		glsl({
			minify: true,
		}),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('three')) {
						return 'th'
					}
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
