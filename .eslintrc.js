module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 13,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  extends: [
    // 'eslint:recommended',
    '@nuxt/eslint-config',
    // 'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
    '@nuxtjs/eslint-config-typescript',
    'prettier',
  ],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    // 'no-useless-return': 'off',
    'vue/no-v-model-argument': 'off',
    // 'vue/singleline-html-element-content-newline': 'off',
    // curly: 'off',
    // 'eol-last': 'off',
    // 'space-before-function-paren': 'off',
    // 'arrow-parens': 'off',
    // indent: 'off',
    // '@typescript-eslint/triple-slash-reference': 'off'
  },
}
