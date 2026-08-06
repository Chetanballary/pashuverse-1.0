import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { PawPrint, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Stethoscope, Building2, Landmark, Heart, Award, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, UserRole, DEMO_USERS, User as AuthUser } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LoginPage(props: { isSignup?: boolean } & Record<string, any>) {
  const isSignup = props?.isSignup ?? false;
  const [, setLocation] = useLocation();
  const { login, loginByRole } = useAuth();
  
  const [role, setRole] = useState<UserRole>('Farmer');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const bgImages = [
    '/hero-animals.png',
    '/bg-cattle-lineup.png',
    '/bg-cow-portrait.png',
  ];

  const [bgIndex, setBgIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % bgImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickLogin = (targetRole: UserRole) => {
    loginByRole(targetRole);
    setLocation('/dashboard');
    if (window.location.pathname !== '/dashboard') {
      window.location.href = '/dashboard';
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = DEMO_USERS[role] || DEMO_USERS['Farmer'];
    const customUser: AuthUser = {
      id: `user-${role.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: name.trim() || preset.name,
      email: email.trim() || preset.email,
      role: role,
      phone: role === 'Veterinarian' ? (phone.trim() || preset.phone || '+91 98765 43210') : undefined
    };
    login(customUser);
    setLocation('/dashboard');
    if (window.location.pathname !== '/dashboard') {
      window.location.href = '/dashboard';
    }
  };

  const quickRoles: { role: UserRole; label: string; icon: any }[] = [
    { role: 'Farmer', label: 'Farmer', icon: PawPrint },
    { role: 'Veterinarian', label: 'Veterinarian', icon: Stethoscope },
    { role: 'Government & NGO', label: 'Govt & NGO', icon: Landmark },
    { role: 'Laboratory', label: 'Laboratory', icon: Building2 },
    { role: 'Animal Hospital', label: 'Hospital', icon: Heart },
    { role: 'Insurance Provider', label: 'Insurance', icon: ShieldCheck },
    { role: 'Admin', label: 'Admin', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center relative overflow-hidden py-12">
      {/* Animal Background Slideshow (Unblurred & Crisp) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bgImages.map((img, idx) => (
          <div 
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 transform scale-105 ${idx === bgIndex ? 'opacity-85 z-10' : 'opacity-0 z-0'}`}
            style={{ backgroundImage: `url('${img}')` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/80 z-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full z-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full z-20" />
      </div>

      <div className="w-full max-w-lg mx-auto p-6 relative z-30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel bg-card/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-white/20"
        >
          <div className="flex flex-col items-center mb-6">
            <Link href="/">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20 cursor-pointer">
                <PawPrint className="w-7 h-7 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              {isSignup ? "Join the future of animal healthcare" : "Sign in to access your PASHUVERSE ecosystem dashboard"}
            </p>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="mb-6 bg-secondary/10 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quick Demo Sign-In
              </span>
              <span className="text-xs text-muted-foreground">Click to enter as:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quickRoles.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleQuickLogin(item.role)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-background/50 hover:bg-primary/20 hover:border-primary/40 border border-white/5 transition-all text-xs font-medium text-foreground group"
                  >
                    <Icon className="w-4 h-4 mb-1 text-primary group-hover:scale-110 transition-transform" />
                    <span className="truncate w-full text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <span className="relative bg-card px-3 text-xs text-muted-foreground uppercase">or sign in manually</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name / Organization Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="e.g. Dr. Anita Sharma / BioVet Diagnostics" 
                  className="pl-10 bg-background/50 border-white/10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@pashuverse.org" 
                  className="pl-10 bg-background/50 border-white/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-background/50 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Farmer">Farmer / Livestock Owner</SelectItem>
                  <SelectItem value="Veterinarian">Veterinarian</SelectItem>
                  <SelectItem value="Laboratory">Laboratory / Diagnostic Center</SelectItem>
                  <SelectItem value="Animal Hospital">Animal Hospital</SelectItem>
                  <SelectItem value="Government & NGO">Government & NGO Officer</SelectItem>
                  <SelectItem value="Insurance Provider">Insurance Provider</SelectItem>
                  <SelectItem value="Admin">Admin / System Overseer</SelectItem>
                </SelectContent>
              </Select>
            </div>
 
            {role === 'Veterinarian' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number (For Live Transmission & Calls)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-xs text-muted-foreground font-bold font-mono">+91</span>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="98765 43210" 
                    className="pl-12 bg-background/50 border-white/10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={isSignup}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground group text-base">
              {isSignup ? `Sign Up as ${role}` : `Sign In as ${role}`}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? (
              <p>Already have an account? <Link href="/login"><span className="text-primary hover:underline cursor-pointer font-medium">Sign In</span></Link></p>
            ) : (
              <p>New to PASHUVERSE? <Link href="/signup"><span className="text-primary hover:underline cursor-pointer font-medium">Create Account</span></Link></p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
