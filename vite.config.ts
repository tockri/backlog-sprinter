import { crx, defineManifest } from "@crxjs/vite-plugin"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"
import { ManifestSecret } from "./backlog-sprinter-secret/ManifestSecret"

const manifest = defineManifest({
  manifest_version: 3,
  name: "Backlog Sprinter",
  key: ManifestSecret.key,
  version: "2.0.2",
  default_locale: "en",
  description: "__MSG_appDesc__",
  background: {
    service_worker: "src/background/worker.ts"
  },
  permissions: ["identity", "storage", "tabs"],
  icons: {
    "48": "icon48.png",
    "128": "icon128.png"
  },
  content_scripts: [
    {
      matches: ["https://*.backlog.com/*", "https://*.backlog.jp/*", "https://*.backlogtool.com/*"],
      css: ["css/bsp.css"],
      js: ["src/content/project.tsx"],
      run_at: "document_idle"
    },
    {
      matches: ["https://backlog-sprinter.vercel.app/api/*"],
      js: ["src/authorizer/storeToken.ts"],
      run_at: "document_end"
    }
  ],
  web_accessible_resources: [
    {
      resources: ["images/*"],
      matches: ["https://*.backlog.com/*", "https://*.backlog.jp/*", "https://*.backlogtool.com/*"],
      use_dynamic_url: true
    }
  ]
})

export default defineConfig({
  plugins: [react(), crx({ manifest }), svgr()]
})
