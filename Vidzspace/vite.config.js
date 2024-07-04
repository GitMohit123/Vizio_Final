import { defineConfig,loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  server:{
    port:3000,
    proxy:{
      "/vidzspaceApi":{
        target:"vizio-lb-1347889499.ap-south-1.elb.amazonaws.com",
        secure:false
      }
    }
  },
  plugins: [react()],
})
