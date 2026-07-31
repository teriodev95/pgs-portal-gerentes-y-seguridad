import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import { VitePWA } from "vite-plugin-pwa"
// import viteCompression from "vite-plugin-compression"

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		host: true,
		allowedHosts: true,
		/*
			Para probar desde el celular contra el dev server.

			FAX sólo tiene `localhost:5173`, `localhost:3000` y sus dominios
			desplegados en la lista de CORS. Al abrir el dev server por la IP de la
			red —que es como se prueba en un teléfono real— el origen es
			`http://192.168.x.x:5173` y FAX rechaza todo. Elysia no: usa `cors()`
			sin restricciones, así que sólo FAX necesita esto.

			En vez de pedirle a FAX que confíe en una IP de LAN, que además cambia
			sola por DHCP, el navegador le habla a este mismo servidor y Vite
			reenvía por detrás. El CORS no aplica porque esa petición sale de
			servidor a servidor, no del navegador.

			PARA QUE FUNCIONE hace falta que `VITE_FAX_API_URL` valga `/fax` en
			el `.env.development` local, que no viaja en el repo por estar
			ignorado. Si apunta directo a `https://fax-dev.terio.dev`, el proxy
			queda aquí sin usarse y las llamadas vuelven a rebotar por CORS.

			Sólo existe en desarrollo: el build no lleva proxy y en producción
			cada frontend habla con FAX por su dominio, que sí está en la lista.
		*/
		proxy: {
			'/fax': {
				target: 'https://fax-dev.terio.dev',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/fax/, ''),
			},
		},
	},
	preview: {
		host: true,
		allowedHosts: true
	},

	plugins: [vue(), vueJsx(),

	// viteCompression(),
	VitePWA({
		registerType: "autoUpdate",
		injectRegister: "auto",
		includeAssets: ["img/*.png", "img/*.svg", "icons/*.svg"],
		workbox: {
			globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
			cleanupOutdatedCaches: true,
			sourcemap: true,
			navigateFallback: 'index.html',
			navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
		},
		devOptions: {
			enabled: false,
		},
		manifest: {
			name: "Gerentes & Seguridad",
			short_name: "Gerentes & Seguridad",
			description: "Gestión de Agencias para gerentes y personal de seguridad Xpress",
			theme_color: "#ffffff",
			lang: "es",
			icons: [
				{
					src: '/icons/pgs-icon2.jpg',
					sizes: '192x192',
					type: 'image/png'
				},
				{
					src: '/icons/pgs-icon2.jpg',
					sizes: '512x512',
					type: 'image/png'
				},
				{
					src: '/icons/pgs-icon2.jpg',
					sizes: '512x512',
					type: 'image/png',
					purpose: 'any maskable'
				}
			],
		},
	}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	}
})
