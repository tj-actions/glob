const path = require('path')
const {normalizeSeparators} = require('../src/utils')

process.env.TESTING = 1
process.env.GITHUB_WORKSPACE = normalizeSeparators(
  path.resolve(__dirname, '..') + path.sep
)
process.env.GITHUB_ACTION_PATH = normalizeSeparators(
  path.resolve(__dirname, '..') + path.sep
)
