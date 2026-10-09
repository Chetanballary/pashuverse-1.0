import React, { useState } from 'react';
import { useGetAnimal, useGetAnimalDigitalTwin, useGetAnimalHealthRecords, useGetAnimalVaccinations } from '@workspace/api-client-react';
import { useParams } from 'wouter';
import { PawPrint, Activity, Thermometer, Info, Calendar, FileText, QrCode, AlertTriangle, Syringe, Heart, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import AnimalDigitalIDModal from '@/components/AnimalDigitalIDModal';

export default function AnimalProfilePage() {
  const { id } = useParams<{ id: string }>();
  const animalId = parseInt(id || "0");
  const [openQRModal, setOpenQRModal] = useState(false);
  
  const { data: animal, isLoading: animalLoading } = useGetAnimal(animalId, { query: { enabled: !!animalId } as any });
  const { data: twin } = useGetAnimalDigitalTwin(animalId, { query: { enabled: !!animalId } as any });
  const { data: records } = useGetAnimalHealthRecords(animalId, { query: { enabled: !!animalId } as any });
  const { data: vaccinations } = useGetAnimalVaccinations(animalId, { query: { enabled: !!animalId } as any });

  const fallbackAnimal = {
    id: animalId || 1,
    name: "Gauri",
    species: "Cow",
    breed: "Gir",
    tagNumber: "IN-2026-001",
    status: "Healthy",
    age: 4,
    weight: 420,
    healthScore: 95,
    ownerId: "user-1",
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=400",
    createdAt: new Date().toISOString()
  };

  const activeAnimal = animal || fallbackAnimal;
  const activeRecords = Array.isArray(records) ? records : [];
  const activeVaccinations = Array.isArray(vaccinations) ? vaccinations : [];

  const getStatusColor = (status: string) => {
    switch ((status || 'Healthy').toLowerCase()) {
      case 'healthy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'sick': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'at risk': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/animals">
            <Button variant="ghost" size="icon" className="rounded-full bg-card hover:bg-muted border border-white/5 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">{activeAnimal.name}</h1>
            <p className="text-muted-foreground">Digital Twin & Official Livestock Identity Passport</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setOpenQRModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/20 cursor-pointer"
        >
          <QrCode className="w-4 h-4 mr-2" /> Digital Identity & QR Tag Pass
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity & Status */}
        <div className="space-y-6">
          <Card className="glass-panel overflow-hidden border-white/5">
            <div className="h-48 bg-muted relative">
              {activeAnimal.imageUrl ? (
                <img src={activeAnimal.imageUrl} alt={activeAnimal.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                  <PawPrint className="w-16 h-16 text-secondary/30" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge className={`px-3 py-1.5 text-sm glass-panel border ${getStatusColor(activeAnimal.status)}`}>
                  {(activeAnimal.status || 'Healthy').toUpperCase()}
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-1">{activeAnimal.tagNumber || `ID: ${activeAnimal.id}`}</h2>
                  <p className="text-muted-foreground">{activeAnimal.species} • {activeAnimal.breed}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-primary">{activeAnimal.healthScore || 95}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Health Score</div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{activeAnimal.age ? `${activeAnimal.age} years` : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{activeAnimal.weight ? `${activeAnimal.weight} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Registered</span>
                  <span className="font-medium">{new Date(activeAnimal.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Clickable QR Code Identity Passport Trigger */}
              <div 
                onClick={() => setOpenQRModal(true)}
                className="mt-6 p-4 rounded-xl bg-slate-900/90 border-2 border-primary/40 hover:border-primary transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-display">Smart QR Identity Tag</h4>
                    <p className="text-[11px] text-slate-300">Click to view & print full passport</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Digital Twin & Details */}
        <div className="lg:col-span-2 space-y-6">
          {twin && (
            <Card className="glass-panel border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <CardTitle className="font-display">AI Digital Twin Forecast</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Real-time Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Nutrition Level</span>
                          <span className="font-medium">{twin.nutritionScore || 0}%</span>
                        </div>
                        <Progress value={twin.nutritionScore || 0} className="h-2 bg-black/20" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Activity Level</span>
                          <span className="font-medium">{twin.activityScore || 0}%</span>
                        </div>
                        <Progress value={twin.activityScore || 0} className="h-2 bg-black/20" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-background/50 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4" /> AI Predictive Risk
                    </h4>
                    <div className="text-2xl font-display font-bold mb-2">
                      <span className={twin.riskLevel === 'Low' ? 'text-emerald-500' : twin.riskLevel === 'High' ? 'text-red-500' : 'text-amber-500'}>
                        {twin.riskLevel} Risk
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {twin.aiForecasts || "No predictive anomalies detected based on current data models."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="health" className="w-full">
            <TabsList className="w-full bg-card/50 glass-panel border border-white/5 p-1">
              <TabsTrigger value="health" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="w-4 h-4 mr-2" /> Health Records
              </TabsTrigger>
              <TabsTrigger value="vaccinations" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Syringe className="w-4 h-4 mr-2" /> Vaccinations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="health" className="mt-4">
              <Card className="glass-panel border-white/5">
                <CardContent className="p-0 divide-y divide-white/5">
                  {!activeRecords?.length ? (
                    <div className="p-8 text-center text-muted-foreground">No health records found.</div>
                  ) : (
                    activeRecords.map(record => (
                      <div key={record.id} className="p-6 hover:bg-card/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold">{record.diagnosis}</h4>
                          <span className="text-sm text-muted-foreground">{new Date(record.recordedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Treatment: {record.treatment}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {record.veterinarianName && <span>By Dr. {record.veterinarianName}</span>}
                          {record.severity && (
                            <Badge variant="outline" className="border-red-500/20 text-red-500 bg-red-500/10">
                              {record.severity} Severity
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vaccinations" className="mt-4">
              <Card className="glass-panel border-white/5">
                <CardContent className="p-0 divide-y divide-white/5">
                  {!activeVaccinations?.length ? (
                    <div className="p-8 text-center text-muted-foreground">No vaccination records found.</div>
                  ) : (
                    activeVaccinations.map(vax => (
                      <div key={vax.id} className="p-6 flex items-center justify-between hover:bg-card/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                            <Syringe className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{vax.vaccineName}</h4>
                            <p className="text-sm text-muted-foreground">Administered: {new Date(vax.administeredDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {vax.nextDueDate && (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Next Due</div>
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/10">
                              {new Date(vax.nextDueDate).toLocaleDateString()}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Scannable Digital ID Modal */}
      <AnimalDigitalIDModal 
        animal={activeAnimal}
        isOpen={openQRModal}
        onClose={() => setOpenQRModal(false)}
      />
    </div>
  );
}
