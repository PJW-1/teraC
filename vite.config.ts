import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // 에이전트 작업 폴더(.claude/worktrees)의 테스트는 돌리지 않는다
    exclude: [...configDefaults.exclude, '.claude/**'],
    // 테스트는 .env 의 운영 Supabase 에 붙지 않는다(로컬 모드로 동작)
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
    },
  },
})
