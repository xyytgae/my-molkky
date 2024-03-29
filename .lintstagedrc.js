const path = require('path')

module.exports = {
  '*.{ts,vue}': (absolutePaths) => {
    const cwd = process.cwd()
    const relativePaths = absolutePaths
      .map((file) => path.relative(cwd, file))
      .join(' ')
    return `eslint ${relativePaths}`
  },
}
