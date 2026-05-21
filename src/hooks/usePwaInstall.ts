import { useEffect, useMemo, useState } from "react";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const getStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  window.matchMedia?.("(display-mode: fullscreen)").matches ||
  (window.navigator as any).standalone === true ||
  document.referrer.startsWith("android-app://");

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [installMessage, setInstallMessage] = useState("");

  useEffect(() => {
    setIsInstalled(getStandalone());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallMessage("Aplikasi siap dipasang. Tekan tombol download untuk install.");
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallMessage("PWA berhasil terpasang di perangkat ini.");
    };

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const installLabel = useMemo(() => {
    if (isInstalled) return "PWA Sudah Terinstall";
    if (deferredPrompt) return "Download / Install PWA";
    return "Download / Install Manual";
  }, [deferredPrompt, isInstalled]);

  const install = async () => {
    if (isInstalled) {
      setInstallMessage("Aplikasi sudah terpasang. Buka dari ikon di layar utama.");
      return { outcome: "installed" as const };
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setDeferredPrompt(null);
          setInstallMessage("Proses install dimulai. Cek layar utama perangkat kamu.");
        } else {
          setInstallMessage("Install dibatalkan. Tombol download bisa ditekan lagi nanti.");
        }
        return choice;
      } catch (error) {
        console.error(error);
        setInstallMessage("Prompt install gagal muncul. Pakai menu browser ⋮ lalu pilih Install app / Tambahkan ke layar utama.");
        return { outcome: "error" as const };
      }
    }

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const manualText = isIOS
      ? "Di iPhone/iPad: tekan tombol Share, lalu pilih Add to Home Screen."
      : "Di Chrome Android/PC: buka menu ⋮ atau ikon install di address bar, lalu pilih Install app / Tambahkan ke layar utama.";
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
