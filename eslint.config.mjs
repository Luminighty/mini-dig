import globals from "globals"
import pluginJs from "@eslint/js"
import jsdoc from "eslint-plugin-jsdoc"

/** @type {import('eslint').Linter.Config[]} */
export default [
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  {
    plugins: {jsdoc},
    rules: {
      "jsdoc/no-undefined-types": 1,
    },
  },
  {
    rules: {
      "semi": ["warn", "never"],
      "no-unused-vars": [
        "warn", 
        {varsIgnorePattern: "^_*"}
      ],
      "no-undef": ["error"]
    }
  },
]