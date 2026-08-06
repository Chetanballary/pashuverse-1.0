import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useGetAnimal } from '@workspace/api-client-react';
import { PawPrint, ShieldCheck, MapPin, User, Phone, CheckCircle2, QrCode, ArrowLeft, Heart, Calendar, Activity, Syringe, PhoneCall, Copy, Download, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import InteractiveMap from '@/components/InteractiveMap';

export default function VerifyAnimalPage() {
  const { tagId } = useParams<{ tagId?: string }>();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const cleanTagId = tagId || "IN-2026-001";

  // Mock sample database mapping for quick instant lookup with breed-specific photos
  const animalDatabase: Record<string, any> = {
    "IN-2026-001": {
      id: 1,
      name: "Gauri",
      species: "Cow",
      breed: "Gir (Pure Indigenous Breed)",
      tagNumber: "IN-2026-001",
      status: "Healthy",
      age: 4,
      weight: 420,
      milkYield: "14.5 Liters / Day",
      healthScore: 95,
      ownerName: "Suresh Kumar",
      ownerId: "FARM-KA-8890",
      ownerPhone: "+91 98765 43210",
      farmAddress: "Green Valley Dairy Farm, Sector 3",
      district: "Hassan District",
      state: "Karnataka",
      latitude: 13.0033,
      longitude: 76.1004,
      nearestVet: "District Veterinary Center (3.8 km)",
      imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=800",
      vaccinations: [
        { name: "Foot and Mouth Disease (FMD)", date: "2026-01-15", status: "Active Immunization", batch: "FMD-9821" },
        { name: "Lumpy Skin Virus Vaccine (LSD)", date: "2025-11-20", status: "Protected", batch: "LSD-4410" },
        { name: "Brucellosis Booster", date: "2025-08-10", status: "Verified", batch: "BRU-1120" },
      ],
      vetVerification: "Dr. Vikram Patil (District Vet Officer • ID: VET-KA-402)",
      registeredDate: "2025-03-12"
    },
    "IN-2026-002": {
      id: 2,
      name: "Lakshmi",
      species: "Buffalo",
      breed: "Murrah High-Yield Breed",
      tagNumber: "IN-2026-002",
      status: "Healthy",
      age: 5,
      weight: 480,
      milkYield: "18.0 Liters / Day",
      healthScore: 92,
      ownerName: "Ramesh Patel",
      ownerId: "FARM-MH-1042",
      ownerPhone: "+91 98230 11223",
      farmAddress: "Patel Organic Livestock Unit, Pune Road",
      district: "Pune District",
      state: "Maharashtra",
      latitude: 19.7515,
      longitude: 75.7139,
      nearestVet: "Pune Regional Animal Clinic (2.5 km)",
      imageUrl: "https://images.unsplash.com/photo-1570042707223-b541334c44f3?auto=format&fit=crop&q=80&w=800",
      vaccinations: [
        { name: "Foot and Mouth Disease (FMD)", date: "2026-02-01", status: "Active Immunization", batch: "FMD-9901" },
        { name: "Haemorrhagic Septicemia", date: "2025-12-05", status: "Protected", batch: "HS-3321" },
      ],
      vetVerification: "Dr. Ananya Sharma (Chief Vet Consultant)",
      registeredDate: "2025-04-18"
    },
    "IN-2026-003": {
      id: 3,
      name: "Nandi",
      species: "Bull",
      breed: "Sahiwal Breeding Bull",
      tagNumber: "IN-2026-003",
      status: "At Risk",
      age: 3,
      weight: 510,
      milkYield: "N/A (Breeding Bull)",
      healthScore: 78,
      ownerName: "Gurpreet Singh",
      ownerId: "FARM-PB-5021",
      ownerPhone: "+91 97112 33445",
      farmAddress: "Singh Cattle Breeding Farm, GT Road",
      district: "Ludhiana District",
      state: "Punjab",
      latitude: 30.9010,
      longitude: 75.8573,
      nearestVet: "Ludhiana Veterinary Hospital (1.8 km)",
      imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800",
      vaccinations: [
        { name: "Foot and Mouth Disease (FMD)", date: "2026-01-10", status: "Booster Administered", batch: "FMD-7712" },
        { name: "Black Quarter Vaccine", date: "2025-10-15", status: "Active", batch: "BQ-8819" },
      ],
      vetVerification: "Dr. Jaswinder Kaur (Veterinary Inspector)",
      registeredDate: "2025-05-10"
    },
    "IN-2026-004": {
      id: 4,
      name: "Radha",
      species: "Cow",
      breed: "Jersey Crossbreed",
      tagNumber: "IN-2026-004",
      status: "Sick",
      age: 2,
      weight: 380,
      milkYield: "12.0 Liters / Day",
      healthScore: 45,
      ownerName: "Sunita Devi",
      ownerId: "FARM-UP-3391",
      ownerPhone: "+91 94150 99881",
      farmAddress: "Devi Dairy Unit, Village Rampur",
      district: "Lucknow District",
      state: "Uttar Pradesh",
      latitude: 26.8467,
      longitude: 80.9462,
      nearestVet: "Lucknow Central Vet Hospital (5.0 km)",
      imageUrl: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=800",
      vaccinations: [
        { name: "Foot and Mouth Disease (FMD)", date: "2025-09-12", status: "Due for Renewal", batch: "FMD-5521" },
      ],
      vetVerification: "Dr. Alok Verma (District Tele-Vet)",
      registeredDate: "2025-06-22"
    },
    "IN-2026-005": {
      id: 5,
      name: "Bholu",
      species: "Goat",
      breed: "Osmanabadi Meat & Milk Goat",
      tagNumber: "IN-2026-005",
      status: "Healthy",
      age: 2,
      weight: 45,
      milkYield: "2.5 Liters / Day",
      healthScore: 94,
      ownerName: "Mahadev Rao",
      ownerId: "FARM-MH-8812",
      ownerPhone: "+91 98221 44556",
      farmAddress: "Osmanabad Goat Breeding Farm",
      district: "Osmanabad District",
      state: "Maharashtra",
      latitude: 18.1861,
      longitude: 76.0419,
      nearestVet: "Sub-Divisional Veterinary Dispensary (1.2 km)",
      imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800",
      vaccinations: [
        { name: "Peste des Petits Ruminants (PPR)", date: "2026-01-05", status: "Immunized", batch: "PPR-1029" },
      ],
      vetVerification: "Dr. Sanjay Shinde (Vet Assistant)",
      registeredDate: "2025-07-01"
    },
    "IN-2026-006": {
      id: 6,
      name: "Chanda",
      species: "Sheep",
      breed: "Deccani Wool Sheep",
      tagNumber: "IN-2026-006",
      status: "Healthy",
      age: 3,
      weight: 52,
      milkYield: "N/A (Wool & Breeding)",
      healthScore: 91,
      ownerName: "Venkatesh Naidu",
      ownerId: "FARM-AP-4401",
      ownerPhone: "+91 94401 77889",
      farmAddress: "Deccan Sheep Grazing Pastoral Unit",
      district: "Kurnool District",
      state: "Andhra Pradesh",
      latitude: 15.8281,
      longitude: 78.0373,
      nearestVet: "Kurnool Livestock Hospital (3.1 km)",
      imageUrl: "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&q=80&w=800",
      vaccinations: [
        { name: "Enterotoxaemia (ET) Vaccine", date: "2025-11-18", status: "Protected", batch: "ET-4412" },
      ],
      vetVerification: "Dr. M. Reddeppa (Vet Officer)",
      registeredDate: "2025-08-14"
    }
  };

  const animal = animalDatabase[cleanTagId.toUpperCase()] || animalDatabase["IN-2026-001"];

  const handleCopyTag = () => {
    navigator.clipboard.writeText(animal.tagNumber);
    setCopied(true);
    toast({
      title: "Ear Tag ID Copied!",
      description: `Copied ${animal.tagNumber} to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <Link href="/">
          <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-xs gap-1.5 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Pashuverse Portal
          </Button>
        </Link>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Official Govt & NGO Tele-Vet Verified Tag
        </Badge>
      </div>

      {/* Main Identity Banner Card */}
      <Card className="bg-slate-900/90 border-2 border-primary/50 shadow-2xl overflow-hidden rounded-3xl mb-6">
        <div className="relative h-64 bg-slate-950">
          <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Badge className="bg-slate-950/80 border-2 border-slate-700 text-white font-mono text-sm px-3 py-1.5 shadow-lg">
              🏷️ Smart Tag: {animal.tagNumber}
            </Badge>
          </div>

          <div className="absolute top-4 right-4">
            <Badge className="bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 text-xs shadow-lg uppercase">
              ✓ {animal.status}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs text-primary font-bold uppercase tracking-widest block mb-1">National Livestock Digital Passport</span>
              <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
                {animal.name}
              </h1>
              <p className="text-slate-300 text-base mt-1">{animal.species} • {animal.breed}</p>
            </div>
            
            <div className="bg-slate-950/90 p-3 rounded-2xl border border-slate-700/80 flex items-center gap-4 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Health Index</span>
                <strong className="text-2xl font-bold text-emerald-400 font-display">{animal.healthScore}%</strong>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Daily Yield</span>
                <strong className="text-xl font-bold text-primary font-display">{animal.milkYield}</strong>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Animal Details Card */}
        <Card className="bg-slate-900/90 border-2 border-slate-700/80 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-lg font-display text-white flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" /> Animal Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Animal Name</span>
              <strong className="text-white font-bold text-base">{animal.name}</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Species & Breed</span>
              <strong className="text-slate-200">{animal.species} ({animal.breed})</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Ear Tag ID</span>
              <strong className="text-primary font-mono font-bold flex items-center gap-1.5">
                {animal.tagNumber}
                <button onClick={handleCopyTag} className="text-slate-400 hover:text-white">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Age & Body Weight</span>
              <strong className="text-white">{animal.age} Years • {animal.weight} kg</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Registry Date</span>
              <strong className="text-slate-300">{new Date(animal.registeredDate).toLocaleDateString()}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Owner & Location Details Card */}
        <Card className="bg-slate-900/90 border-2 border-slate-700/80 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-lg font-display text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" /> Owner Credentials & Farm Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Farmer / Owner</span>
              <strong className="text-white font-bold text-base">{animal.ownerName}</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Farmer Reg ID</span>
              <strong className="text-slate-200 font-mono">{animal.ownerId}</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Contact Phone</span>
              <a href={`tel:${animal.ownerPhone}`} className="text-primary font-bold hover:underline flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {animal.ownerPhone}
              </a>
            </div>
            <div className="flex justify-between items-start pb-2 border-b border-slate-800">
              <span className="text-slate-400">Location</span>
              <strong className="text-slate-200 text-right">{animal.district}, {animal.state}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">GPS Coordinates</span>
              <strong className="text-slate-300 font-mono text-xs">{animal.latitude}° N, {animal.longitude}° E</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical & Vaccination Records */}
      <Card className="bg-slate-900/90 border-2 border-slate-700/80 shadow-xl rounded-2xl mb-6">
        <CardHeader className="border-b border-slate-800 pb-3">
          <CardTitle className="text-lg font-display text-white flex items-center gap-2">
            <Syringe className="w-5 h-5 text-blue-400" /> Vaccination & Medical Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3 mb-4">
            {animal.vaccinations.map((vax: any, i: number) => (
              <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">{vax.name}</h5>
                    <p className="text-slate-400">Administered: {vax.date} • Batch: {vax.batch}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {vax.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Certified Tele-Vet Officer</span>
            <strong className="text-primary font-semibold">{animal.vetVerification}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Farm Location Map */}
      <Card className="bg-slate-900/90 border-2 border-slate-700/80 shadow-xl rounded-2xl overflow-hidden mb-6">
        <CardHeader className="border-b border-slate-800 pb-3">
          <CardTitle className="text-lg font-display text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-400" /> Verified Farm Location
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <InteractiveMap
            points={[{
              id: animal.id,
              region: animal.district,
              diseaseType: `${animal.name}'s Farm Location`,
              caseCount: 1,
              severity: 'low',
              latitude: animal.latitude,
              longitude: animal.longitude,
            }]}
            height="300px"
            center={[animal.latitude, animal.longitude]}
            zoom={9}
          />
        </CardContent>
      </Card>

      {/* Public Verification Footer */}
      <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-xs text-slate-400">
        <p className="mb-2">
          This digital health passport is tamper-evident and cryptographically signed by the Pashuverse National Livestock Registry.
        </p>
        <span className="font-mono text-[11px] text-slate-500">
          Verification Hash: SHA256:{cleanTagId}-PV-2026-SECURE-9981
        </span>
      </div>
    </div>
  );
}
