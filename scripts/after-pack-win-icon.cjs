/**
 * Windows: signAndEditExecutable=false 时不会调用 rcedit 写入 exe 图标，桌面快捷方式仍显示 Electron 默认图标。
 * 在 afterPack 阶段单独设置图标（需在 asar integrity 写入之后，与官方 sign 阶段改 PE 资源的思路一致）。
 */
const fs = require('fs')
const fsp = require('fs/promises')
const os = require('os')
const path = require('path')

module.exports = async function afterPackWinIcon(context) {
  if (context.electronPlatformName !== 'win32') return

  const projectDir = context.packager.projectDir
  const pngPath = path.join(projectDir, 'build', 'icon.png')
  if (!fs.existsSync(pngPath)) {
    console.warn('[after-pack-win-icon] build/icon.png missing, skip')
    return
  }

  const productFilename = context.packager.appInfo.productFilename
  const exePath = path.join(context.appOutDir, `${productFilename}.exe`)
  if (!fs.existsSync(exePath)) {
    console.warn('[after-pack-win-icon] exe not found:', exePath)
    return
  }

  const { rcedit } = await import('rcedit')
  const { default: pngToIco } = await import('png-to-ico')
  const icoPath = path.join(os.tmpdir(), `proactiveai-icon-${process.pid}.ico`)

  try {
    const icoBuf = await pngToIco(pngPath)
    await fsp.writeFile(icoPath, icoBuf)
    await rcedit(exePath, { icon: icoPath })
  } finally {
    await fsp.unlink(icoPath).catch(() => {})
  }
}
