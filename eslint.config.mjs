import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next", "plugin:@typescript-eslint/recommended"),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      // Allow use of `any`
      "@typescript-eslint/no-explicit-any": "off",

      // Allow unused variables that start with `_`
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],

      // Allow @ts-ignore comments
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          "ts-ignore": "allow-with-description",
          "minimumDescriptionLength": 0
        }
      ],

      // Allow JSX with unescaped entities
      "react/no-unescaped-entities": "off",

      // Allow <img> usage instead of forcing <Image />
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
