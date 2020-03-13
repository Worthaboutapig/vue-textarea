module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:vue/recommended", "plugin:import/warnings", "prettier"], //"@vue/prettier"- has some bad rules  "plugin:import/errors",
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    "brace-style": ["error", "1tbs", { allowSingleLine: true }],
    indent: ["error", 2, { SwitchCase: 1 }],
    "linebreak-style": ["error", "unix"],
    "no-console": "error",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-duplicate-imports": "error",
    "no-unreachable": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-unused-vars": process.env.NODE_ENV === "production" ? ["error", { caughtErrors: "all" }] : "off",
    quotes: ["error", "double", { avoidEscape: true }],
    "require-atomic-updates": "off",
    semi: ["error", "always"]
  },
  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)"],
      env: {
        mocha: true
      }
    }
  ]
};
