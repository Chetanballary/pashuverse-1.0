import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface IncomingCallPayload {
  id: string;
  farmerName: string;
  farmerId: string;
  animalName: string;
  vetName: string;          // which vet was called
  symptoms: string;
  type: 'Video Call' | 'Audio Call' | 'In-Person';
  calledAt: string;         // ISO timestamp
  status: 'ringing' | 'accepted' | 'declined' | 'missed';
}

const STORAGE_KEY = 'pashuverse_incoming_calls';

function readStore(): IncomingCallPayload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(calls: IncomingCallPayload[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
  } catch {
    /* ignore */
  }
}

interface CallNotificationContextType {
  pendingCalls: IncomingCallPayload[];
  pushCall: (call: Omit<IncomingCallPayload, 'id' | 'calledAt' | 'status'>) => void;
  acceptCall: (id: string) => void;
  declineCall: (id: string) => void;
  dismissCall: (id: string) => void;
}

const CallNotificationContext = createContext<CallNotificationContextType | undefined>(undefined);

export function CallNotificationProvider({ children }: { children: ReactNode }) {
  const [pendingCalls, setPendingCalls] = useState<IncomingCallPayload[]>(() =>
    readStore().filter(c => c.status === 'ringing')
  );

  // Poll localStorage every 1.5 s so role-switch (same tab) picks up new calls
  useEffect(() => {
    const interval = setInterval(() => {
      const calls = readStore().filter(c => c.status === 'ringing');
      setPendingCalls(prev => {
        const prevIds = prev.map(c => c.id).join(',');
        const newIds  = calls.map(c => c.id).join(',');
        return prevIds === newIds ? prev : calls;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Also listen to storage events (cross-tab support)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const calls = readStore().filter(c => c.status === 'ringing');
        setPendingCalls(calls);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const pushCall = useCallback((payload: Omit<IncomingCallPayload, 'id' | 'calledAt' | 'status'>) => {
    const newCall: IncomingCallPayload = {
      ...payload,
      id: `call-${Date.now()}`,
      calledAt: new Date().toISOString(),
      status: 'ringing',
    };
    const existing = readStore();
    // Remove any old ringing call to the same vet to avoid stacking
    const filtered = existing.filter(c => !(c.vetName === newCall.vetName && c.status === 'ringing'));
    const updated = [newCall, ...filtered];
    writeStore(updated);
    setPendingCalls(updated.filter(c => c.status === 'ringing'));
  }, []);

  const updateStatus = useCallback((id: string, status: IncomingCallPayload['status']) => {
    const existing = readStore();
    const updated = existing.map(c => c.id === id ? { ...c, status } : c);
    writeStore(updated);
    setPendingCalls(updated.filter(c => c.status === 'ringing'));
  }, []);

  const acceptCall  = useCallback((id: string) => updateStatus(id, 'accepted'),  [updateStatus]);
  const declineCall = useCallback((id: string) => updateStatus(id, 'declined'), [updateStatus]);
  const dismissCall = useCallback((id: string) => updateStatus(id, 'missed'),   [updateStatus]);

  return (
    <CallNotificationContext.Provider value={{ pendingCalls, pushCall, acceptCall, declineCall, dismissCall }}>
      {children}
    </CallNotificationContext.Provider>
  );
}

export function useCallNotification() {
  const ctx = useContext(CallNotificationContext);
  if (!ctx) throw new Error('useCallNotification must be used within CallNotificationProvider');
  return ctx;
}
