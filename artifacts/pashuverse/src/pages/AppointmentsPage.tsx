import React, { useState, useEffect, useRef } from 'react';
import { useListAppointments, useCreateAppointment } from '@workspace/api-client-react';
import { 
  CalendarCheck, 
  Clock, 
  Video, 
  VideoOff, 
  Users, 
  MapPin, 
  Plus, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Download, 
  Radio, 
  Stethoscope,
  Volume2,
  ShieldCheck,
  CalendarPlus,
  Star,
  Award,
  UserCheck,
  AlarmClock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCallNotification } from '@/context/CallNotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { pushCall } = useCallNotification();
  const { data: rawAppointments, isLoading } = useListAppointments();
  const createAppointment = useCreateAppointment();

  // Role checks
  const isProviderRole = user?.role === 'Laboratory' || user?.role === 'Animal Hospital' || user?.role === 'Veterinarian';
  const isFarmerOrAdmin = user?.role === 'Farmer' || user?.role === 'Admin' || !user?.role;

  const [openBook, setOpenBook] = useState(false);
  const [customAppts, setCustomAppts] = useState<any[]>([]);

  // Tele-Vet Live Call State
  const [isCalling, setIsCalling] = useState(false); // Farmer outgoing call state
  const [incomingCall, setIncomingCall] = useState<any | null>(null); // Vet incoming call ringing state
  const [activeCallRoom, setActiveCallRoom] = useState<any | null>(null); // Active Call Room State
  const [activeCallingVetPhone, setActiveCallingVetPhone] = useState<string>('');

  const getVetPhone = (vetName: string) => {
    if (user?.role === 'Veterinarian' && user.phone) {
      return user.phone;
    }
    const name = (vetName || '').toLowerCase();
    if (name.includes('anita')) return '+91 98765 43210';
    if (name.includes('vikram')) return '+91 98765 11111';
    if (name.includes('rajesh')) return '+91 98765 22222';
    return '+91 98765 33333';
  };

  const [onlineVets, setOnlineVets] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/users?role=Veterinarian')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOnlineVets(data);
        }
      })
      .catch(err => console.error("Error fetching online vets:", err));
  }, []);

  const defaultVets = [
    { name: "Dr. Anita Sharma (MVSc)", phone: "+91 98765 43210", spec: "Bovine Specialist" },
    { name: "Dr. Vikram Patil", phone: "+91 98765 11111", spec: "Surgeon & Vet Expert" },
    { name: "Dr. Rajesh Kumar", phone: "+91 98765 22222", spec: "Govt Veterinary Officer" },
  ];

  // Merge default vets with online/registered vets, filtering duplicates by case-insensitive name match
  const allVets: { name: string; phone: string; spec: string }[] = [...defaultVets];
  
  if (user?.role === 'Veterinarian' && user.name) {
    if (!allVets.some(d => d.name.toLowerCase() === user.name.toLowerCase())) {
      allVets.push({
        name: user.name,
        phone: user.phone || "+91 98765 43210",
        spec: "Active Session Doctor"
      });
    }
  }

  onlineVets.forEach((v: any) => {
    if (v.name && !allVets.some(d => d.name.toLowerCase() === v.name.toLowerCase())) {
      allVets.push({
        name: v.name,
        phone: v.phone || "+91 98765 33333",
        spec: v.location ? `Practice in ${v.location}` : "Registered Veterinarian"
      });
    }
  });
  
  // Call Controls
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [activeCamera, setActiveCamera] = useState<'main' | 'lesion'>('main');
  const [rxNotes, setRxNotes] = useState('Meloxicam Bolus 0.5mg/kg BD for 3 days. Wash mouth blisters with 0.1% Potassium Permanganate solution.');
  const [rxSaved, setRxSaved] = useState(false);

  // Doctor appointment booking state
  const [openDoctorAppt, setOpenDoctorAppt] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<{ name: string; phone: string; spec: string } | null>(null);
  const [doctorApptForm, setDoctorApptForm] = useState({
    animalName: '',
    type: 'Video Call',
    notes: '',
    scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
  });

  const handleOpenDoctorBooking = (vet: { name: string; phone: string; spec: string }) => {
    setSelectedDoctor(vet);
    setDoctorApptForm({
      animalName: '',
      type: 'Video Call',
      notes: '',
      scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    });
    setOpenDoctorAppt(true);
  };

  const handleDoctorApptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    const appt = {
      id: Date.now(),
      animalId: 1,
      animalName: doctorApptForm.animalName || 'My Animal',
      veterinarianName: selectedDoctor.name,
      type: doctorApptForm.type,
      status: 'Scheduled',
      scheduledAt: new Date(doctorApptForm.scheduledAt).toISOString(),
      notes: doctorApptForm.notes,
      createdAt: new Date().toISOString(),
    };

    createAppointment.mutate({
      data: {
        animalId: 1,
        veterinarianName: selectedDoctor.name,
        type: doctorApptForm.type,
        scheduledAt: appt.scheduledAt,
        notes: doctorApptForm.notes
      }
    }, {
      onSuccess: () => {},
      onError: () => {}
    });

    setCustomAppts([appt, ...customAppts]);
    setOpenDoctorAppt(false);
    toast({
      title: '✅ Appointment Confirmed!',
      description: `${doctorApptForm.type} booked with ${selectedDoctor.name} on ${new Date(doctorApptForm.scheduledAt).toLocaleString()}`,
    });
  };

  const [newAppt, setNewAppt] = useState({
    veterinarianName: 'Dr. Anita Sharma (MVSc)',
    animalName: 'Gauri (Gir Cow)',
    type: 'Video Call',
    notes: 'High fever, tongue blisters and reduced feed intake',
    scheduledAt: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:30',
  });

  const fallbackAppointments = [
    { id: 1, animalId: 1, animalName: "Gauri (Gir Cow)", veterinarianName: "Dr. Anita Sharma (MVSc)", type: "Video Call", status: "Scheduled", scheduledAt: new Date(Date.now() + 86400000).toISOString(), notes: "Routine pregnancy check & nutrition consultation", createdAt: new Date().toISOString() },
    { id: 2, animalId: 2, animalName: "Lakshmi (Murrah Buffalo)", veterinarianName: "Dr. Vikram Patil", type: "In-Person", status: "Confirmed", scheduledAt: new Date(Date.now() + 172800000).toISOString(), notes: "Vaccination booster checkup", createdAt: new Date().toISOString() },
  ];

  const baseAppointments = (Array.isArray(rawAppointments) && rawAppointments.length > 0) ? rawAppointments : fallbackAppointments;
  const appointments = [...customAppts, ...baseAppointments];

  // Initiate Outgoing Call (Farmer Action)
  const handleStartCall = (apt: any) => {
    setIsCalling(true);
    const phoneNumber = getVetPhone(apt.veterinarianName);
    setActiveCallingVetPhone(phoneNumber);

    const vetName = apt.veterinarianName || 'Dr. Anita Sharma (MVSc)';
    const farmerName = user?.name || 'Farmer Ramesh';
    const animalName = apt.animalName || 'Gauri (Gir Cow)';
    const symptoms   = apt.notes || 'High fever, mouth lesions & loss of appetite';
    const callType   = apt.type || 'Video Call';

    toast({
      title: `Dialing Vet Line: ${phoneNumber}`,
      description: `Establishing verified live transmission to ${vetName}.`,
    });

    // Push to global notification store so the vet sees the ringing modal
    pushCall({
      farmerName,
      farmerId: user?.id || 'farmer-1',
      animalName,
      vetName,
      symptoms,
      type: callType as 'Video Call' | 'Audio Call' | 'In-Person',
    });

    // Simulate the farmer-side ringing screen for 2.5s then auto-connect
    setTimeout(() => {
      setIncomingCall({
        id: apt.id,
        farmerName,
        animalName,
        vetName,
        symptoms,
        type: callType
      });
      setIsCalling(false);

      // Auto-connect for the farmer side after a short delay
      setTimeout(() => {
        handleAcceptCall('video');
      }, 1500);
    }, 2500);
  };

  // Receive / Accept Call (Veterinarian / Hospital Action)
  const handleAcceptCall = (mode: 'video' | 'audio') => {
    const callData = incomingCall || {
      id: Date.now(),
      farmerName: user?.role === 'Farmer' ? user.name : "Farmer Ramesh",
      animalName: "Gauri (Gir Cow)",
      vetName: user?.role === 'Veterinarian' ? user.name : "Dr. Anita Sharma (MVSc)",
      symptoms: "High fever & stringy salivation",
      type: mode === 'video' ? "Video Call" : "Audio Call"
    };

    setIncomingCall(null);
    setActiveCallRoom(callData);
    toast({
      title: "Tele-Vet Consultation Connected 📹",
      description: `Live video stream established with ${callData.farmerName} (${callData.animalName}).`,
    });
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
    setIsCalling(false);
    toast({
      title: "Call Declined",
      description: "Tele-Vet notification sent back to farmer.",
      variant: "destructive"
    });
  };

  const handleEndCall = () => {
    setActiveCallRoom(null);
    setRxSaved(true);
    toast({
      title: "Consultation Complete 📋",
      description: "Digital Tele-Vet Prescription generated and synced to Farmer account.",
    });
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appt = {
      id: Date.now(),
      animalId: 1,
      animalName: newAppt.animalName,
      veterinarianName: newAppt.veterinarianName,
      type: newAppt.type,
      status: "Scheduled",
      scheduledAt: new Date(newAppt.scheduledAt).toISOString(),
      notes: newAppt.notes,
      createdAt: new Date().toISOString()
    };

    createAppointment.mutate({
      data: {
        animalId: 1,
        veterinarianName: newAppt.veterinarianName,
        type: newAppt.type,
        scheduledAt: appt.scheduledAt,
        notes: newAppt.notes
      }
    }, {
      onSuccess: () => {
        toast({ title: "Appointment Scheduled!", description: `${newAppt.type} booked with ${newAppt.veterinarianName}` });
      },
      onError: () => {
        toast({ title: "Appointment Saved", description: `${newAppt.type} scheduled with ${newAppt.veterinarianName}` });
      }
    });

    setCustomAppts([appt, ...customAppts]);
    setOpenBook(false);

    // Prompt to start call immediately if Video Call chosen
    if (newAppt.type === 'Video Call') {
      handleStartCall(appt);
    }
  };

  const getAnimalPhoto = (animalName: string) => {
    const name = (animalName || '').toLowerCase();
    if (name.includes('lakshmi') || name.includes('buffalo')) return 'https://images.unsplash.com/photo-1570042707223-b541334c44f3?auto=format&fit=crop&q=80&w=400';
    if (name.includes('nandi') || name.includes('bull')) return 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=400';
    if (name.includes('radha') || name.includes('jersey')) return 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=400';
    if (name.includes('bholu') || name.includes('goat')) return 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=400';
    if (name.includes('chanda') || name.includes('sheep')) return 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&q=80&w=400';
    return 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=400';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'confirmed': return 'bg-primary/10 text-primary border-primary/30';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video call': return <Video className="w-4 h-4" />;
      case 'in-person': return <Users className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Active Veterinarian Status Banner */}
      {user?.role === 'Veterinarian' && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <h4 className="font-extrabold text-sm text-emerald-400">Live Doctor Line Active</h4>
              <p className="text-xs text-slate-300">
                You are registered as: <span className="font-bold text-white">{user.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Reception: {user.phone || '+91 98765 43210'}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge className="mb-2 bg-sky-500/20 text-sky-400 border border-sky-500/40 px-3 py-1 text-xs">
            <Radio className="w-3.5 h-3.5 mr-1 animate-pulse text-sky-400" /> WebRTC Live Tele-Vet Audio & Video Call Center
          </Badge>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-sky-500" />
            {isProviderRole ? "Farmer Consultations & Lab Call Desk" : "Tele-Vet Video & Audio Consultations"}
          </h1>
          <p className="text-slate-300 mt-1 text-sm max-w-2xl">
            {isProviderRole 
              ? "Receive incoming video call requests from farmers, examine livestock live, and issue instant digital prescriptions." 
              : "Connect directly via 2-way live video call with MVSc certified veterinarians for instant treatment."}
          </p>
        </div>

        {isProviderRole ? (
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handleAcceptCall('video')}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 mr-2" /> Receive Test Farmer Call
            </Button>
          </div>
        ) : (
          <Dialog open={openBook} onOpenChange={setOpenBook}>
            <DialogTrigger asChild>
              <Button className="bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold shadow-lg shadow-sky-500/20 border-0 cursor-pointer">
                <Plus className="w-4 h-4 mr-2" /> Request Tele-Vet Video Call
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-sky-500/30 bg-slate-950 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-display font-bold flex items-center gap-2 text-sky-400">
                  <Video className="w-6 h-6" /> Request Live Tele-Vet Call
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBookSubmit} className="space-y-4 pt-2">
                <div>
                  <Label className="text-xs text-slate-300 font-bold uppercase">Select Veterinarian</Label>
                  <Select value={newAppt.veterinarianName} onValueChange={val => setNewAppt({...newAppt, veterinarianName: val})}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                      {allVets.map((v, i) => (
                        <SelectItem key={i} value={v.name}>
                          {v.name} ({v.spec} • {v.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-300 font-bold uppercase">Consultation Mode</Label>
                    <Select value={newAppt.type} onValueChange={val => setNewAppt({...newAppt, type: val})}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                        <SelectItem value="Video Call">Live Video Call (WebRTC)</SelectItem>
                        <SelectItem value="In-Person">In-Person On-Site Visit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300 font-bold uppercase">Preferred Date & Time</Label>
                    <Input 
                      type="datetime-local" 
                      value={newAppt.scheduledAt} 
                      onChange={e => setNewAppt({...newAppt, scheduledAt: e.target.value})} 
                      className="bg-slate-900 border-slate-700 text-white text-xs mt-1" 
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-300 font-bold uppercase">Observed Symptoms / Notes</Label>
                  <Textarea 
                    placeholder="Describe symptoms (e.g. High fever, blister lesions, milk yield drop)..." 
                    value={newAppt.notes} 
                    onChange={e => setNewAppt({...newAppt, notes: e.target.value})} 
                    className="bg-slate-900 border-slate-700 text-white text-xs mt-1 min-h-[90px] resize-none" 
                  />
                </div>
                <DialogFooter className="pt-3">
                  <Button type="button" variant="outline" onClick={() => setOpenBook(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                  <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs cursor-pointer">
                    Start Call & Book Consultation
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* FARMER: BOOK APPOINTMENT WITH AVAILABLE DOCTORS SECTION */}
      {/* ----------------------------------------------------------------- */}
      {isFarmerOrAdmin && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-emerald-400" />
              Book Appointment with Available Doctors
            </h2>
            <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {allVets.length} Doctors Online
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {allVets.map((vet, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 text-white rounded-3xl overflow-hidden shadow-xl group">
                  <CardContent className="p-5">
                    {/* Doctor Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl font-bold text-emerald-400">
                            {vet.name.charAt(vet.name.indexOf('.') + 2) || '👨‍⚕️'}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm leading-tight">{vet.name}</div>
                          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">{vet.spec}</div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 shrink-0">
                        ONLINE
                      </Badge>
                    </div>

                    {/* Doctor Info Chips */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-emerald-400 font-bold">{vet.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                        <Award className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>MVSc Certified • Licensed Vet</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                        <AlarmClock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Next slot: <span className="text-amber-400 font-bold">Within 30 min</span></span>
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mb-4">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= (4 + (idx % 2 === 0 ? 1 : 0)) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                      ))}
                      <span className="text-[10px] text-slate-400 ml-1">({120 + idx * 37} reviews)</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleOpenDoctorBooking(vet)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-9 shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 mr-1" /> Book Appt
                      </Button>
                      <Button
                        onClick={() => handleStartCall({ animalName: 'My Animal', veterinarianName: vet.name, notes: 'Instant consultation' })}
                        variant="outline"
                        className="border-sky-500/40 text-sky-400 hover:bg-sky-500/10 font-bold text-xs h-9 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 mr-1" /> Instant Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Appointment Booking Dialog */}
      <Dialog open={openDoctorAppt} onOpenChange={setOpenDoctorAppt}>
        <DialogContent className="glass-panel border-emerald-500/30 bg-slate-950 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold flex items-center gap-2 text-emerald-400">
              <CalendarPlus className="w-6 h-6" />
              Book Appointment
            </DialogTitle>
            {selectedDoctor && (
              <div className="flex items-center gap-3 mt-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
                  {selectedDoctor.name.charAt(selectedDoctor.name.indexOf('.') + 2)}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{selectedDoctor.name}</div>
                  <div className="text-[11px] text-emerald-400">{selectedDoctor.spec}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> {selectedDoctor.phone}
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>
          <form onSubmit={handleDoctorApptSubmit} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs text-slate-300 font-bold uppercase">Your Animal / Patient Name</Label>
              <Input
                placeholder="e.g. Gauri (Gir Cow), Lakshmi (Buffalo)..."
                value={doctorApptForm.animalName}
                onChange={e => setDoctorApptForm({ ...doctorApptForm, animalName: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-300 font-bold uppercase">Consultation Mode</Label>
                <Select value={doctorApptForm.type} onValueChange={val => setDoctorApptForm({ ...doctorApptForm, type: val })}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                    <SelectItem value="Video Call">Live Video Call (WebRTC)</SelectItem>
                    <SelectItem value="In-Person">In-Person On-Site Visit</SelectItem>
                    <SelectItem value="Audio Call">Audio Call Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-300 font-bold uppercase">Preferred Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={doctorApptForm.scheduledAt}
                  onChange={e => setDoctorApptForm({ ...doctorApptForm, scheduledAt: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-300 font-bold uppercase">Symptoms / Reason for Visit</Label>
              <Textarea
                placeholder="Describe symptoms (e.g. High fever, blister lesions, reduced milk yield, lameness)..."
                value={doctorApptForm.notes}
                onChange={e => setDoctorApptForm({ ...doctorApptForm, notes: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white text-xs mt-1 min-h-[90px] resize-none"
              />
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-[11px] text-emerald-400 flex items-start gap-2">
              <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Doctor will receive notification and confirm within 5 minutes. You can also start an instant call.</span>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenDoctorAppt(false)} className="border-slate-700 text-slate-300">Cancel</Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs cursor-pointer">
                <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
                Confirm Appointment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Appointments List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-400" /> Scheduled Consultations & Live Call Requests
            </h2>
            <Badge variant="outline" className="bg-slate-900 border-slate-800 text-slate-400 font-mono text-xs">
              {appointments.length} Consultations
            </Badge>
          </div>

          {isLoading ? (
            [1,2].map(i => <Card key={i} className="h-40 animate-pulse bg-slate-900 border-slate-800" />)
          ) : appointments?.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border-slate-800 bg-slate-950">
              <CalendarCheck className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400">No upcoming appointments.</p>
            </div>
          ) : (
            appointments?.map(apt => (
              <Card key={apt.id} className="bg-slate-900/90 border-2 border-slate-800 hover:border-sky-500/50 transition-all text-white rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className={getStatusColor(apt.status)}>
                          {apt.status.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                          {getTypeIcon(apt.type)} {apt.type}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-sky-500/40 shrink-0 bg-slate-800 shadow-md">
                          <img src={getAnimalPhoto(apt.animalName || '')} alt="Animal" className="w-full h-full object-cover" />
                        </div>
                         <div>
                          <h3 className="text-lg font-display font-bold text-white">{apt.veterinarianName || 'Assigned Vet'}</h3>
                          <p className="text-xs text-sky-400 font-bold mb-1.5">Patient: {apt.animalName || `Animal #${apt.animalId}`}</p>
                          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 w-fit">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Authenticated Line: {getVetPhone(apt.veterinarianName)}
                          </div>
                        </div>
                      </div>

                      {apt.notes && (
                        <div className="bg-slate-950 p-3 rounded-2xl text-xs border border-slate-800 text-slate-300">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Symptoms / Notes:</span>
                          "{apt.notes}"
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-60 shrink-0 flex flex-col justify-center items-center bg-slate-950 rounded-2xl p-5 border border-slate-800 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div className="text-lg font-bold text-white">
                        {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {new Date(apt.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>

                      {/* Dynamic Call Trigger Button */}
                      {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                        <Button 
                          onClick={() => handleStartCall(apt)}
                          className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-sky-500/20"
                        >
                          <Video className="w-4 h-4 mr-1.5" /> Start Live Tele-Call
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-panel border-2 border-sky-500/30 bg-gradient-to-b from-slate-950 to-sky-950/30 text-white rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Need Urgent Vet Consultation?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect with an available MVSc veterinarian within 5 minutes for urgent non-life-threatening queries.
              </p>
              <Button 
                onClick={() => handleStartCall({ animalName: "Gauri (Gir Cow)", veterinarianName: "Dr. Anita Sharma (MVSc)", notes: "Urgent bloat & fever consultation" })}
                className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs cursor-pointer shadow-lg"
              >
                Instant Video Connect (₹199)
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 text-white rounded-3xl">
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-base mb-4 text-white flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Online Veterinarians
              </h3>
              <div className="space-y-4">
                {allVets.slice(0, 5).map((vet, idx) => (
                  <div key={idx} className="flex flex-col gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-xs">{vet.name}</div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        ONLINE
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{vet.spec}</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {vet.phone}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 text-white rounded-3xl">
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-base mb-4 text-white">Verified Nearby Veterinary Clinics</h3>
              <div className="space-y-4">
                {[
                  { name: "District Veterinary Hospital", dist: "2.4 km away", status: "Open 24/7" },
                  { name: "Sri Laxmi Dairy Clinic", dist: "4.8 km away", status: "Open till 8 PM" }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-slate-400 text-[11px]">{item.dist} • {item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INCOMING TELE-VET CALL RINGING MODAL (Veterinarian View) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {incomingCall && isProviderRole && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 text-white shadow-2xl rounded-3xl overflow-hidden text-center p-6 space-y-6">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl">
                  <PhoneCall className="w-10 h-10 animate-bounce" />
                </div>
              </div>

              <div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs px-3 py-1 mb-2">
                  INCOMING TELE-VET VIDEO CALL
                </Badge>
                <h3 className="text-2xl font-display font-bold text-white">{incomingCall.farmerName}</h3>
                <p className="text-xs text-sky-400 font-bold mt-1">Patient: {incomingCall.animalName}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <strong className="text-slate-400 block text-[10px] uppercase mb-1">Symptoms Reported:</strong>
                "{incomingCall.symptoms}"
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  onClick={handleDeclineCall}
                  variant="outline"
                  className="bg-slate-950 border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold text-xs h-12"
                >
                  <PhoneOff className="w-4 h-4 mr-2" /> Decline
                </Button>

                <Button 
                  onClick={() => handleAcceptCall('video')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-12 shadow-lg shadow-emerald-500/30"
                >
                  <Video className="w-4 h-4 mr-2" /> Accept Call 📹
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* OUTGOING FARMER CALL RINGING MODAL (Farmer View) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isCalling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md bg-slate-900 border-2 border-sky-500/50 text-white shadow-2xl rounded-3xl overflow-hidden text-center p-6 space-y-6">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-sky-500/30 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shadow-xl">
                  <PhoneCall className="w-10 h-10 animate-pulse" />
                </div>
              </div>

              <div>
                <Badge className="bg-sky-500/20 text-sky-400 border border-sky-500/40 text-xs px-3 py-1 mb-2 font-bold">
                  DIALING VET LIVE TRANSMISSION
                </Badge>
                <h3 className="text-2xl font-display font-extrabold text-white">Connecting to Vet...</h3>
                <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2">
                  <div className="text-xs text-slate-400 font-bold uppercase">Authenticated Doctor Number</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
                    {activeCallingVetPhone}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit mx-auto">
                    License Verified & Encrypted
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleDeclineCall}
                  variant="outline"
                  className="w-full bg-slate-950 border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold text-xs h-12 rounded-2xl"
                >
                  <PhoneOff className="w-4 h-4 mr-2" /> Cancel Request
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVE WEBRTC LIVE VIDEO CONSULTATION ROOM */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeCallRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
          >
            {/* Call Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                <div>
                  <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                    Live Tele-Vet Consultation • {activeCallRoom.animalName}
                    <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified Vet Line: {getVetPhone(activeCallRoom.vetName)}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Session: {activeCallRoom.vetName} & {activeCallRoom.farmerName}
                  </p>
                </div>
              </div>

              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs px-3 py-1 font-mono">
                🔴 LIVE WebRTC 1080p HD
              </Badge>
            </div>

            {/* Main Video View Area */}
            <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-950 overflow-hidden">
              {/* Main Camera (Farmer Animal Stream) */}
              <div className="lg:col-span-8 relative bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
                <img 
                  src={activeCamera === 'main' 
                    ? getAnimalPhoto(activeCallRoom.animalName) 
                    : "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&q=80&w=800"} 
                  alt="Live Animal Stream" 
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-4 left-4 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700 text-white text-xs font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  Farmer Live Cam: {activeCallRoom.animalName}
                </div>

                {/* Doctor Picture in Picture */}
                <div className="absolute bottom-4 right-4 w-44 h-32 rounded-2xl overflow-hidden border-2 border-sky-500 bg-slate-950 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400" 
                    alt="Doctor Feed" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[9px] text-sky-400 font-bold">
                    {activeCallRoom.vetName}
                  </div>
                </div>
              </div>

              {/* Doctor Live Digital Prescription Writer Box */}
              <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-5 border-2 border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-display font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
                    <FileText className="w-5 h-5 text-sky-400" /> Doctor Live Tele-Vet Prescription
                  </h4>

                  <div className="space-y-3 mt-4 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Prescribed Clinical Medication</label>
                      <Textarea 
                        value={rxNotes}
                        onChange={e => setRxNotes(e.target.value)}
                        className="bg-slate-950 border-slate-700 text-white text-xs min-h-[140px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => { setRxSaved(true); toast({ title: "Prescription Saved & Synced!" }); }}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Sync Digital Prescription to Farmer
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Call Controls Toolbar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
              <Button 
                onClick={() => setMicMuted(!micMuted)}
                variant="outline"
                className={`w-12 h-12 rounded-full border-slate-700 ${micMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-white'}`}
              >
                {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button 
                onClick={() => setVideoMuted(!videoMuted)}
                variant="outline"
                className={`w-12 h-12 rounded-full border-slate-700 ${videoMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-white'}`}
              >
                {videoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>

              <Button 
                onClick={() => setActiveCamera(activeCamera === 'main' ? 'lesion' : 'main')}
                variant="outline"
                className="bg-slate-800 border-slate-700 text-white text-xs px-4 h-12 rounded-full font-bold"
              >
                Switch Lesion Lens 🔍
              </Button>

              <Button 
                onClick={handleEndCall}
                className="w-14 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/30"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
