import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.jobalert.kethsmart',
  appName: 'KhetSmart',
  webDir: 'dist',
  server: {
    url: 'https://kethsmart.jobalert.online/',
    cleartext: true
  }
};

export default config;

