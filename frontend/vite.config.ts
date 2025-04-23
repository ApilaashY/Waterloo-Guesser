import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as dotenv from "dotenv";

dotenv.config();

const host = process.env.VITE_HOST;
console.log("Host: ", host);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: host, // Your backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
