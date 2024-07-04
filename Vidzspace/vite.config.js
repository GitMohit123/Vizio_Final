import { defineConfig,loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  server:{
    port:3000,
    proxy:{
      "/vidzspaceApi":{
        target:"http://172.17.0.1:5001",
        secure:false
      }
    }
  },
  plugins: [react()],
})
