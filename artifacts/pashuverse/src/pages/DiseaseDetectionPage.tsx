import React, { useState, useRef } from 'react';
import { useListDiseasePredictions, useCreateDiseasePrediction, useListAnimals, getListDiseasePredictionsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  BrainCircuit, 
  AlertTriangle, 
  ScanSearch, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  UploadCloud, 
  Mic, 
  Trash2, 
  Sparkles, 
  MapPin, 
  Activity, 
  FileText, 
  Phone, 
  Image as ImageIcon,
  Volume2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface DiseaseDetail {
  cause: string;
  precautions: string;
  resultDetails: string;
}

const DISEASE_DETAILS_MAP: Record<string, DiseaseDetail> = {
  "Bovine Respiratory Disease": {
    cause: "Bacterial or viral pathogens (Pasteurella multocida, Bovine Herpesvirus-1) combined with shipping, cold drafts, or environmental stress.",
    precautions: "Provide windbreaks/shelter, avoid overcrowding in pens, quarantine new cattle, and maintain yearly respiratory vaccine doses.",
    resultDetails: "AI scan shows high likelihood of upper respiratory inflammation and temperature spikes. Prompt isolation and antibiotic therapy is advised to prevent pneumonia."
  },
  "Foot and Mouth Disease": {
    cause: "Highly contagious Aphthovirus (FMD virus), spreading rapidly via aerosol droplets, direct contact, or contaminated feed/water.",
    precautions: "Enforce strict biosecurity quarantine. Limit human traffic, wash vehicles, and isolate the cow from the rest of the herd.",
    resultDetails: "AI image scanning detected characteristic lesions/vesicles near hooves and muzzle. This is a critical state; report immediately to local veterinary authorities."
  },
  "Bovine Viral Diarrhea": {
    cause: "Bovine Viral Diarrhea Virus (BVDV), spreading horizontally through contact with secretions, or vertically from mother to fetus.",
    precautions: "Test all new stock to identify and remove persistently infected (PI) carriers, and vaccinate replacement heifers before breeding.",
    resultDetails: "AI diagnostic models indicate gastrointestinal infection with mucosal damage. Active oral fluid replenishment is needed to manage dehydration."
  },
  "Rumen Bloat": {
    cause: "Accumulation of stable gas foam in the rumen from high-legume pasture grazing (clover, alfalfa) or feeding of fine-ground grains.",
    precautions: "Feed dry roughage/hay before turning cattle onto lush pastures, limit morning grazing, and include anti-foaming agents in feed.",
    resultDetails: "AI physical metrics analysis shows severe left-flank distension. Requires immediate gas release (stomach tube or anti-bloat surfactant)."
  },
  "General Infection": {
    cause: "Non-specific bacterial or environmental pathogen exposure causing a mild febrile response or localized inflammation.",
    precautions: "Keep barn flooring dry and clean, disinfect fresh cuts promptly, clean feed troughs regularly, and ensure general biosecurity practices.",
    resultDetails: "AI scan indicates low-grade inflammation. Recommend general isolation, comfortable bedding, and monitoring vitals for 24-48 hours."
  }
};

function getDiseaseDetails(diseaseName: string | null | undefined): DiseaseDetail {
  if (!diseaseName) {
    return {
      cause: "Undetermined pathogen exposure or minor injury.",
      precautions: "Monitor behavior and feed intake closely, and ensure the animal is housed in a clean, stress-free environment.",
      resultDetails: "No specific AI pattern matched. Recommended monitoring or general checkup by a local veterinarian."
    };
  }
  return DISEASE_DETAILS_MAP[diseaseName] || {
    cause: "Non-specific pathogen or environmental stress.",
    precautions: "Maintain clean dry surroundings, check body temperature, and consult a vet.",
    resultDetails: "General diagnostic alert. Supportive care and monitoring is advised."
  };
}

export default function DiseaseDetectionPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: predictions, isLoading } = useListDiseasePredictions();
  const { data: animals } = useListAnimals();
  const createPrediction = useCreateDiseasePrediction();

  const fallbackAnimals = [
    { id: 1, name: "Gauri", species: "Cow", breed: "Gir Indigenous", tagNumber: "IN-2026-001" },
    { id: 2, name: "Lakshmi", species: "Buffalo", breed: "Murrah Dairy", tagNumber: "IN-2026-002" },
    { id: 3, name: "Nandi", species: "Bull", breed: "Sahiwal Bull", tagNumber: "IN-2026-003" },
    { id: 4, name: "Radha", species: "Cow", breed: "Jersey Cross", tagNumber: "IN-2026-004" },
    { id: 5, name: "Bholu", species: "Goat", breed: "Osmanabadi", tagNumber: "IN-2026-005" },
    { id: 6, name: "Chanda", species: "Sheep", breed: "Deccani Wool", tagNumber: "IN-2026-006" },
  ];

  const activeAnimals = (Array.isArray(animals) && animals.length > 0) ? animals : fallbackAnimals;

  const [animalId, setAnimalId] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        
        // Auto-suggest symptoms based on image filename/type for dynamic UX flow
        const name = file.name.toLowerCase();
        if (name.includes("foot") || name.includes("mouth") || name.includes("hoof") || name.includes("lesion")) {
          setSymptoms("Observation from image upload: Blister-like lesions around hooves and snout, animal is refusing to walk.");
        } else if (name.includes("bloat") || name.includes("stomach") || name.includes("belly")) {
          setSymptoms("Observation from image upload: Severe abdominal distension on left side, animal appears in pain.");
        } else {
          setSymptoms("Observation from image scan: Evident skin nodules and dry lesions around neck region, minor hair loss.");
        }
      };
      reader.readAsDataURL(file);
      toast({
        title: "Image Uploaded",
        description: `Selected: ${file.name}`,
      });
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId || !symptoms) return;

    setIsAnalyzing(true);
    
    // Simulate AI processing time with scanning beam effect
    setTimeout(() => {
      createPrediction.mutate({
        data: {
          animalId: parseInt(animalId),
          symptoms: symptoms,
          imageUrl: uploadedImage ?? undefined
        }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDiseasePredictionsQueryKey() });
          setIsAnalyzing(false);
          setSymptoms('');
          setAnimalId('');
          setUploadedImage(null);
          setFileName('');
          toast({
            title: "Analysis Complete",
            description: "The AI has finished diagnosing the symptoms & image.",
          });
        },
        onError: () => {
          setIsAnalyzing(false);
          toast({
            title: "Analysis Failed",
            description: "An error occurred during AI processing.",
            variant: "destructive"
          });
        }
      });
    }, 3000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto relative overflow-visible">
      {/* Ambient background glow spots */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-64 right-12 w-80 h-80 bg-sky-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
            <span className="p-2 bg-primary/10 border border-primary/20 rounded-2xl">
              <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
            </span>
            AI Disease & Image Diagnosis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl font-bold">
            Futuristic health scanner powered by the <span className="text-primary font-extrabold">Gemini Health Engine</span>. Upload a symptom photo or describe physical indicators for a predictive veterinary report in real-time.
          </p>
        </div>
        <Badge className="w-fit bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-extrabold rounded-full shadow-sm shadow-emerald-500/5">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Gemini Health Engine Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form Column */}
        <Card className="lg:col-span-1 glass-panel border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl h-fit sticky top-24 shadow-2xl hover:border-primary/30 transition-all duration-300 rounded-3xl">
          <CardHeader className="border-b border-slate-200 dark:border-white/5 pb-4">
            <CardTitle className="font-display flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-lg">
              <ScanSearch className="w-5 h-5 text-primary animate-pulse" /> Intelligent Scan
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-extrabold">Select a diagnostics input method below</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Animal Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">Select Animal</label>
                <Select value={animalId} onValueChange={setAnimalId} disabled={isAnalyzing}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-white/10 hover:border-primary/40 focus:ring-1 focus:ring-primary/30 h-11 rounded-xl text-slate-900 dark:text-white font-extrabold">
                    <SelectValue placeholder="Choose an animal" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 font-extrabold">
                    {activeAnimals.map(a => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.name} ({a.tagNumber || a.species})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode Select Buttons */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  disabled={isAnalyzing}
                  className={`py-2.5 px-2 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
                    inputMode === 'text' 
                      ? 'bg-primary text-slate-950 shadow-md shadow-primary/20' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  ✍️ Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('image')}
                  disabled={isAnalyzing}
                  className={`py-2.5 px-2 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
                    inputMode === 'image' 
                      ? 'bg-primary text-slate-950 shadow-md shadow-primary/20' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  📸 Image Scan
                </button>
              </div>

              {/* Input Mode Content */}
              <AnimatePresence mode="wait">
                {inputMode === 'text' && (
                  <motion.div
                    key="text-mode"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">Describe Symptoms</label>
                    <Textarea 
                      placeholder="e.g. High fever for 2 days, lameness, coughing, skin nodules..."
                      className="min-h-[140px] bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-2xl resize-none text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 leading-relaxed font-extrabold"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      disabled={isAnalyzing}
                      required
                    />
                  </motion.div>
                )}

                {inputMode === 'image' && (
                  <motion.div
                    key="image-mode"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">Upload Image / Video</label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*,video/*" 
                      className="hidden" 
                      disabled={isAnalyzing}
                    />
                    
                    {!uploadedImage ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-primary/50 bg-slate-50 dark:bg-slate-950/40 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-900/40 group shadow-inner relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl rounded-full scale-75" />
                        <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-all duration-300 mb-3 group-hover:scale-110" />
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white">Drag & drop or browse media</span>
                        <span className="text-[10px] text-slate-500 mt-1 font-extrabold">Supports PNG, JPG, MP4</span>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-slate-950 aspect-video flex items-center justify-center group shadow-2xl">
                        <img src={uploadedImage} alt="Uploaded livestock preview" className="w-full h-full object-cover" />
                        
                        {/* Scanning beam animation */}
                        {isAnalyzing && (
                          <motion.div 
                            className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#10B981] z-10"
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}

                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            onClick={clearImage}
                            disabled={isAnalyzing}
                            className="rounded-full h-10 w-10 cursor-pointer shadow-lg hover:scale-105 transition-transform"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Badge className="absolute bottom-3 left-3 bg-slate-900/90 dark:bg-slate-950/90 border border-slate-200 dark:border-white/10 text-[9px] font-mono py-1 px-2 text-slate-200 dark:text-slate-300 rounded-lg font-bold">
                          {fileName.substring(0, 15)}...
                        </Badge>
                      </div>
                    )}

                    {uploadedImage && (
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">Generated Symptoms Context</label>
                        <Textarea 
                          className="min-h-[70px] text-xs bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 resize-none text-slate-900 dark:text-slate-300 font-bold"
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          disabled={isAnalyzing}
                          required
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isAnalyzing || !animalId || !symptoms}
                className={`w-full h-12 text-sm font-bold relative overflow-hidden rounded-2xl group cursor-pointer transition-all duration-300 ${
                  isAnalyzing || !animalId || !symptoms
                    ? 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:scale-[1.01] active:scale-[0.99] font-display'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <ScanSearch className="w-5 h-5 animate-pulse" />
                      Scanning & Analyzing ...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <BrainCircuit className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Run AI Diagnosis
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {isAnalyzing && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-[200%]"
                    animate={{ top: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Diagnosis History & Results Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <Activity className="w-5 h-5 text-primary" /> Diagnosis History & Reports
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-card rounded-xl animate-pulse border border-white/5" />)}
            </div>
          ) : predictions?.length === 0 ? (
            <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center bg-white/30 dark:bg-slate-950/40">
              <ScanSearch className="w-14 h-14 text-slate-400 dark:text-muted-foreground/30 mb-4" />
              <p className="text-slate-700 dark:text-slate-400 font-extrabold">No diagnosis reports found.</p>
              <p className="text-slate-500 dark:text-slate-600 text-xs mt-1 font-bold">Initiate a symptom scan to generate reports.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {predictions?.slice().reverse().map((pred, i) => (
                  <motion.div
                    key={pred.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="glass-panel hover:bg-slate-50/60 dark:hover:bg-slate-950/20 hover:-translate-y-1 hover:border-primary/25 transition-all duration-300 border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl rounded-3xl bg-white/40 dark:bg-slate-950/40">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          
                          {/* Image preview thumbnail if uploaded during diagnosis */}
                          {pred.imageUrl && (
                            <div className="w-full md:w-36 h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative shadow-lg">
                              <img src={pred.imageUrl} alt="Scanned diagnosis" className="w-full h-full object-cover" />
                              <div className="absolute top-2 right-2 bg-primary/95 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                                Media Scan
                              </div>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 dark:text-white text-base">{pred.animalName || `Animal #${pred.animalId}`}</span>
                                <span className="text-slate-500 text-xs font-mono font-bold">• {new Date(pred.createdAt).toLocaleDateString()}</span>
                              </div>
                              {pred.severity && (
                                <Badge variant="outline" className={`text-[10px] font-extrabold px-2 py-0.5 border ${getSeverityColor(pred.severity)}`}>
                                  {pred.severity.toUpperCase()} SEVERITY
                                </Badge>
                              )}
                            </div>
                            
                            <h3 className="text-xl font-display font-extrabold text-slate-950 dark:text-white mb-3 flex items-center gap-2">
                              {pred.predictedDisease || "Undiagnosed Condition"}
                            </h3>
                            
                            <div className="space-y-1.5 mb-4">
                              <div className="flex justify-between text-sm font-extrabold">
                                <span className="text-slate-800 dark:text-slate-200">AI Confidence Score</span>
                                <span className="text-primary font-extrabold">{Math.round((pred.confidence || 0) * 100)}%</span>
                              </div>
                              <Progress value={Math.round((pred.confidence || 0) * 100)} className="h-2" />
                            </div>

                            <div className="bg-slate-100/60 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-200/60 dark:border-white/5 border-l-4 border-l-slate-400 dark:border-l-slate-500 mb-3 leading-relaxed shadow-sm">
                              <span className="text-slate-800 dark:text-slate-300 font-extrabold text-sm block mb-1">Reported Symptoms:</span>
                              <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">{pred.symptoms}</p>
                            </div>

                            {(() => {
                              const details = getDiseaseDetails(pred.predictedDisease);
                              return (
                                <>
                                  <div className="bg-rose-500/5 dark:bg-rose-500/[0.04] rounded-2xl p-4 border border-rose-500/10 border-l-4 border-l-rose-500 mb-3 leading-relaxed shadow-sm">
                                    <span className="text-rose-700 dark:text-rose-300 font-extrabold text-sm block mb-1">Root Cause (ಮೂಲ ಕಾರಣ):</span>
                                    <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">{details.cause}</p>
                                  </div>

                                  <div className="bg-amber-500/5 dark:bg-amber-500/[0.04] rounded-2xl p-4 border border-amber-500/10 border-l-4 border-l-amber-500 mb-3 leading-relaxed shadow-sm">
                                    <span className="text-amber-700 dark:text-amber-300 font-extrabold text-sm block mb-1">Medical Precautions (ರಕ್ಷಣೆ ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆ):</span>
                                    <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">{details.precautions}</p>
                                  </div>

                                  <div className="bg-sky-500/5 dark:bg-sky-500/[0.04] rounded-2xl p-4 border border-sky-500/10 border-l-4 border-l-sky-500 mb-3 leading-relaxed shadow-sm">
                                    <span className="text-sky-700 dark:text-sky-300 font-extrabold text-sm block mb-1">AI Diagnosis Result (AI ತಪಾಸಣೆ ಫಲಿತಾಂಶ):</span>
                                    <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">{details.resultDetails}</p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          <div className="w-full md:w-64 bg-slate-100/40 dark:bg-slate-950/60 rounded-3xl p-5 border border-slate-200 dark:border-white/10 flex flex-col justify-between shrink-0 shadow-lg relative overflow-hidden group/therapy">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/therapy:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="space-y-2.5 z-10 relative">
                              <div className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-primary animate-pulse" /> Recommended Therapy
                              </div>
                              <p className="text-sm text-slate-900 dark:text-slate-100 font-bold leading-relaxed">
                                {pred.recommendedTreatment || "Monitor animal condition closely and schedule professional consultation."}
                              </p>
                            </div>
                            
                            {/* Nearby Vet Info */}
                            <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4 space-y-2.5 z-10 relative">
                              <div className="text-xs text-slate-800 dark:text-slate-300 font-extrabold flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-rose-500" /> Nearest Vet Care:
                              </div>
                              <div className="text-sm text-slate-900 dark:text-slate-200 flex items-center justify-between font-bold">
                                <span className="font-extrabold text-slate-900 dark:text-white">Dr. Rajesh Kumar</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-extrabold">2.3 km</span>
                              </div>
                            </div>

                            <Button 
                              variant="outline" 
                              className="w-full mt-4 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:bg-primary dark:hover:bg-primary hover:text-slate-950 dark:hover:text-slate-950 text-xs font-extrabold flex items-center justify-center cursor-pointer gap-1.5 shadow-md rounded-xl transition-all duration-200 z-10 relative hover:scale-105 active:scale-95"
                              onClick={() => {
                                toast({
                                  title: "Appointment Booking Initiated",
                                  description: "Redirecting to Tele-Veterinary booking panel...",
                                });
                              }}
                            >
                              <Phone className="w-3.5 h-3.5" /> Contact Vet
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
