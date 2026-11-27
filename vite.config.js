import process from "node:process"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

const apiTarget = process.env.API_PROXY_TARGET || "http://localhost:8080"

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyReq", (outgoing, incoming) => {
            // Forward same-origin browser requests using the upstream origin.
            const origin = incoming.headers.origin
            if (origin === "http://" + incoming.headers.host || origin === "https://" + incoming.headers.host) {
              outgoing.setHeader("Origin", new URL(apiTarget).origin)
            }
          })
        }
      }
    }
  },
  plugins: [
    {
      name: "materna-offline-shell",
      apply: "build",
      enforce: "post",
      generateBundle(_, bundle) {
        const files = [...new Set(["/index.html", "/favicon.svg", ...Object.keys(bundle).map(name => "/"+name)])]
        const template = readFileSync(new URL("./build/offline-worker.txt", import.meta.url), "utf8")
        const version = createHash("sha256").update(template+JSON.stringify(files)).digest("hex").slice(0,16)
        this.emitFile({type:"asset", fileName:"sw.js", source:template.replace("__FILES__", JSON.stringify(files)).replace("__CACHE_NAME__", JSON.stringify("maternacare-shell-"+version))})
      }
    },
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
