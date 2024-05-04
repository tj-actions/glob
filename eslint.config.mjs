import globals from 'globals'

import path from 'path'
import {fileURLToPath} from 'url'
import {FlatCompat} from '@eslint/eslintrc'
import pluginJs from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'


// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended })

export default [
  { languageOptions: { globals: globals.browser }},
  {
    ignores: [
      'dist/**',
      'lib/**',
      'node_modules/**',
      'jest.config.js',
      'coverage/**'
    ]
  },
  ...compat.extends("standard-with-typescript").map((config) => ({
    ...config,
    files: ["**/*.tsx", "**/*.ts"],
    rules: {
      ...config.rules,
      "@typescript-eslint/semi": ["error", "always"],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-ts-expect-error": "off",
      "no-import-assign": "off",
    },
  })),
  prettierConfig, // Turns off all ESLint rules that have the potential to interfere with Prettier rules.
  eslintPluginPrettierRecommended,
]
