import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Search, ShieldCheck, PawPrint, Stethoscope, Syringe, Heart, ArrowRight, Scan, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface VetQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals?: any[];
}

export default function VetQRScannerModal({ isOpen, onClose, animals = [] }: VetQRScannerModalProps) {
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState('');
  const [scannedAnimal, setScannedAnimal] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const defaultSampleAnimals = [
    { id: 1, name: "Gauri", species: "Cow", breed: "Gir Indigenous", tagNumber: "IN-2026-001", status: "Healthy", age: 4, weight: 420, healthScore: 95, ownerName: "Suresh Kumar (Farmer)", imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=800" },
    { id: 2, name: "Lakshmi", species: "Buffalo", breed: "Murrah Dairy", tagNumber: "IN-2026-002", status: "Healthy", age: 5, weight: 480, healthScore: 92, ownerName: "Ramesh Patel (Farmer)", imageUrl: "https://images.unsplash.com/photo-1570042707223-b541334c44f3?auto=format&fit=crop&q=80&w=800" },
    { id: 3, name: "Nandi", species: "Bull", breed: "Sahiwal Bull", tagNumber: "IN-2026-003", status: "At Risk", age: 3, weight: 510, healthScore: 78, ownerName: "Gurpreet Singh (Farmer)", imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800" },
    { id: 4, name: "Radha", species: "Cow", breed: "Jersey Cross", tagNumber: "IN-2026-004", status: "Sick", age: 2, weight: 380, healthScore: 45, ownerName: "Sunita Devi (Farmer)", imageUrl: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=800" },
    { id: 5, name: "Bholu", species: "Goat", breed: "Osmanabadi", tagNumber: "IN-2026-005", status: "Healthy", age: 2, weight: 45, healthScore: 94, ownerName: "Mahadev Rao (Farmer)", imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800" },
    { id: 6, name: "Chanda", species: "Sheep", breed: "Deccani Wool", tagNumber: "IN-2026-006", status: "Healthy", age: 3, weight: 52, healthScore: 91, ownerName: "Venkatesh Naidu (Farmer)", imageUrl: "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&q=80&w=800" },
  ];

  const pool = animals.length > 0 ? animals : defaultSampleAnimals;

  const handleSimulateScan = (tag: string) => {
    setIsScanning(true);
    setScannedAnimal(null);

    setTimeout(() => {
      setIsScanning(false);
      const match = pool.find(a => 
        (a.tagNumber && a.tagNumber.toLowerCase() === tag.toLowerCase()) || 
        String(a.id) === tag ||
        (a.name && a.name.toLowerCase() === tag.toLowerCase())
      ) || pool[0];

      setScannedAnimal(match);
      toast({
        title: "⚡ QR Tag Verified!",
        description: `Retrieved complete medical passport for ${match.name} (${match.tagNumber || 'IN-2026-001'}).`,
      });
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-2 border-primary/50 bg-slate-950/95 text-white sm:max-w-lg p-0 overflow-hidden shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-slate-900 via-slate-900 to-primary/20 border-b border-slate-800">
          <Badge className="w-fit mb-2 bg-primary/20 text-primary border border-primary/40 text-xs font-semibold">
            <Scan className="w-3.5 h-3.5 mr-1" /> Tele-Vet Instant QR Telemetry
          </Badge>
          <DialogTitle className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-primary" /> Scan Animal Ear Tag QR Code
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-xs mt-0.5">
            Scan smart ear tag or enter Tag ID to decrypt medical records, vaccines & owner credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Scanner Simulation Area */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border-2 border-slate-700/80 text-center relative overflow-hidden">
            <div className="w-28 h-28 mx-auto border-2 border-dashed border-primary/60 rounded-2xl flex items-center justify-center relative bg-slate-950 mb-3 group hover:border-primary transition-colors">
              {isScanning ? (
                <div className="absolute inset-0 bg-primary/20 animate-pulse flex flex-col items-center justify-center text-primary font-bold text-xs">
                  <Scan className="w-8 h-8 animate-bounce mb-1" /> DECRYPTING...
                </div>
              ) : (
                <QrCode className="w-16 h-16 text-primary/80" />
              )}
            </div>

            <p className="text-xs text-slate-300 mb-4 font-medium">
              Point mobile camera at animal ear tag QR code or select quick sample:
            </p>

            {/* Quick Demo Tag Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {pool.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTagInput(item.tagNumber || `IN-2026-00${item.id}`);
                    handleSimulateScan(item.tagNumber || `IN-2026-00${item.id}`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 hover:border-primary hover:text-white transition-all font-mono font-semibold"
                >
                  🏷️ {item.tagNumber || `IN-2026-00${item.id}`} ({item.name})
                </button>
              ))}
            </div>

            {/* Manual Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter Tag ID e.g. IN-2026-001..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="bg-slate-950 border-2 border-slate-700 text-sm text-white placeholder:text-slate-400"
              />
              <Button
                onClick={() => handleSimulateScan(tagInput || "IN-2026-001")}
                disabled={isScanning}
                className="bg-primary hover:bg-primary/90 text-slate-950 font-bold text-xs px-4"
              >
                Scan QR
              </Button>
            </div>
          </div>

          {/* Scanned Result Details Card */}
          {scannedAnimal && (
            <Card className="bg-slate-900/90 border-2 border-emerald-500/50 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-md shrink-0 bg-slate-800">
                      <img 
                        src={scannedAnimal.imageUrl || "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=400"} 
                        alt={scannedAnimal.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base font-display">{scannedAnimal.name}</h4>
                      <p className="text-xs text-slate-400">{scannedAnimal.species} • {scannedAnimal.breed}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs px-3 py-1 font-bold">
                    {scannedAnimal.status || 'HEALTHY'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Tag ID</span>
                    <strong className="text-white font-mono">{scannedAnimal.tagNumber || 'IN-2026-001'}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Health Score</span>
                    <strong className="text-emerald-400 font-bold">{scannedAnimal.healthScore || 95}%</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Age / Weight</span>
                    <strong className="text-white font-bold">{scannedAnimal.age || 4}Y • {scannedAnimal.weight || 420}kg</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Owner</span>
                    <strong className="text-white">{scannedAnimal.ownerName || 'Suresh Kumar (Farmer)'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">FMD Vaccine</span>
                    <strong className="text-emerald-400">✓ Verified Active</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tele-Vet History</span>
                    <strong className="text-primary">3 Consultations Recorded</strong>
                  </div>
                </div>

                <Link href={`/animals/${scannedAnimal.id || 1}`} onClick={onClose}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer">
                    Open Full Medical Profile & Digital Twin <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
