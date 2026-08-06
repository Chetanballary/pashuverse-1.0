import React, { useState } from 'react';
import { useListSosRequests, useCreateSosRequest, useUpdateSosRequest, getListSosRequestsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, MapPin, PhoneCall, ShieldAlert, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function SosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useListSosRequests();
  const createSos = useCreateSosRequest();
  const updateSos = useUpdateSosRequest();

  const [description, setDescription] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handlePanicButton = () => {
    if (!description) {
      toast({ title: "Error", description: "Please enter emergency details briefly.", variant: "destructive" });
      return;
    }

    setIsLocating(true);
    
    // Simulate fetching GPS coordinates
    setTimeout(() => {
      createSos.mutate({
        data: {
          farmerId: user?.id || "user-1",
          description: description,
          latitude: 28.6139,  // Mock Delhi coordinates
          longitude: 77.2090
        }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSosRequestsQueryKey() });
          setDescription('');
          setIsLocating(false);
          toast({
            title: "SOS Broadcasted!",
            description: "Emergency response teams and nearby vets have been notified.",
            variant: "destructive" // Show as red toast
          });
        }
      });
    }, 1500);
  };

  const activeRequests = requests?.filter(r => r.status !== 'Resolved') || [];
  const pastRequests = requests?.filter(r => r.status === 'Resolved') || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 text-red-500">
        <ShieldAlert className="w-10 h-10" />
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Emergency SOS</h1>
          <p className="text-red-500/80 mt-1">Only use for immediate life-threatening situations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panic Button Area */}
        <Card className="glass-panel border-red-500/30 bg-gradient-to-b from-card to-red-500/10 flex flex-col justify-center items-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 pulse-slow" />
          
          <Textarea 
            placeholder="What is the emergency? (e.g. Multiple cows collapsed, severe bleeding...)"
            className="w-full mb-8 bg-background/80 border-red-500/30 resize-none z-10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePanicButton}
            disabled={isLocating || createSos.isPending}
            className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-700 text-white font-display font-bold text-2xl shadow-[0_0_50px_rgba(220,38,38,0.6)] flex flex-col items-center justify-center gap-2 z-10 border-4 border-red-400"
          >
            {isLocating || createSos.isPending ? (
              <>
                <MapPin className="w-10 h-10 animate-bounce" />
                <span className="text-lg">LOCATING...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-12 h-12" />
                SEND SOS
              </>
            )}
          </motion.button>
          
          <p className="text-sm text-center text-red-500/80 mt-8 z-10 max-w-sm">
            Pressing this button will instantly share your GPS coordinates and notify the nearest animal hospitals, government response teams, and available vets.
          </p>
        </Card>

        {/* Nearby Support (Decorative) */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-muted-foreground" />
            Nearest Response Units
          </h2>
          
          <Card className="glass-panel border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">District Vet Hospital</h4>
                  <p className="text-sm text-muted-foreground">4.2 km away • 12 mins ETA</p>
                </div>
              </div>
              <Button size="icon" variant="outline" className="rounded-full"><PhoneCall className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
          
          <Card className="glass-panel border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Rapid Response Team Alpha</h4>
                  <p className="text-sm text-muted-foreground">6.8 km away • Active Mobile Unit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Broadcasts */}
          {activeRequests.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-display font-semibold mb-3 text-red-500">Active SOS Broadcasts</h3>
              <div className="space-y-3">
                {activeRequests.map(req => (
                  <Card key={req.id} className="border-red-500/30 bg-red-500/5">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-red-500 text-white animate-pulse">BROADCASTING</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm font-medium mb-3">{req.description}</p>
                      <div className="flex gap-2">
                        {user?.role === 'Admin' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-8"
                            onClick={() => updateSos.mutate({ id: req.id, data: { status: 'Resolved' } }, {
                              onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSosRequestsQueryKey() })
                            })}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
