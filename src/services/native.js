import { Capacitor } from '@capacitor/core';

/**
 * Native (Capacitor) boot tasks. Safe to call on web — every step is guarded.
 */
export async function initNative() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (err) {
    // Plugin not installed / already hidden.
  }

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#14210f' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (err) {
    // Plugin not installed.
  }

  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
  } catch (err) {
    // Optional.
  }
}
