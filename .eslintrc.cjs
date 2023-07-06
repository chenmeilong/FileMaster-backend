module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  env: { node: true },
  "rules": {
    "@typescript-eslint/no-var-requires": "error"
  }
}
