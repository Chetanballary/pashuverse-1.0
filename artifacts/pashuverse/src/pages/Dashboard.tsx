import React from 'react';
import { useGetDashboardStats, useGetFarmAnalytics, useGetRecentActivity, useGetDiseaseSurveillance, useListSosRequests, useListAnimals } from '@workspace/api-client-react';
import { Activity, AlertCircle, ShieldCheck, HeartPulse, Stethoscope, PawPrint, CheckCircle2, Building2, Landmark, Syringe, Sparkles, FileText, UserCheck, Microscope, BedDouble, AlertOctagon, Map, ArrowRight, QrCode, Scan } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import InteractiveMap, { OutbreakPoint } from '@/components/InteractiveMap';
import VetQRScannerModal from '@/components/VetQRScannerModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [openQRScanner, setOpenQRScanner] = React.useState(false);
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: analytics } = useGetFarmAnalytics();
  const { data: recentActivity } = useGetRecentActivity();
  const { data: surveillanceData } = useGetDiseaseSurveillance();
  const { data: sosData } = useListSosRequests();
  const { data: animalsData } = useListAnimals();

  const role = user?.role || 'Farmer';

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

  // Role-specific stats definitions
  const getRoleStats = () => {
    switch (role) {
      case 'Veterinarian':
        return [
          { title: "Scheduled Consults", value: 18, icon: Stethoscope, color: "text-primary", bg: "bg-primary/10" },
          { title: "Patient Records", value: 142, icon: PawPrint, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Prescriptions Written", value: 89, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Critical Cases", value: 3, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
        ];
      case 'Government & NGO':
        return [
          { title: "District Outbreaks", value: 2, icon: AlertOctagon, color: "text-red-500", bg: "bg-red-500/10" },
          { title: "Vaccine Coverage", value: "88%", icon: Syringe, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Active Rescue SOS", value: 5, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Disbursed Subsidies", value: "₹ 14.2 L", icon: Landmark, color: "text-primary", bg: "bg-primary/10" },
        ];
      case 'Laboratory':
        return [
          { title: "Pending Samples", value: 14, icon: Microscope, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "AI Scans Processed", value: 240, icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
          { title: "QR Reports Issued", value: 198, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Pathogen Flags", value: 4, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
        ];
      case 'Animal Hospital':
        return [
          { title: "Emergency Triage", value: 6, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
          { title: "ICU Beds Occupied", value: "12 / 15", icon: BedDouble, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Scheduled Surgeries", value: 4, icon: Stethoscope, color: "text-primary", bg: "bg-primary/10" },
          { title: "Vets On Duty", value: 8, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ];
      case 'Insurance Provider':
        return [
          { title: "Active Policies", value: 1240, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Pending Claims", value: 9, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "AI Verified Claims", value: "96.4%", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
          { title: "Total Disbursed", value: "₹ 48.5 L", icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
        ];
      case 'Admin':
        return [
          { title: "Ecosystem Users", value: 342, icon: UserCheck, color: "text-primary", bg: "bg-primary/10" },
          { title: "Total Livestock", value: 1420, icon: PawPrint, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Supabase DB Status", value: "ONLINE (100%)", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "System Alerts", value: 0, icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
        ];
      case 'Farmer':
      default:
        return [
          { title: "Total Livestock", value: stats?.totalAnimals || 142, icon: PawPrint, color: "text-primary", bg: "bg-primary/10" },
          { title: "Healthy Animals", value: stats?.healthyAnimals || 135, icon: HeartPulse, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Sick / At Risk", value: stats?.sickAnimals || 7, icon: Stethoscope, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Active Alerts", value: stats?.activeAlerts || 2, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
        ];
    }
  };

  const statCards = getRoleStats();

  const defaultAnalytics = {
    milkProduction: [
      { month: "Jan", liters: 450 },
      { month: "Feb", liters: 520 },
      { month: "Mar", liters: 610 },
      { month: "Apr", liters: 580 },
      { month: "May", liters: 700 },
      { month: "Jun", liters: 750 }
    ]
  };

  const activeAnalytics = analytics || defaultAnalytics;

  const fallbackActivity = [
    { id: 1, description: `Foot & Mouth Vaccination updated by ${role} portal`, timestamp: new Date().toISOString(), type: "Vaccination" },
    { id: 2, description: "AI Disease Scan completed: 98% Health Score for Murrah Buffalo #45", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "AI Scan" },
    { id: 3, description: "Digital Health Passport & QR Code generated in Supabase", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "Passport" },
    { id: 4, description: "High-Protein Mineral Feed Order #8920 confirmed in Marketplace", timestamp: new Date(Date.now() - 14400000).toISOString(), type: "Marketplace" },
  ];

  const activities = (Array.isArray(recentActivity) && recentActivity.length > 0) ? recentActivity : fallbackActivity;

  const dashboardMapPoints: OutbreakPoint[] = (Array.isArray(surveillanceData) && surveillanceData.length > 0)
    ? (surveillanceData as any[]).map(p => ({
        id: p.id,
        region: p.region || 'Unknown Region',
        diseaseType: p.diseaseType || 'Unclassified Infection',
        caseCount: p.caseCount ?? 1,
        severity: p.severity || 'medium',
        latitude: typeof p.latitude === 'number' ? p.latitude : 20.5937,
        longitude: typeof p.longitude === 'number' ? p.longitude : 78.9629,
        reportedDate: p.reportedDate,
      }))
    : [
        { id: 1, region: "Karnataka (Hassan)", diseaseType: "Lumpy Skin Disease", caseCount: 23, severity: "critical", latitude: 13.0033, longitude: 76.1004 },
        { id: 2, region: "Maharashtra (Pune)", diseaseType: "Bovine Respiratory Disease", caseCount: 45, severity: "high", latitude: 19.7515, longitude: 75.7139 },
        { id: 3, region: "Punjab (Ludhiana)", diseaseType: "Foot and Mouth Disease", caseCount: 12, severity: "medium", latitude: 31.1471, longitude: 75.3412 },
        { id: 4, region: "Rajasthan (Jaipur)", diseaseType: "Bluetongue Disease", caseCount: 8, severity: "low", latitude: 27.0238, longitude: 74.2179 },
        { id: 5, region: "Uttar Pradesh (Lucknow)", diseaseType: "Brucellosis", caseCount: 31, severity: "high", latitude: 26.8467, longitude: 80.9462 },
        { id: 6, region: "Tamil Nadu (Madurai)", diseaseType: "Anthrax Outbreak", caseCount: 3, severity: "critical", latitude: 11.1271, longitude: 78.6569 },
      ];

  const dashboardSosPoints = Array.isArray(sosData) ? sosData.map((s: any) => ({
    id: s.id,
    description: s.description || 'Emergency SOS',
    latitude: s.latitude || 28.6139,
    longitude: s.longitude || 77.2090,
  })) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Animal Hero Banner with Dynamic Slideshow */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 p-6 md:p-8 bg-gradient-to-r from-card via-card/85 to-background shadow-2xl">
        {bgImages.map((img, idx) => (
          <div 
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 transform scale-105 pointer-events-none ${idx === bgIndex ? 'opacity-75 z-10' : 'opacity-0 z-0'}`}
            style={{ backgroundImage: `url('${img}')` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/30 pointer-events-none z-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <Badge className="mb-3 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> {role} Portal Active
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
              Welcome, {user?.name || 'User'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base leading-relaxed">
              {role === 'Farmer' && "Manage your herd, track milk production, request tele-vet consultations, and file instant insurance claims."}
              {role === 'Veterinarian' && "Review tele-consultation requests, write digital prescriptions, and perform AI differential disease scans."}
              {role === 'Government & NGO' && "Monitor national disease outbreaks, dispatch emergency relief, and oversee livestock subsidy drives."}
              {role === 'Laboratory' && "Process lab test requests, run AI pathology scans, and publish digital lab certificates to QR tags."}
              {role === 'Animal Hospital' && "Manage emergency admissions, track ICU bed availability, and coordinate surgical doctor rosters."}
              {role === 'Insurance Provider' && "Inspect AI photo ear-tag claim submissions, audit fraud detection scores, and disperse payouts."}
              {role === 'Admin' && "Full system telemetry, user access verification controls, database backups, and platform audit logs."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setOpenQRScanner(true)}
              className="border-2 border-primary/40 bg-slate-900/90 text-white hover:bg-slate-800 font-semibold text-xs cursor-pointer shadow-md"
            >
              <QrCode className="w-4 h-4 mr-2 text-primary" /> Scan Ear Tag QR Code
            </Button>

            {(role === 'Farmer' || role === 'Veterinarian' || role === 'Laboratory') && (
              <Link href="/disease-detection">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer">
                  <Stethoscope className="w-4 h-4 mr-2" /> AI Health Scan
                </Button>
              </Link>
            )}
            {(role === 'Government & NGO') && (
              <Link href="/surveillance">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer">
                  <Activity className="w-4 h-4 mr-2" /> Outbreak Radar
                </Button>
              </Link>
            )}
            {(role === 'Insurance Provider') && (
              <Link href="/insurance">
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 cursor-pointer">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Inspect Claims
                </Button>
              </Link>
            )}
            {(role === 'Animal Hospital') && (
              <Link href="/sos">
                <Button className="bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 cursor-pointer">
                  <AlertCircle className="w-4 h-4 mr-2" /> Emergency Intake
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Role Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="glass-panel overflow-hidden relative group border-white/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-display font-bold">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Outbreak Map Section for NGO & Admin */}
      {(role === 'Government & NGO' || role === 'Admin') && (
        <Card className="bg-slate-900/90 border-2 border-primary/50 shadow-2xl overflow-hidden rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-950/60 border-b border-slate-700/80">
            <div>
              <CardTitle className="font-display flex items-center gap-2 text-xl text-white">
                <Map className="w-5 h-5 text-primary" /> Real-time Outbreak & Disease GIS Radar
              </CardTitle>
              <p className="text-sm text-slate-300 mt-0.5">
                Live spatial telemetry tracking active livestock disease clusters and emergency distress signals.
              </p>
            </div>
            <Link href="/surveillance">
              <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 border-slate-600 bg-slate-800 hover:bg-primary text-white cursor-pointer shadow-sm">
                Full Radar Screen <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 bg-slate-950/40">
            <InteractiveMap
              points={dashboardMapPoints}
              sosPoints={dashboardSosPoints}
              height="420px"
              center={[21.0000, 78.0000]}
              zoom={5}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="font-display">
              {role === 'Insurance Provider' ? 'Claims & Payout Telemetry' : 'Livestock Analytics & Yield Data'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {activeAnalytics && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeAnalytics.milkProduction} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="liters" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorLiters)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 flex flex-col">
          <CardHeader>
            <CardTitle className="font-display">Role Activity Trail</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
              {activities.map((activity, i) => (
                <div key={activity.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-0 md:left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] ml-10 md:ml-0 p-3 rounded-lg bg-secondary/5 border border-border/50 text-sm">
                    <p className="font-medium text-foreground">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-background border">{activity.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-xl font-display font-bold mb-4">{role} Specialized Workspace Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          <Link href="/disease-detection">
            <div className="p-4 rounded-2xl glass-panel border border-primary/20 hover:bg-card transition-colors flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="font-medium text-sm">AI Scan</div>
            </div>
          </Link>

          {(role === 'Farmer' || role === 'Admin') && (
            <Link href="/animals">
              <div className="p-4 rounded-2xl glass-panel border border-white/5 hover:bg-card transition-colors flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PawPrint className="w-5 h-5" />
                </div>
                <div className="font-medium text-sm">My Livestock</div>
              </div>
            </Link>
          )}

          <Link href="/appointments">
            <div className="p-4 rounded-2xl glass-panel border border-white/5 hover:bg-card transition-colors flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="font-medium text-sm">Appointments</div>
            </div>
          </Link>

          <Link href="/insurance">
            <div className="p-4 rounded-2xl glass-panel border border-white/5 hover:bg-card transition-colors flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="font-medium text-sm">Insurance Desk</div>
            </div>
          </Link>

          <Link href="/vaccinations">
            <div className="p-4 rounded-2xl glass-panel border border-white/5 hover:bg-card transition-colors flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="font-medium text-sm">Vaccinations</div>
            </div>
          </Link>

          {(role === 'Government & NGO' || role === 'Admin') && (
            <Link href="/surveillance">
              <div className="p-4 rounded-2xl glass-panel border border-white/5 hover:bg-card transition-colors flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="font-medium text-sm">Surveillance</div>
              </div>
            </Link>
          )}

          <Link href="/sos">
            <div className="p-4 rounded-2xl glass-panel border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="font-medium text-sm text-red-500">Emergency SOS</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Vet QR Scanner Simulator Modal */}
      <VetQRScannerModal 
        isOpen={openQRScanner}
        onClose={() => setOpenQRScanner(false)}
        animals={Array.isArray(animalsData) ? animalsData : []}
      />
    </div>
  );
}
