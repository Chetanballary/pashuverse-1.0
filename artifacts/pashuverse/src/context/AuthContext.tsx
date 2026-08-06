import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'Farmer' | 'Veterinarian' | 'Laboratory' | 'Animal Hospital' | 'Government & NGO' | 'Insurance Provider' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export const DEMO_USERS: Record<UserRole, User> = {
  'Farmer': { id: "u-farmer", name: "Rajesh Kumar", email: "rajesh@pashuverse.org", role: "Farmer" },
  'Veterinarian': { id: "u-vet", name: "Dr. Anita Sharma (MVSc)", email: "anita.vet@pashuverse.org", role: "Veterinarian", phone: "+91 98765 43210" },
  'Laboratory': { id: "u-lab", name: "Apex Vet Diagnostics Lab", email: "lab@pashuverse.org", role: "Laboratory" },
  'Animal Hospital': { id: "u-hospital", name: "Apollo Veterinary Hospital", email: "hospital@pashuverse.org", role: "Animal Hospital" },
  'Government & NGO': { id: "u-gov-ngo", name: "Dr. Vikram Patil (Govt & NGO Officer)", email: "gov.ngo@pashuverse.org", role: "Government & NGO" },
  'Insurance Provider': { id: "u-insurance", name: "National Livestock Insurance Corp", email: "insurance@pashuverse.org", role: "Insurance Provider" },
  'Admin': { id: "u-admin", name: "System Master Admin", email: "admin@pashuverse.in", role: "Admin" },
};

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  loginByRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('pashuverse_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
    return DEMO_USERS['Farmer'];
  });

  const login = (newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem('pashuverse_user', JSON.stringify(newUser));
      // Save user input directly into Supabase PostgreSQL database via API
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(err => console.warn('Supabase auth sync warning:', err));
    } catch (e) {
      console.error(e);
    }
  };

  const loginByRole = (role: UserRole) => {
    const preset = DEMO_USERS[role] || DEMO_USERS['Farmer'];
    login(preset);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('pashuverse_user');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginByRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
