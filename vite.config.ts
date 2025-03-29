
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    chunkSizeWarningLimit: 1500, // Increased limit to 1500 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Core libraries
          react: ['react', 'react-dom', 'react-router-dom'],
          
          // UI components
          ui: [
            '@/components/ui/button', 
            '@/components/ui/card', 
            '@/components/ui/input', 
            '@/components/ui/label',
            '@/components/ui/dialog',
            '@/components/ui/table',
            '@/components/ui/badge'
          ],
          
          // Data management libraries
          data: ['@tanstack/react-query'],
          
          // Form-related components
          forms: [
            '@/components/ui/form',
            '@/components/ui/checkbox',
            '@/components/ui/select',
            '@hookform/resolvers'
          ],
          
          // Icons and visual components
          visuals: ['lucide-react', '@/components/ui/avatar', '@/components/ui/progress']
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
