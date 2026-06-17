import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";
import {
  configureVueProject,
  defineConfigWithVueTs,
  vueTsConfigs
} from "@vue/eslint-config-typescript";

configureVueProject({
  tsSyntaxInTemplates: true,
  scriptLangs: ["ts"]
});

export default defineConfigWithVueTs(
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
    rules: {
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  eslintConfigPrettier,
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"]
  }
);
