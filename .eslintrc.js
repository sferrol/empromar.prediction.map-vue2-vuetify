module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    // '@vue/airbnb',
    'eslint:recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    // 'vue/script-indent': ['error', 2, { baseIndent: 1 }],
    // indent: ['error', 4],

    // 'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }],
    'vue/no-unused-components': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-unused-vars': ['off',
    //   { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }
    // ],


    // template
    'vue/html-indent': ['error', 2, {
      attribute: 1,
      baseIndent: 1,
      closeBracket: 0,
      alignAttributesVertically: true,
      ignores: [],
    }],
  },
};
