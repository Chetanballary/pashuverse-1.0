import React, { useState } from 'react';
import { useListVaccinations } from '@workspace/api-client-react';
import { Syringe, CalendarDays, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VaccinationsPage() {
  const { data: vaccinations, isLoading } = useListVaccinations();

  const isPastDue = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const getUpcoming = () => vaccinations?.filter(v => v.nextDueDate) || [];
  const getHistory = () => vaccinations || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <Syringe className="w-8 h-8 text-blue-500" />
            Vaccination Manager
          </h1>
          <p className="text-muted-foreground mt-1">Track schedules and maintain digital certificates.</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Record Vaccination
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-card/50 glass-panel border-white/5 mb-6 h-12 w-full max-w-sm">
          <TabsTrigger value="upcoming" className="h-10 px-6 data-[state=active]:bg-blue-500 data-[state=active]:text-white">Upcoming Due</TabsTrigger>
          <TabsTrigger value="history" className="h-10 px-6 data-[state=active]:bg-blue-500 data-[state=active]:text-white">History & Certs</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <Card key={i} className="h-24 animate-pulse bg-card/50 border-white/5" />)}
            </div>
          ) : getUpcoming().length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl border-white/5">
              <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No upcoming vaccinations scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getUpcoming().map(vax => (
                <Card key={vax.id} className="glass-panel border-white/5 overflow-hidden">
                  <div className={`h-1 w-full ${isPastDue(vax.nextDueDate) ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPastDue(vax.nextDueDate) ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        <CalendarDays className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg">{vax.vaccineName}</h3>
                        <p className="text-sm text-muted-foreground">Animal ID: {vax.animalId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Due Date</div>
                        <div className={`font-bold ${isPastDue(vax.nextDueDate) ? 'text-red-500' : 'text-amber-500'}`}>
                          {new Date(vax.nextDueDate!).toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="outline" className="ml-auto sm:ml-0 bg-background/50 hover:bg-blue-500 hover:text-white border-white/10">
                        Record Done
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <div className="space-y-4">
            {getHistory().map(vax => (
              <Card key={vax.id} className="glass-panel border-white/5 hover:bg-card/60 transition-colors">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{vax.vaccineName}</h4>
                      <div className="text-sm text-muted-foreground flex gap-2">
                        <span>Administered: {new Date(vax.administeredDate).toLocaleDateString()}</span>
                        {vax.veterinarianName && <span>• By Dr. {vax.veterinarianName}</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                    View Certificate <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
