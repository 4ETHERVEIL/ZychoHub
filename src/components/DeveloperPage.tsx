import { useEffect, useState } from "react";
import { ArrowLeft, Globe, Youtube, Twitter, Instagram, Coffee, Download, CheckCircle2, Smartphone } from "lucide-react";

interface DeveloperPageProps {
  onBack: () => void;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function DeveloperPage({ onBack }: DeveloperPageProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isInstalled) {
      alert("Aplikasi sudah terpasang di perangkat ini.");
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
      }
      return;
    }

    alert("Untuk memasang PWA: buka menu browser (⋮), lalu pilih 'Tambahkan ke layar utama' atau 'Install app'.");
  };

  const socialLinks = [
    { icon: Globe, label: "Website", href: "/" },
    { icon: Youtube, label: "Saluran", href: "https://whatsapp.com/channel/0029VbD6VzGEKyZOZo8emB1Q" },
    { icon: Twitter, label: "X", href: "https://x.com" },
    { icon: Instagram, label: "Instagram", href: "https://instagram.com" }
  ];

  return (
    <div className="fixed inset-0 bg-[#07020f] z-[60] overflow-y-auto no-scrollbar pb-24 md:pb-8">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(160,32,240,0.26),transparent_36rem),linear-gradient(180deg,rgba(7,2,15,0)_0%,#07020f_80%)]" />
      <header className="h-16 flex items-center px-4 md:px-8 sticky top-0 bg-[#07020f]/80 backdrop-blur-md z-10 border-b border-white/5">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Kembali">
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="ml-4 font-bold text-xl">Tentang</h1>
      </header>

      <main className="relative z-[1] w-full max-w-6xl mx-auto p-5 md:p-8 lg:p-10">
        <span className="text-[#c026ff] text-xs font-bold uppercase tracking-[0.28em]">Lead Developer</span>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-stretch">
          <div className="rounded-[2rem] border border-white/10 bg-[#12091e]/80 p-6 md:p-10 shadow-2xl shadow-black/40 flex flex-col items-center justify-center text-center overflow-hidden relative">
            <div className="absolute -top-28 size-72 rounded-full bg-[#a020f0]/20 blur-3xl" />
            <div className="relative">
              <div className="absolute -inset-5 bg-gradient-to-tr from-[#a020f0]/35 to-transparent rounded-full blur-2xl animate-pulse" />
              <div className="size-44 md:size-56 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative mb-6 bg-black">
                <img src="/zycho-logo.jpg" className="w-full h-full object-cover" alt="ZychoDev" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">ZychoDev</h2>
              <CheckCircle2 className="size-6 md:size-7 text-blue-500 fill-current" />
            </div>
            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl">
              Platform streaming musik modern bergaya Spotify, cepat, gratis, dan nyaman dipakai. Nikmati jutaan lagu, buat daftar putar Anda sendiri, dan temukan musik baru setiap hari dengan kualitas audio premium tanpa batasan.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                  className="bg-[#171022]/90 border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white/10 hover:border-[#a020f0]/40 transition-colors min-h-32"
                >
                  <social.icon className="size-7" />
                  <span className="text-xs text-white/55 font-medium">{social.label}</span>
                </a>
              ))}
            </div>

            <button className="w-full bg-[#171022]/90 border border-white/5 p-5 md:p-6 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="size-12 rounded-full bg-[#a020f0]/15 flex items-center justify-center shrink-0">
                <Coffee className="size-6 text-[#c026ff]" />
              </div>
              <div className="text-left">
                <div className="text-base md:text-lg font-bold">Like what I do?</div>
                <div className="text-sm text-white/40">Buy me a coffee</div>
              </div>
            </button>

            <button
              onClick={handleInstall}
              className="w-full bg-[#a020f0] text-white p-5 md:p-7 rounded-2xl flex items-center justify-center gap-3 text-lg md:text-xl font-black hover:bg-[#b437ff] active:scale-[0.99] transition-all shadow-2xl shadow-[#a020f0]/25"
            >
              {isInstalled ? <Smartphone className="size-6" /> : <Download className="size-6" />}
              <span>{isInstalled ? "PWA Sudah Terinstall" : "Download / Install PWA"}</span>
            </button>

            <div className="rounded-2xl border border-white/5 bg-black/25 p-4 text-sm text-white/45 leading-relaxed">
              Tombol download sekarang memasang web sebagai PWA. Di Chrome Android akan muncul pilihan install. Kalau prompt belum muncul, gunakan menu browser ⋮ lalu pilih Tambahkan ke layar utama.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
