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
      // Allow unused variables
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      
      // Allow useEffect without exhaustive dependencies
      "react-hooks/exhaustive-deps": "off",
      
      // Allow any type usage
      "@typescript-eslint/no-explicit-any": "off",
      
      // Allow unescaped entities in JSX (like apostrophes)
      "react/no-unescaped-entities": "off",
      
      // Allow empty object types and interfaces
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];

export default eslintConfig;
