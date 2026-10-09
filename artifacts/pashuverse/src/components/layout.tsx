import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  PawPrint, 
  Stethoscope, 
  Syringe, 
  CalendarCheck, 
  Store, 
  ShieldCheck, 
  MessageSquare, 
  AlertTriangle, 
  Map, 
  Bell, 
  Settings,
  Menu,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  Sparkles,
  PhoneCall,
  PhoneOff,
  Video,
  Globe
} from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useCallNotification } from '@/context/CallNotificationContext';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import LaxmiVoiceAssistant from '@/components/LaxmiVoiceAssistant';

export function Sidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const [location] = useLocation();
  const { user, loginByRole, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [lang, setLang] = React.useState(() => {
    const match = document.cookie.match(/(^|;\s*)googtrans=([^;]*)/);
    return match ? match[2].split('/')[2] : 'en';
  });

  const changeLanguage = (newLang: string) => {
    setLang(newLang);
    document.cookie = `googtrans=/en/${newLang}; path=/`;
    document.cookie = `googtrans=/en/${newLang}; domain=${window.location.hostname}; path=/`;
    window.location.reload();
  };

  const getRoleLinks = () => {
    const role = user?.role || 'Farmer';
    const allLinks = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'My Animals', path: '/animals', icon: PawPrint, roles: ['Farmer', 'Admin'] },
      { name: 'Disease Detection', path: '/disease-detection', icon: Stethoscope, roles: ['Farmer', 'Admin'] },
      { name: 'Vaccinations', path: '/vaccinations', icon: Syringe, roles: ['Farmer', 'Animal Hospital', 'Admin'] },
      { name: 'Appointments', path: '/appointments', icon: CalendarCheck, roles: ['Farmer', 'Veterinarian', 'Laboratory', 'Animal Hospital', 'Admin'] },
      { name: 'Marketplace', path: '/marketplace', icon: Store, roles: ['Farmer', 'Insurance Provider', 'Admin'] },
      { name: 'Insurance Desk', path: '/insurance', icon: ShieldCheck, roles: ['Farmer', 'Government & NGO', 'Insurance Provider', 'Admin'] },
      { name: 'Community Forum', path: '/community', icon: MessageSquare, roles: ['Farmer', 'Veterinarian', 'Government & NGO', 'Laboratory', 'Animal Hospital', 'Insurance Provider', 'Admin'] },
      { name: 'Emergency SOS', path: '/sos', icon: AlertTriangle, danger: true, roles: ['Farmer', 'Government & NGO', 'Admin'] },
      { name: 'Surveillance Radar', path: '/surveillance', icon: Map, roles: ['Government & NGO', 'Admin'] },
      { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['Farmer', 'Veterinarian', 'Government & NGO', 'Laboratory', 'Animal Hospital', 'Insurance Provider', 'Admin'] },
    ];

    if (role === 'Admin') {
      allLinks.push({ name: 'Admin Control', path: '/admin', icon: Settings, roles: ['Admin'] });
      return allLinks;
    }

    return allLinks.filter(link => !link.roles || link.roles.includes(role));
  };

  const links = getRoleLinks();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 glass-panel border-r flex flex-col transition-transform lg:translate-x-0",
          !open && "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">PASHUVERSE</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {links.map((link) => {
            const isActive = location === link.path || location.startsWith(`${link.path}/`);
            return (
              <Link key={link.path} href={link.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground",
                    link.danger && !isActive && "text-destructive hover:bg-destructive/10 hover:text-destructive"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border mt-auto space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary/10 border border-white/5">
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarFallback className="bg-primary/20 text-primary font-bold">{user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-primary font-semibold truncate">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Active Role Switcher
            </div>
            <Select value={user?.role || 'Farmer'} onValueChange={(val) => loginByRole(val as UserRole)}>
              <SelectTrigger className="h-9 text-xs bg-background/60 border-white/10">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Farmer">🚜 Farmer</SelectItem>
                <SelectItem value="Veterinarian">🩺 Veterinarian</SelectItem>
                <SelectItem value="Government & NGO">🏛️ Govt & NGO</SelectItem>
                <SelectItem value="Laboratory">🔬 Laboratory</SelectItem>
                <SelectItem value="Animal Hospital">🏥 Hospital</SelectItem>
                <SelectItem value="Insurance Provider">🛡️ Insurance</SelectItem>
                <SelectItem value="Admin">✨ Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-1">
            <Select value={lang} onValueChange={changeLanguage}>
              <SelectTrigger className="w-24 h-9 text-xs bg-background/60 border-white/10 shrink-0 px-2 font-bold text-slate-800 dark:text-slate-300">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                <SelectValue placeholder="Lang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">Eng</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="icon" 
              className="w-9 h-9 shrink-0"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-9 justify-start text-muted-foreground text-xs px-2"
              onClick={logout}
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user } = useAuth();
  const { pendingCalls, acceptCall, declineCall } = useCallNotification();

  const isProviderRole = user?.role === 'Veterinarian' || user?.role === 'Laboratory' || user?.role === 'Animal Hospital';

  // Only show calls directed at the currently logged-in vet
  const myIncomingCalls = isProviderRole
    ? pendingCalls.filter(c =>
        !user?.name || c.vetName.toLowerCase().includes(user.name.toLowerCase()) ||
        user.name.toLowerCase().includes(c.vetName.toLowerCase())
      )
    : [];

  const topCall = myIncomingCalls[0] ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground flex relative">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen max-w-full overflow-hidden">
        <header className="h-16 glass-panel border-b flex items-center px-4 lg:hidden sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">PASHUVERSE</span>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Global SAATHI AI Chatbot Assistant */}
      <LaxmiVoiceAssistant mode="float" />

      {/* ================================================================ */}
      {/* GLOBAL INCOMING TELE-VET CALL NOTIFICATION (Vet / Provider View) */}
      {/* ================================================================ */}
      <AnimatePresence>
        {topCall && isProviderRole && (
          <motion.div
            key={topCall.id}
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.10) 0%, rgba(2,6,23,0.93) 100%)' }}
          >
            {/* Ripple rings */}
            <span className="absolute w-96 h-96 rounded-full border-2 border-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <span className="absolute w-72 h-72 rounded-full border-2 border-emerald-500/25 animate-ping" style={{ animationDuration: '2.4s' }} />

            <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/50 rounded-3xl shadow-2xl shadow-emerald-500/20 overflow-hidden">

              {/* Green top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400" />

              <div className="p-6 space-y-5 text-white text-center">
                {/* Animated phone icon */}
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-500/25 animate-ping" style={{ animationDuration: '1.3s' }} />
                  <span className="absolute inset-2 rounded-full bg-emerald-500/15 animate-ping" style={{ animationDuration: '1.8s' }} />
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/40">
                    <PhoneCall className="w-7 h-7 text-white animate-bounce" />
                  </div>
                </div>

                {/* Call badge */}
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-3 py-1 font-bold tracking-widest">
                  📹 INCOMING TELE-VET CALL
                </Badge>

                {/* Caller info */}
                <div>
                  <h3 className="text-2xl font-display font-extrabold text-white tracking-tight">
                    {topCall.farmerName}
                  </h3>
                  <p className="text-xs text-sky-400 font-bold mt-1">
                    🐄 Patient: <span className="text-white">{topCall.animalName}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {new Date(topCall.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>

                {/* Symptoms box */}
                {topCall.symptoms && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-300 text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Reported Symptoms:</span>
                    <span className="italic">"{topCall.symptoms}"</span>
                  </div>
                )}

                {/* Consultation type pill */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full">
                    {topCall.type === 'Video Call' ? <Video className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
                    {topCall.type}
                  </span>
                </div>

                {/* Accept / Decline */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button
                    onClick={() => declineCall(topCall.id)}
                    variant="outline"
                    className="h-12 bg-slate-950 border-red-500/40 text-red-400 hover:bg-red-500/15 font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4 mr-1.5" /> Decline
                  </Button>
                  <Button
                    onClick={() => acceptCall(topCall.id)}
                    className="h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/30 cursor-pointer"
                  >
                    <Video className="w-4 h-4 mr-1.5" /> Accept 📹
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
