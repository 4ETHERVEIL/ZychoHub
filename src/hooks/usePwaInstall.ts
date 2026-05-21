import { useEffect, useMemo, useState } from "react";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __zychoDeferredPrompt?: BeforeInstallPromptEvent | null;
    __zychoPwaInstalled?: boolean;
  }
}

const getStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  window.matchMedia?.("(display-mode: fullscreen)").matches ||
  (window.navigator as any).standalone === true ||
  document.referrer.startsWith("android-app://");

const isInstallSupported = () => {
  const ua = navigator.userAgent.toLowerCase();
  return /chrome|chromium|crios|edg|samsungbrowser/.test(ua) || "BeforeInstallPromptEvent" in window;
};

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    typeof window === "undefined" ? null : window.__zychoDeferredPrompt || null
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [installMessage, setInstallMessage] = useState("");

  useEffect(() => {
    setIsInstalled(getStandalone() || window.__zychoPwaInstalled === true);
    if (window.__zychoDeferredPrompt) {
      setDeferredPrompt(window.__zychoDeferredPrompt);
      setInstallMessage("Aplikasi siap dipasang. Tekan Download untuk menampilkan popup Install aplikasi.");
    }

    const savePrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      window.__zychoDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setInstallMessage("Aplikasi siap dipasang. Tekan Download untuk menampilkan popup Install aplikasi.");
    };

    const syncPrompt = () => {
      if (window.__zychoDeferredPrompt) {
        setDeferredPrompt(window.__zychoDeferredPrompt);
        setInstallMessage("Aplikasi siap dipasang. Tekan Download untuk menampilkan popup Install aplikasi.");
      }
    };

    const onInstalled = () => {
      window.__zychoPwaInstalled = true;
      window.__zychoDeferredPrompt = null;
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallMessage("PWA berhasil terpasang. Buka ZychoHub dari ikon aplikasi di layar utama.");
    };

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", savePrompt);
    window.addEventListener("zycho-pwa-ready", syncPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("zycho-pwa-installed", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", savePrompt);
      window.removeEventListener("zycho-pwa-ready", syncPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("zycho-pwa-installed", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const installLabel = useMemo(() => {
    if (isInstalled) return "Sudah Terinstall";
    return "Download / Install PWA";
  }, [isInstalled]);

  const install = async () => {
    if (isInstalled) {
      setInstallMessage("Aplikasi sudah terpasang. Buka dari ikon ZychoHub di layar utama.");
      return { outcome: "installed" as const };
    }

    const promptEvent = deferredPrompt || window.__zychoDeferredPrompt || null;

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          window.__zychoDeferredPrompt = null;
          setDeferredPrompt(null);
          setInstallMessage("Popup install diterima. Cek layar utama perangkat kamu.");
        } else {
          setInstallMessage("Install dibatalkan. Tekan Download lagi kalau ingin memasang aplikasi.");
        }
        return choice;
      } catch (error) {
        console.error(error);
        setInstallMessage("Popup install belum bisa muncul. Refresh halaman, lalu tekan Download lagi.");
        return { outcome: "error" as const };
      }
    }

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const secure = window.isSecureContext || location.hostname === "localhost";
    const manualText = !secure
      ? "PWA harus dibuka lewat HTTPS agar popup install bisa muncul."
      : isIOS
        ? "Di iPhone/iPad: tekan Share, lalu pilih Add to Home Screen."
        : isInstallSupported()
          ? "Tunggu beberapa detik atau refresh halaman. Kalau belum muncul, buka menu ⋮ Chrome lalu pilih Install app / Tambahkan ke layar utama."
          : "Browser ini tidak mendukung popup install PWA. Buka lewat Chrome/Edge, lalu tekan Download.";
    setInstallMessage(manualText);
    return { outcome: "manual" as const };
  };

  return {
    canInstall: Boolean(deferredPrompt),
    isInstalled,
    isOnline,
    installLabel,
    installMessage,
    install,
  };
}
