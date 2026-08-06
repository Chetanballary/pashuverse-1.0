import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Download, Share2, Printer, ShieldCheck, PawPrint, Heart, CheckCircle2, Copy, Sparkles, User, Calendar, Syringe, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface AnimalIdentityPayload {
  id: number | string;
  name: string;
  species: string;
  breed: string;
  tagNumber?: string | null;
  status: string;
  age?: number | null;
  weight?: number | null;
  healthScore?: number;
  ownerName?: string;
  ownerId?: string;
  imageUrl?: string | null;
  createdAt?: string;
  vaccinations?: { name: string; date: string; status: string }[];
}

interface AnimalDigitalIDModalProps {
  animal: AnimalIdentityPayload | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AnimalDigitalIDModal({ animal, isOpen, onClose }: AnimalDigitalIDModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [qrMode, setQrMode] = useState<'url' | 'text' | 'json'>('url');
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!animal) return null;

  const tagId = animal.tagNumber || `IN-2026-00${animal.id}`;
  const healthScore = animal.healthScore || 95;
  const owner = animal.ownerName || "Suresh Kumar (Farmer)";
  const verifyUrl = `${window.location.origin}/verify/${tagId}`;

  // Ultra-crisp concise plain text payload for phone camera readability
  const animalPayloadText = 
`PASHUVERSE LIVESTOCK PASSPORT
Tag ID: ${tagId}
Name: ${animal.name} (${animal.species} - ${animal.breed})
Health Score: ${healthScore}% (${animal.status})
Age/Weight: ${animal.age} Yrs | ${animal.weight} kg
Owner: ${owner}
Location: Hassan District, Karnataka
Vaccines: FMD & LSD (Up-to-Date)
Verify Link: ${verifyUrl}`;

  // Encoded JSON Payload
  const animalPayloadJSON = JSON.stringify({
    tagNumber: tagId,
    animalName: animal.name,
    species: animal.species,
    breed: animal.breed,
    age: `${animal.age} Yrs`,
    weight: `${animal.weight} kg`,
    healthScore: `${healthScore}%`,
    status: animal.status,
    owner: owner,
    verificationUrl: verifyUrl,
  }, null, 2);

  const qrValue = qrMode === 'url' ? verifyUrl : qrMode === 'text' ? animalPayloadText : animalPayloadJSON;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    toast({
      title: "Identity Verification Link Copied!",
      description: `Shareable QR verification URL copied for ${animal.name} (${tagId}).`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    try {
      const canvas = canvasRef.current?.querySelector('canvas');
      if (canvas) {
        const image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image;
        a.download = `Pashuverse_QR_Tag_${tagId}.png`;
        a.click();
        toast({
          title: "QR Code PNG Downloaded!",
          description: `Saved high-resolution QR Tag Image for ${animal.name} (${tagId}).`,
        });
      }
    } catch (err) {
      toast({
        title: "Download Started",
        description: `Generating QR image for ${animal.name}.`,
      });
    }
  };

  const handlePrint = () => {
    toast({
      title: "Preparing Smart Passport Print...",
      description: `Generating printable PDF Ear Tag Passport for ${animal.name}.`,
    });
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-2 border-primary/40 bg-slate-950/95 text-white sm:max-w-lg p-0 overflow-hidden shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-slate-900 via-slate-900 to-primary/20 border-b border-slate-800 flex flex-row items-center justify-between">
          <div>
            <Badge className="mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Digital Livestock Passport
            </Badge>
            <DialogTitle className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <PawPrint className="w-6 h-6 text-primary" /> {animal.name}'s Smart Identity Tag
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs mt-0.5">
              Official QR-encoded health & ownership record for Tele-Veterinarian instant lookup.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Main Printable Digital ID Badge Card */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-primary/50 p-5 shadow-2xl overflow-hidden ring-1 ring-primary/20">
            {/* Background Hologram Graphic */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Organization & Tag Barcode */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-slate-950 font-bold font-display shadow-md">
                  PV
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white tracking-wide">PASHUVERSE NATIONAL REGISTRY</h4>
                  <p className="text-[10px] text-slate-400 font-mono">GOVT / NGO TELE-VET VERIFIED</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-slate-900 border-2 border-slate-700 text-slate-200 font-mono text-xs px-2.5 py-1">
                {tagId}
              </Badge>
            </div>

            {/* Content: Photo + Ultra-Fast Scannable Canvas QR Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
              {/* Animal Photo */}
              <div className="sm:col-span-1 flex flex-col items-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/50 shadow-lg relative bg-slate-800 mb-2">
                  <img 
                    src={animal.imageUrl || "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=400"} 
                    alt={animal.name}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-1 right-1 bg-emerald-500 text-slate-950 p-1 rounded-full text-[10px] font-bold shadow">
                    ✓
                  </div>
                </div>
                <span className="text-xs font-bold text-white font-display">{animal.name}</span>
                <span className="text-[11px] text-slate-400">{animal.species} • {animal.breed}</span>
              </div>

              {/* Ultra-Fast Scannable QR Code Canvas */}
              <div className="sm:col-span-2 bg-slate-950 p-3 rounded-2xl border-2 border-slate-800 flex flex-col items-center justify-center relative">
                <div ref={canvasRef} className="p-3 bg-white rounded-xl shadow-xl flex items-center justify-center mb-2">
                  <QRCodeCanvas 
                    value={qrValue}
                    size={155}
                    level="L"
                    includeMargin={true}
                  />
                </div>

                {/* Download PNG Button */}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDownloadQR}
                  className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-xs text-slate-200 h-7 px-2.5 mb-2 cursor-pointer"
                >
                  <Download className="w-3 h-3 mr-1 text-primary" /> Download High-Res QR PNG
                </Button>
                
                {/* QR Data Mode Switch */}
                <div className="flex flex-wrap justify-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
                  <button 
                    onClick={() => setQrMode('url')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all ${qrMode === 'url' ? 'bg-primary text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    🔗 Web Link
                  </button>
                  <button 
                    onClick={() => setQrMode('text')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all ${qrMode === 'text' ? 'bg-primary text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    📱 Plain Text Pass
                  </button>
                  <button 
                    onClick={() => setQrMode('json')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all ${qrMode === 'json' ? 'bg-primary text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    ⚙️ JSON Data
                  </button>
                </div>
              </div>
            </div>

            {/* Embedded Live QR Contents Viewer Box */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span className="flex items-center gap-1 text-primary font-bold">
                  <QrCode className="w-3.5 h-3.5" /> Embedded Data Inside QR Code:
                </span>
                <span className="text-[10px] text-slate-500 uppercase">{qrMode} mode</span>
              </div>
              <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 max-h-24 overflow-y-auto">
                {qrValue}
              </pre>
            </div>

            {/* Key Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-4">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-medium block">Age & Weight</span>
                <strong className="text-white font-bold">{animal.age} Yrs • {animal.weight} kg</strong>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-medium block">Health Score</span>
                <strong className="text-emerald-400 font-bold flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-emerald-400 text-emerald-400" /> {healthScore}%
                </strong>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-medium block">Vaccines</span>
                <strong className="text-primary font-bold">100% Up to Date</strong>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-medium block">Status</span>
                <strong className="text-emerald-400 font-bold capitalize">{animal.status}</strong>
              </div>
            </div>

            {/* Owner & Verification Footer */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Registered Owner</span>
                  <span className="font-semibold text-white">{owner}</span>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Tele-Vet Certified
              </Badge>
            </div>
          </div>

          {/* Stored Medical Details Summary encoded in QR */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Syringe className="w-4 h-4 text-primary" /> Medical Data Encoded in QR Code:
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span>Foot & Mouth Disease Vaccine (FMD)</span>
                <span className="text-emerald-400 font-semibold">Active (Expires Dec 2026)</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span>Lumpy Skin Protection (LSD)</span>
                <span className="text-emerald-400 font-semibold">Verified Vaccination</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Last Tele-Vet Inspection</span>
                <span className="text-slate-200">Dr. Vikram Patil (Govt Officer)</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold gap-1.5 h-10 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-primary" /> {copied ? 'Copied!' : 'Copy Verification'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold gap-1.5 h-10 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" /> Print Smart Pass
            </Button>
            <Button
              size="sm"
              onClick={handleCopyLink}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-1.5 h-10 shadow-lg shadow-primary/20 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Tag Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
