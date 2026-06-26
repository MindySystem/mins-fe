import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import selectorParser from "postcss-selector-parser"

const legacyScopeClass = "shop-moto-legacy"
const legacyScopePrefix = `.${legacyScopeClass}`

function scopeLegacySelectors(selector: string) {
  return selectorParser((selectors) => {
    selectors.each((currentSelector) => {
      let alreadyScoped = false

      currentSelector.walkClasses((className) => {
        if (className.value === legacyScopeClass) {
          alreadyScoped = true
        }
      })

      if (alreadyScoped) {
        return
      }

      currentSelector.walk((node) => {
        const isRootTag = node.type === "tag" && (node.value === "html" || node.value === "body")
        const isRootPseudo = node.type === "pseudo" && node.value === ":root"

        if (isRootTag || isRootPseudo) {
          node.remove()
        }
      })

      while (currentSelector.first?.type === "combinator") {
        currentSelector.first.remove()
      }

      const scopedClass = selectorParser.className({ value: legacyScopeClass })

      if (!currentSelector.nodes.length) {
        currentSelector.append(scopedClass)
        return
      }

      currentSelector.prepend(selectorParser.combinator({ value: " " }))
      currentSelector.prepend(scopedClass)
    })
  }).processSync(selector)
}

function legacyCssScopePlugin() {
  return {
    postcssPlugin: "legacy-css-scope",
    Rule(rule: { selectors?: string[]; parent?: { type?: string; name?: string }; source?: { input?: { file?: string } } }) {
      const file = rule.source?.input?.file ?? ""
      const isLegacyFile = file.includes(`${path.sep}src${path.sep}features${path.sep}shop-moto${path.sep}legacy${path.sep}`)
      const isInsideKeyframes = rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent?.name ?? "")

      if (!isLegacyFile || !rule.selectors?.length || isInsideKeyframes) {
        return
      }

      rule.selectors = rule.selectors.map((selector) => {
        if (selector.startsWith(legacyScopePrefix)) {
          return selector
        }

        return scopeLegacySelectors(selector)
      })
    },
  }
}

legacyCssScopePlugin.postcss = true

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    postcss: {
      plugins: [legacyCssScopePlugin()],
    },
  },
  server: {
    allowedHosts: [process.env.VITE_ALLOWED_HOST || 'localhost', "mindytran.io.vn"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "app": path.resolve(__dirname, "./src/features/shop-moto/legacy/app"),
      "assets": path.resolve(__dirname, "./src/features/shop-moto/legacy/assets"),
      "components": path.resolve(__dirname, "./src/features/shop-moto/legacy/components"),
      "constants": path.resolve(__dirname, "./src/features/shop-moto/legacy/constants"),
      "custom-field": path.resolve(__dirname, "./src/features/shop-moto/legacy/custom-field"),
      "hooks": path.resolve(__dirname, "./src/features/shop-moto/legacy/hooks"),
      "pages": path.resolve(__dirname, "./src/features/shop-moto/legacy/pages"),
      "stateslice": path.resolve(__dirname, "./src/features/shop-moto/legacy/stateslice"),
      "utils": path.resolve(__dirname, "./src/features/shop-moto/legacy/utils"),
    },
  },
})
