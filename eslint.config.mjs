import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable TypeScript-specific rules that might cause deployment issues
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-as-const": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-var-requires": "warn",
      
      // Relax some strict rules
      "prefer-const": "warn",
      "no-console": "warn",
      "react/no-unescaped-entities": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];

export default eslintConfig;