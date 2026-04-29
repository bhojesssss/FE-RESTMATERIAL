// vitest.config.js
// Konfigurasi terpisah dari vite.config.js biar gak bentrok sama React plugin
// Digunakan khusus untuk integration test transaction workflow
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Timeout panjang karena hit real API + Supabase
    testTimeout: 30000,
    hookTimeout: 30000,

    // Pakai node environment (bukan jsdom) — kita test API, bukan DOM
    environment: 'node',

    // Hanya jalankan file test tertentu
    include: ['src/tests/**/*.test.js'],

    // Sequential execution — transaction workflow harus urut
    sequence: {
      concurrent: false,
    },

    // Reporter verbose biar keliatan tiap step
    reporters: ['verbose'],
  },
})
