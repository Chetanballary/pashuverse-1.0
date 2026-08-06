import React, { useState } from 'react';
import { useListAnimals, useCreateAnimal } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Search, Filter, Plus, Heart, AlertCircle, HeartPulse, PawPrint, QrCode, Scan, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AnimalDigitalIDModal from '@/components/AnimalDigitalIDModal';
import VetQRScannerModal from '@/components/VetQRScannerModal';

export default function AnimalsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [openRegister, setOpenRegister] = useState(false);
  const [customAnimals, setCustomAnimals] = useState<any[]>([]);

  // QR Modal States
  const [selectedAnimalForQR, setSelectedAnimalForQR] = useState<any | null>(null);
  const [openQRModal, setOpenQRModal] = useState(false);
  const [openScannerModal, setOpenScannerModal] = useState(false);

  const [newAnimal, setNewAnimal] = useState({
    name: '',
    species: 'Cow',
    breed: '',
    tagNumber: '',
    status: 'Healthy',
    age: 3,
    weight: 400,
  });
  
  const { data: rawAnimals, isLoading } = useListAnimals({ 
    search: search || undefined,
    status: status !== 'all' ? status : undefined 
  });

  const createAnimal = useCreateAnimal();

  const fallbackAnimals = [
    { id: 1, name: "Gauri", species: "Cow", breed: "Gir Indigenous", tagNumber: "IN-2026-001", status: "Healthy", age: 4, weight: 420, healthScore: 95, ownerName: "Suresh Kumar", ownerId: "user-1", imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=800", createdAt: new Date().toISOString() },
    { id: 2, name: "Lakshmi", species: "Buffalo", breed: "Murrah Dairy", tagNumber: "IN-2026-002", status: "Healthy", age: 5, weight: 480, healthScore: 92, ownerName: "Ramesh Patel", ownerId: "user-1", imageUrl: "https://images.unsplash.com/photo-1570042707223-b541334c44f3?auto=format&fit=crop&q=80&w=800", createdAt: new Date().toISOString() },
    { id: 3, name: "Nandi", species: "Bull", breed: "Sahiwal Bull", tagNumber: "IN-2026-003", status: "At Risk", age: 3, weight: 510, healthScore: 78, ownerName: "Gurpreet Singh", ownerId: "user-1", imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800", createdAt: new Date().toISOString() },
    { id: 4, name: "Radha", species: "Cow", breed: "Jersey Cross", tagNumber: "IN-2026-004", status: "Sick", age: 2, weight: 380, healthScore: 45, ownerName: "Sunita Devi", ownerId: "user-1", imageUrl: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=800", createdAt: new Date().toISOString() },
    { id: 5, name: "Bholu", species: "Goat", breed: "Osmanabadi", tagNumber: "IN-2026-005", status: "Healthy", age: 2, weight: 45, healthScore: 94, ownerName: "Mahadev Rao", ownerId: "user-1", imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800", createdAt: new Date().toISOString() },
    { id: 6, name: "Chanda", species: "Sheep", breed: "Deccani Wool", tagNumber: "IN-2026-006", status: "Healthy", age: 3, weight: 52, healthScore: 91, ownerName: "Venkatesh Naidu", ownerId: "user-1", imageUrl: "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&q=80&w=800", createdAt: new Date().toISOString() },
  ];

  const baseAnimals = (Array.isArray(rawAnimals) && rawAnimals.length > 0) ? rawAnimals : fallbackAnimals;
  const animals = [...customAnimals, ...baseAnimals];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimal.name || !newAnimal.breed) {
      toast({ title: "Validation Error", description: "Please provide Animal Name and Breed", variant: "destructive" });
      return;
    }

    const created: any = {
      id: Date.now(),
      name: newAnimal.name,
      species: newAnimal.species,
      breed: newAnimal.breed,
      tagNumber: newAnimal.tagNumber || `IN-2026-00${animals.length + 1}`,
      status: newAnimal.status,
      age: Number(newAnimal.age) || 3,
      weight: Number(newAnimal.weight) || 400,
      healthScore: 95,
      ownerId: "user-1",
      imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=400",
      createdAt: new Date().toISOString()
    };

    createAnimal.mutate({
      data: {
        name: created.name,
        species: created.species,
        breed: created.breed,
        age: created.age,
        weight: created.weight,
        ownerId: created.ownerId,
        tagNumber: created.tagNumber,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Animal Registered!", description: `${created.name} (${created.tagNumber}) added to Pashuverse.` });
      },
      onError: () => {
        toast({ title: "Registered Locally", description: `${created.name} (${created.tagNumber}) added to active session.` });
      }
    });

    setCustomAnimals([created, ...customAnimals]);
    setOpenRegister(false);
    setNewAnimal({ name: '', species: 'Cow', breed: '', tagNumber: '', status: 'Healthy', age: 3, weight: 400 });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'sick': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'at risk': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return <Heart className="w-3 h-3 mr-1" />;
      case 'sick': return <AlertCircle className="w-3 h-3 mr-1" />;
      case 'at risk': return <HeartPulse className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  // Health Score Ring Component
  const HealthRing = ({ score }: { score: number }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';

    return (
      <div className="relative w-12 h-12 flex items-center justify-center health-ring">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/30" />
          <circle 
            cx="24" cy="24" r={radius} 
            stroke="currentColor" strokeWidth="4" fill="none" 
            className={color}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-bold font-display">{score}</span>
      </div>
    );
  };

  const getAnimalPhoto = (animal: any) => {
    if (animal?.imageUrl && typeof animal.imageUrl === 'string' && animal.imageUrl.startsWith('http')) {
      return animal.imageUrl;
    }
    const sp = (animal?.species || '').toLowerCase();
    const br = (animal?.breed || '').toLowerCase();

    if (sp.includes('buffalo') || br.includes('murrah')) {
      return 'https://images.unsplash.com/photo-1570042707223-b541334c44f3?auto=format&fit=crop&q=80&w=800';
    }
    if (sp.includes('bull') || br.includes('sahiwal')) {
      return 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800';
    }
    if (sp.includes('goat') || br.includes('osmanabadi')) {
      return 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800';
    }
    if (sp.includes('sheep') || br.includes('deccani')) {
      return 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&q=80&w=800';
    }
    if (br.includes('jersey')) {
      return 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=800';
    }
    
    // Default Gir Indian Cow
    return 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">My Animals & Digital Livestock Passports</h1>
          <p className="text-muted-foreground mt-1">Manage herd records, generate smart QR ear tag identity cards, and share medical history with veterinarians.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setOpenScannerModal(true)}
            className="border-2 border-primary/40 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md cursor-pointer"
          >
            <Scan className="w-4 h-4 mr-2 text-primary" /> Scan Ear Tag QR Code
          </Button>

          <Dialog open={openRegister} onOpenChange={setOpenRegister}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs">
                <Plus className="w-4 h-4 mr-2" /> Register New Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-display font-bold">Register New Animal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="name">Animal Name</Label>
                  <Input id="name" required placeholder="e.g. Kamadhenu" value={newAnimal.name} onChange={e => setNewAnimal({...newAnimal, name: e.target.value})} className="bg-card/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="species">Species</Label>
                    <Select value={newAnimal.species} onValueChange={val => setNewAnimal({...newAnimal, species: val})}>
                      <SelectTrigger className="bg-card/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cow">Cow</SelectItem>
                        <SelectItem value="Buffalo">Buffalo</SelectItem>
                        <SelectItem value="Goat">Goat</SelectItem>
                        <SelectItem value="Sheep">Sheep</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="breed">Breed</Label>
                    <Input id="breed" required placeholder="e.g. Gir / Murrah" value={newAnimal.breed} onChange={e => setNewAnimal({...newAnimal, breed: e.target.value})} className="bg-card/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tag">Tag Number</Label>
                    <Input id="tag" placeholder="e.g. IN-2026-009" value={newAnimal.tagNumber} onChange={e => setNewAnimal({...newAnimal, tagNumber: e.target.value})} className="bg-card/50" />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={newAnimal.status} onValueChange={val => setNewAnimal({...newAnimal, status: val})}>
                      <SelectTrigger className="bg-card/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Healthy">Healthy</SelectItem>
                        <SelectItem value="At Risk">At Risk</SelectItem>
                        <SelectItem value="Sick">Sick</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age (Years)</Label>
                    <Input id="age" type="number" min="1" max="25" value={newAnimal.age} onChange={e => setNewAnimal({...newAnimal, age: Number(e.target.value)})} className="bg-card/50" />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" type="number" min="10" max="1200" value={newAnimal.weight} onChange={e => setNewAnimal({...newAnimal, weight: Number(e.target.value)})} className="bg-card/50" />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpenRegister(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">Register Animal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, tag ID, or breed..." 
            className="pl-9 bg-card/50 border-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-card/50 border-white/10">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="at risk">At Risk</SelectItem>
            <SelectItem value="sick">Sick</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="glass-panel h-48 animate-pulse border-white/5" />
          ))}
        </div>
      ) : animals?.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl border-white/5">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <PawPrint className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-semibold mb-2">No animals found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">You haven't registered any animals yet, or none match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {animals?.map(animal => (
            <Card key={animal.id} className="glass-panel overflow-hidden transition-all group border-white/10 hover:border-primary/40 flex flex-col justify-between">
              <div>
                <div className="h-44 bg-muted relative overflow-hidden">
                  <img 
                    src={getAnimalPhoto(animal)} 
                    alt={animal.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className={`glass-panel border px-2 py-1 ${getStatusColor(animal.status)}`}>
                      {getStatusIcon(animal.status)} {animal.status}
                    </Badge>
                  </div>
                  {animal.tagNumber && (
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-700 text-white font-mono text-xs px-2.5 py-1 rounded-md shadow-md">
                      🏷️ {animal.tagNumber}
                    </div>
                  )}
                </div>

                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-display font-bold group-hover:text-primary transition-colors">{animal.name}</h3>
                      <p className="text-sm text-muted-foreground">{animal.species} • {animal.breed}</p>
                    </div>
                    <HealthRing score={animal.healthScore || 95} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm pt-3 border-t border-border/50 mb-4">
                    <div>
                      <span className="text-muted-foreground block text-xs">Age</span>
                      <span className="font-medium">{animal.age ? `${animal.age} yrs` : 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Weight</span>
                      <span className="font-medium">{animal.weight ? `${animal.weight} kg` : 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons: View Profile & Digital QR Pass */}
              <div className="p-4 pt-0 space-y-2">
                <Button 
                  size="sm"
                  onClick={() => {
                    setSelectedAnimalForQR(animal);
                    setOpenQRModal(true);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 border-2 border-primary/40 text-xs font-semibold h-9 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5 text-primary" /> View Digital ID & QR Tag
                </Button>

                <Link href={`/animals/${animal.id}`}>
                  <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-white h-8 cursor-pointer">
                    Full Medical Profile & Digital Twin →
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* QR Identity Modal */}
      <AnimalDigitalIDModal 
        animal={selectedAnimalForQR}
        isOpen={openQRModal}
        onClose={() => setOpenQRModal(false)}
      />

      {/* Vet QR Scanner Simulator Modal */}
      <VetQRScannerModal 
        isOpen={openScannerModal}
        onClose={() => setOpenScannerModal(false)}
        animals={animals}
      />
    </div>
  );
}

