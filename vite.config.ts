import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const smsPort = env.SMS_PORT || "3000";

  return {
    plugins: [vue(), vuetify({ autoImport: true })],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${smsPort}`,
          changeOrigin: true
        }
      }
    }
  };
});
