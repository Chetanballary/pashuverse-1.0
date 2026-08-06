import React, { useState } from 'react';
import { useGetDiseaseSurveillance, useListSosRequests } from '@workspace/api-client-react';
import { Map, AlertTriangle, ShieldCheck, Activity, BrainCircuit, Search, Navigation, AlertOctagon, Syringe, Radio, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import InteractiveMap, { OutbreakPoint } from '@/components/InteractiveMap';

export default function SurveillancePage() {
  const { data: surveillance, isLoading } = useGetDiseaseSurveillance();
  const { data: sosRequests } = useListSosRequests();
  const { toast } = useToast();
  
  const [selectedPointId, setSelectedPointId] = useState<number | string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fallbackPoints: OutbreakPoint[] = [
    { id: 1, region: "Karnataka (Hassan)", diseaseType: "Lumpy Skin Disease", caseCount: 23, severity: "critical", latitude: 13.0033, longitude: 76.1004, reportedDate: new Date().toISOString() },
    { id: 2, region: "Maharashtra (Pune)", diseaseType: "Bovine Respiratory Disease", caseCount: 45, severity: "high", latitude: 19.7515, longitude: 75.7139, reportedDate: new Date().toISOString() },
    { id: 3, region: "Punjab (Ludhiana)", diseaseType: "Foot and Mouth Disease", caseCount: 12, severity: "medium", latitude: 31.1471, longitude: 75.3412, reportedDate: new Date().toISOString() },
    { id: 4, region: "Rajasthan (Jaipur)", diseaseType: "Bluetongue Disease", caseCount: 8, severity: "low", latitude: 27.0238, longitude: 74.2179, reportedDate: new Date().toISOString() },
    { id: 5, region: "Uttar Pradesh (Lucknow)", diseaseType: "Brucellosis", caseCount: 31, severity: "high", latitude: 26.8467, longitude: 80.9462, reportedDate: new Date().toISOString() },
    { id: 6, region: "Tamil Nadu (Madurai)", diseaseType: "Anthrax Outbreak", caseCount: 3, severity: "critical", latitude: 11.1271, longitude: 78.6569, reportedDate: new Date().toISOString() },
  ];

  const points: OutbreakPoint[] = (Array.isArray(surveillance) && surveillance.length > 0) 
    ? (surveillance as any[]).map(p => ({
        id: p.id,
        region: p.region || 'Unknown Region',
        diseaseType: p.diseaseType || 'Unclassified Infection',
        caseCount: p.caseCount ?? 1,
        severity: p.severity || 'medium',
        latitude: typeof p.latitude === 'number' ? p.latitude : 20.5937,
        longitude: typeof p.longitude === 'number' ? p.longitude : 78.9629,
        reportedDate: p.reportedDate,
      }))
    : fallbackPoints;

  const filteredPoints = points.filter(p => 
    p.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diseaseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.severity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': 
        return <Badge variant="outline" className="text-red-400 bg-red-500/15 border-2 border-red-500/40 font-bold">CRITICAL</Badge>;
      case 'high': 
        return <Badge variant="outline" className="text-amber-400 bg-amber-500/15 border-2 border-amber-500/40 font-bold">HIGH</Badge>;
      case 'medium': 
        return <Badge variant="outline" className="text-yellow-400 bg-yellow-500/15 border-2 border-yellow-500/40 font-semibold">MEDIUM</Badge>;
      default: 
        return <Badge variant="outline" className="text-emerald-400 bg-emerald-500/15 border-2 border-emerald-500/40 font-medium">LOW</Badge>;
    }
  };

  const safeSosPoints = Array.isArray(sosRequests) ? sosRequests.map((s: any) => ({
    id: s.id,
    description: s.description || 'Emergency SOS Alert',
    latitude: s.latitude || 28.6139,
    longitude: s.longitude || 77.2090,
    status: s.status,
    createdAt: s.createdAt
  })) : [];

  const totalCases = points.reduce((acc, curr) => acc + curr.caseCount, 0);
  const criticalCount = points.filter(p => p.severity?.toLowerCase() === 'critical').length;
  const highCount = points.filter(p => p.severity?.toLowerCase() === 'high').length;

  const handleDispatchTeam = (region: string, disease: string) => {
    toast({
      title: "🚀 Emergency Relief Team Dispatched!",
      description: `Rapid Response Mobile Unit & Vaccines routed to ${region} for ${disease}.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border-2 border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3 text-white">
            <Map className="w-8 h-8 text-primary" />
            Disease Surveillance Network
          </h1>
          <p className="text-slate-300 mt-1 text-sm">National-scale real-time outbreak mapping, live GIS tracking, and AI risk forecasting.</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-2 border-primary/40 py-2 px-4 text-sm font-semibold shadow-md">
          <BrainCircuit className="w-4 h-4 mr-2" /> Live GIS Radar Active
        </Badge>
      </div>

      {/* Practical Executive Metrics Grid with Visible Borders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-2 border-red-500/40 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Hotspots</p>
              <h3 className="text-2xl font-bold text-red-400 mt-1">{criticalCount} Regions</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-2 border-amber-500/40 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Risk Zones</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{highCount} Zones</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-2 border-primary/40 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Affected Stock</p>
              <h3 className="text-2xl font-bold text-primary mt-1">{totalCases} Animals</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <Syringe className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-2 border-cyan-500/40 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active SOS Signals</p>
              <h3 className="text-2xl font-bold text-cyan-400 mt-1">{safeSosPoints.length} Alerts</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Radio className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Interactive Map + Sidebar Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Live Map Section */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl">
            <InteractiveMap 
              points={points}
              sosPoints={safeSosPoints}
              selectedPointId={selectedPointId}
              onSelectPoint={(point) => setSelectedPointId(point.id)}
              height="640px"
              center={[21.0000, 78.0000]}
              zoom={5}
            />
          </div>
        </div>

        {/* Active Hotspots Sidebar Container with Clearly Visible Border */}
        <div className="bg-slate-900/80 border-2 border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col h-[640px]">
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-700/80">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Active Outbreak Hotspots
            </h2>
            <Badge variant="secondary" className="text-xs bg-slate-800 border border-slate-600 text-slate-200 font-semibold px-2.5 py-1">
              {filteredPoints.length} Active
            </Badge>
          </div>

          {/* Quick Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search region, state, or disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950/80 border-2 border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-400 focus:border-primary"
            />
          </div>
          
          {/* Hotspot Cards List with Distinct Visible Borders */}
          <div className="space-y-3.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse">
                <p className="text-slate-400 font-medium">Loading GIS telemetry data...</p>
              </div>
            ) : filteredPoints.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border-2 border-emerald-500/30">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-400 font-semibold">No outbreaks matching filter.</p>
              </div>
            ) : (
              filteredPoints.map((point) => {
                const isSelected = selectedPointId === point.id;
                return (
                  <Card 
                    key={point.id} 
                    onClick={() => setSelectedPointId(point.id)}
                    className={`bg-slate-950/90 border-2 transition-all cursor-pointer group shadow-md ${isSelected ? 'border-primary ring-2 ring-primary/40 bg-primary/10' : 'border-slate-700/80 hover:border-slate-500 hover:bg-slate-900/90'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        {getSeverityBadge(point.severity)}
                        <button 
                          className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPointId(point.id);
                          }}
                        >
                          <Navigation className="w-3.5 h-3.5" /> Locate
                        </button>
                      </div>
                      
                      <h3 className="text-base font-bold font-display text-white mb-1">{point.diseaseType}</h3>
                      <div className="flex items-center text-slate-300 text-sm mb-3 gap-1">
                        <Map className="w-3.5 h-3.5 text-primary" /> {point.region}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/80 mb-3">
                        <div>
                          <span className="text-slate-400 block mb-0.5 font-medium">Confirmed Cases</span>
                          <span className="font-bold text-white text-base">{point.caseCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5 font-medium">GIS Status</span>
                          <span className="font-bold text-amber-400 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Monitored
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full text-xs font-semibold h-8 bg-slate-800 hover:bg-primary text-slate-100 hover:text-white border border-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDispatchTeam(point.region, point.diseaseType);
                        }}
                      >
                        <Send className="w-3.5 h-3.5" /> Dispatch Emergency Team
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


