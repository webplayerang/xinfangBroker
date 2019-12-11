module.exports = {
  extends: "airbnb",
  plugins: ["react", "jsx-a11y", "import"],
  parser: "babel-eslint",
  root: true,
  globals: {
    __DEV__: true,
    storage: true,
    FormData: true
  },
  rules: {
    "arrow-parens": ["error", "always"],
    "global-require": "off",
    "linebreak-style": ["error", "unix"],
    "max-len": [1, 200],
    "no-console": "off",
    // "no-debugger": "off",
    "no-use-before-define": ["error", { variables: false }],
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    "class-methods-use-this": "off"
  }
};
