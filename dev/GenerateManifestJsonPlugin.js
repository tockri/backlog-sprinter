const { Compilation } = require("webpack")

function GenerateManifestJsonPlugin(dstFilename, templateFilename, mergeFilename) {
  Object.assign(this, { dstFilename, templateFilename, mergeFilename })

  this.plugin = { name: "GenerateManifestJsonPlugin" }
}

GenerateManifestJsonPlugin.prototype.apply = function apply(compiler) {
  compiler.hooks.compilation.tap(this.plugin, (compilation) => {
    const template = require(this.templateFilename)
    const merge = require(this.mergeFilename)
    const value = { ...template, ...merge }

    const json = JSON.stringify(value, null, 2)

    compilation.hooks.processAssets.tap(
      {
        name: this.plugin.name,
        stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
      },
      (assets) => {
        assets[this.dstFilename] = {
          source: () => json,
          size: () => json.length
        }
      }
    )
  })
}

module.exports = GenerateManifestJsonPlugin
