import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { PawPrint, ArrowRight, ShieldCheck, Activity, BrainCircuit, Users, HeartPulse, ChevronRight, CheckCircle2, AlertTriangle, Stethoscope, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';

function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <PawPrint className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">PASHUVERSE</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
          <a href="#impact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Impact</a>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <Navbar />

      {/* Hero Section with Dynamic Animal Background Slideshow (50% Visible) */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Dynamic Animal Background Slideshow (50% Visible) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {bgImages.map((img, idx) => (
            <div 
              key={img}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 transform scale-105 ${idx === bgIndex ? 'opacity-50' : 'opacity-0'}`}
              style={{ backgroundImage: `url('${img}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/80" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto py-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/60 border border-emerald-500/40 text-emerald-400 font-bold mb-8 shadow-xl backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-sm font-bold tracking-wide uppercase">PASHUVERSE INTELLIGENCE OS 1.0</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight leading-[1.1] mb-8 text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]"
            >
              Predict. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]">Prevent.</span> Protect.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-2xl font-semibold text-slate-100 mb-12 max-w-2xl leading-relaxed drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
            >
              The world's first AI-powered intelligent ecosystem for predictive animal healthcare and comprehensive livestock management.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 group">
                  Join the Ecosystem
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg glass-panel hover:bg-secondary/10">
                  Explore Demo Dashboard
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative Floating Icons */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-[15%] p-4 rounded-2xl glass-panel text-primary shadow-2xl">
            <BrainCircuit className="w-8 h-8" />
          </motion.div>
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-1/3 right-[15%] p-4 rounded-2xl glass-panel text-secondary shadow-2xl">
            <Activity className="w-8 h-8" />
          </motion.div>
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-1/4 left-[20%] p-4 rounded-2xl glass-panel text-blue-500 shadow-2xl">
            <HeartPulse className="w-8 h-8" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
            {[
              { label: 'Animals Tracked', value: '5M+' },
              { label: 'Farmers Empowered', value: '50K+' },
              { label: 'Veterinarians', value: '1,000+' },
              { label: 'AI Accuracy', value: '99.7%' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-4"
              >
                <h3 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">{stat.value}</h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules/Services Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">A Complete Ecosystem</h2>
            <p className="text-lg text-muted-foreground">20+ integrated modules designed to connect every stakeholder in the animal healthcare value chain.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'AI Disease Detection', desc: 'Early warning system analyzing symptoms and data to predict outbreaks.', icon: BrainCircuit, color: 'text-primary' },
              { title: 'Digital Twin', desc: 'Real-time virtual representation of animal health metrics and medical history.', icon: Activity, color: 'text-secondary' },
              { title: 'Tele-Veterinary', desc: 'Instant video consultations with verified veterinarians across the country.', icon: Stethoscope, color: 'text-blue-500' },
              { title: 'Smart Marketplace', desc: 'Verified supply chain for medicines, feed, and farm equipment.', icon: Store, color: 'text-amber-500' },
              { title: 'Insurance Portal', desc: 'Seamless policy issuance and rapid AI-verified claims processing.', icon: ShieldCheck, color: 'text-emerald-500' },
              { title: 'Emergency SOS', desc: '1-click panic button connecting to nearest hospitals and rapid response teams.', icon: AlertTriangle, color: 'text-destructive' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl glass-panel hover:bg-card/80 transition-colors cursor-default border border-transparent hover:border-border"
              >
                <div className={`w-14 h-14 rounded-2xl bg-card border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/dashboard">
              <Button variant="link" className="text-primary hover:text-primary/80 group">
                Explore all 20 modules <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Ready to revolutionize livestock management?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">Join the platform that is digitizing animal healthcare at scale.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-full h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl">
                Create Free Account
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Supported by Govt Initiatives
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" /> ISO Certified Security
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" /> 24/7 Vernacular Support
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">PASHUVERSE</span>
            <span>© 2024. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
