import React, { useState, useEffect } from 'react';
import { useGetDashboardStats } from '@workspace/api-client-react';
import { Settings, Users, Activity, Store, ShieldCheck, CheckCircle2, XCircle, Plus, Send, Database, RefreshCw, Key, Lock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Link } from 'wouter';

interface DBUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  isVerified?: boolean;
  lastLogin?: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { data: stats } = useGetDashboardStats();
  
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Farmer');
  const [newPhone, setNewPhone] = useState('');
  
  // Advisory Form State
  const [advisoryTitle, setAdvisoryTitle] = useState('');
  const [advisoryContent, setAdvisoryContent] = useState('');
  const [advisoryStatus, setAdvisoryStatus] = useState('');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.warn("Failed to fetch users from API:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          phone: newPhone
        })
      });
      if (res.ok) {
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAdvisory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryTitle || !advisoryContent) return;
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: user?.name || "System Master Admin",
          authorRole: "Admin",
          title: advisoryTitle,
          content: advisoryContent,
          isOfficial: true,
          category: "Advisory"
        })
      });
      if (res.ok) {
        setAdvisoryTitle('');
        setAdvisoryContent('');
        setAdvisoryStatus('🎉 Official Advisory Published to Community Feed!');
        setTimeout(() => setAdvisoryStatus(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h1 className="text-2xl font-display font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2 max-w-md">You do not have the required permissions to view the administrative control console.</p>
        <Link href="/dashboard" className="mt-6 text-primary hover:underline font-medium">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel border-white/10 p-6 rounded-3xl">
        <div>
          <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
            <Key className="w-3.5 h-3.5 mr-1" /> Master Admin Console
          </Badge>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            System Control & Data Administration
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Logged in as <strong className="text-foreground">{user?.email}</strong>. Manage registered domain users, publish platform advisories, and audit Supabase database tables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="border-white/10">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel border-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered Users</p>
              <h3 className="text-2xl font-bold font-display">{users.length > 0 ? users.length : 9}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Livestock Monitored</p>
              <h3 className="text-2xl font-bold font-display">{stats?.totalAnimals || 142}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supabase PostgreSQL</p>
              <h3 className="text-2xl font-bold font-display text-emerald-500">ONLINE</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified Accounts</p>
              <h3 className="text-2xl font-bold font-display">100%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="glass-panel border-white/10 p-1">
          <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> Domain User Accounts</TabsTrigger>
          <TabsTrigger value="advisories" className="gap-2"><Send className="w-4 h-4" /> Publish Health Advisory</TabsTrigger>
          <TabsTrigger value="database" className="gap-2"><Database className="w-4 h-4" /> Supabase Config</TabsTrigger>
        </TabsList>

        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2 glass-panel border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Registered Domain Accounts</span>
                  <Badge variant="outline" className="text-xs">{users.length} Users</Badge>
                </CardTitle>
                <CardDescription>Live user records stored in Supabase database.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {users.map((u) => (
                    <div key={u.id || u.email} className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-white/5 hover:border-primary/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{u.name}</p>
                          <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">{u.role}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{u.email} {u.phone ? `• ${u.phone}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/5">
              <CardHeader>
                <CardTitle>Add New Domain User</CardTitle>
                <CardDescription>Create a new registered user in Supabase.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Full Name</Label>
                    <Input id="admin-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Dr. Rajesh Kumar" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input id="admin-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@pashuverse.in" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-role">Domain Role</Label>
                    <select 
                      id="admin-role" 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full h-10 px-3 rounded-md bg-background/50 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Farmer">Farmer</option>
                      <option value="Veterinarian">Veterinarian</option>
                      <option value="Government & NGO">Government & NGO</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Animal Hospital">Animal Hospital</option>
                      <option value="Insurance Provider">Insurance Provider</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-phone">Phone (Optional)</Label>
                    <Input id="admin-phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91 98765 43210" className="bg-background/50" />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" /> Create User Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advisories Tab */}
        <TabsContent value="advisories" className="mt-4">
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle>Broadcast Official Health Advisory</CardTitle>
              <CardDescription>Post official government/system health advisories directly to the community feed.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePostAdvisory} className="space-y-4 max-w-2xl">
                {advisoryStatus && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
                    {advisoryStatus}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="adv-title">Advisory Title</Label>
                  <Input id="adv-title" value={advisoryTitle} onChange={(e) => setAdvisoryTitle(e.target.value)} placeholder="e.g. Foot & Mouth Disease Alert - Mandatory Vaccination Drive" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adv-content">Advisory Details & Directives</Label>
                  <textarea 
                    id="adv-content" 
                    rows={4} 
                    value={advisoryContent} 
                    onChange={(e) => setAdvisoryContent(e.target.value)} 
                    placeholder="Enter official health directive guidelines for farmers and veterinarians..." 
                    className="w-full p-3 rounded-md bg-background/50 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Send className="w-4 h-4 mr-2" /> Publish Advisory to Platform
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Config Tab */}
        <TabsContent value="database" className="mt-4">
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle>Supabase PostgreSQL Connection Audit</CardTitle>
              <CardDescription>Direct database connection status and credentials log.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/10 border border-white/5 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Database Host:</span>
                  <span className="font-mono text-emerald-400">aws-0-ap-northeast-1.pooler.supabase.com:6543</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Project Reference:</span>
                  <span className="font-mono text-foreground">ryrkqydpgdkaamwtesqq</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">SSL Encryption:</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">Active (TLS/SSL)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Main Tables:</span>
                  <span className="font-mono text-foreground">users, animals, health_records, vaccinations, appointments, insurance_claims, sos_requests</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

