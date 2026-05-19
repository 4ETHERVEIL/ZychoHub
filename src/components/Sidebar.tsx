import { motion } from "motion/react";
import { Home, Search, Library, Mic2, Plus, Heart, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-300",
        "hover:bg-white/5 group",
        active ? "bg-[#1db954] text-black font-bold" : "text-[#b3b3b3] hover:text-white"
      )}
    >
      <Icon className={cn("size-5 transition-transform group-hover:scale-110", active && "text-black")} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex w-64 flex-col gap-2 p-4 h-full relative z-10 bg-black/40 rounded-2xl"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-3 mb-2">
        <img src="https://c.termai.cc/i165/w1eLXm.jpg" alt="Musicply" className="size-9 rounded-full object-cover border border-[#1db954]/60 shadow-lg" />
        <span className="font-black text-lg tracking-tight text-white">Musicply</span>
      </div>
      <div className="bg-[#121212] border border-white/5 rounded-2xl p-2 mb-2">
        <SidebarItem 
          icon={Home} 
          label="Home" 
          active={activeTab === "Home"} 
          onClick={() => setActiveTab("Home")}
        />
        <SidebarItem 
          icon={Search} 
          label="Search" 
          active={activeTab === "Search"} 
          onClick={() => setActiveTab("Search")}
        />
        <SidebarItem 
          icon={Library} 
          label="Your Library" 
          active={activeTab === "Library"} 
          onClick={() => setActiveTab("Library")}
        />
        <SidebarItem 
          icon={Sparkles} 
          label="Gemini AI" 
          active={activeTab === "Gemini"} 
          onClick={() => setActiveTab("Gemini")}
        />
      </div>

      <div className="bg-[#121212] border border-white/5 rounded-2xl p-2 flex-1 custom-scrollbar overflow-y-auto">
        <div className="px-4 py-3 flex items-center justify-between text-[#b3b3b3]">
          <span className="text-xs uppercase tracking-widest font-bold">Playlists</span>
          <Plus className="size-4 hover:text-[#1db954] cursor-pointer" />
        </div>
        <SidebarItem 
          icon={Plus} 
          label="Create Playlist" 
        />
        <SidebarItem 
          icon={Heart} 
          label="Liked Songs" 
          active={activeTab === "Library"} 
          onClick={() => setActiveTab("Library")}
        />
        <div className="mt-4 space-y-1">
          {["Dreamy Lo-fi", "Techno Pulse", "Morning Coffee", "Chill Vibes", "Coding Session"].map((name) => (
            <button key={name} className="w-full text-left px-4 py-2 text-sm text-white/50 hover:text-white transition-colors truncate">
              {name}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
