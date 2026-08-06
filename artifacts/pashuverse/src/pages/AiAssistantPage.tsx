import React from 'react';
import LaxmiVoiceAssistant from '@/components/LaxmiVoiceAssistant';
import { Sparkles } from 'lucide-react';

export default function AiAssistantPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          SAATHI AI Voice Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          Interact with Laxmi, your multi-lingual voice & chat AI. Speak or type in Kannada, Hindi, or English to receive diagnostic reports, medical directions, or general farming guidance.
        </p>
      </div>

      <div className="w-full">
        <LaxmiVoiceAssistant mode="page" />
      </div>
    </div>
  );
}
