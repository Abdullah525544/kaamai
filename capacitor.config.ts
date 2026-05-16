import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.kaamai.app',
  appName: 'KaamAI',
  webDir: 'out',
  server: {
    url: 'https://kaam-ai-gamma.vercel.app',
    cleartext: true
  }
};
export default config;
