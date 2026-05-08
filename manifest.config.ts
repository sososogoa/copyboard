import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'CopyBoard',
  version: pkg.version,
  description:
    '복사한 콘텐츠를 자동 저장하고, Smart Card / Spotlight 로 빠르게 다시 붙여넣는 클립보드 도구',
  permissions: [
    'storage',
    'activeTab',
    'clipboardWrite',
    'clipboardRead',
    'contextMenus',
    'notifications',
  ],
  host_permissions: ['<all_urls>'],
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
      all_frames: false,
    },
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_title: 'CopyBoard — 플로팅 모드 토글',
    default_icon: {
      '16': 'public/icons/icon16.png',
      '32': 'public/icons/icon32.png',
      '48': 'public/icons/icon48.png',
      '128': 'public/icons/icon128.png',
    },
  },
  icons: {
    '16': 'public/icons/icon16.png',
    '32': 'public/icons/icon32.png',
    '48': 'public/icons/icon48.png',
    '128': 'public/icons/icon128.png',
  },
  commands: {
    'toggle-floating': {
      suggested_key: { default: 'Ctrl+Shift+C', mac: 'Command+Shift+C' },
      description: 'CopyBoard 플로팅 박스 토글',
    },
    'open-spotlight': {
      suggested_key: { default: 'Ctrl+Shift+V', mac: 'Command+Shift+V' },
      description: 'Spotlight 빠른 붙여넣기',
    },
  },
});
