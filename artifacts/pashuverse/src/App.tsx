import React from 'react';
import { Route, Switch, Redirect, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CallNotificationProvider } from '@/context/CallNotificationContext';
import { AppLayout } from '@/components/layout';

import NotFound from '@/pages/not-found';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import AnimalsPage from '@/pages/AnimalsPage';
import AnimalProfilePage from '@/pages/AnimalProfilePage';
import MarketplacePage from '@/pages/MarketplacePage';
import CommunityPage from '@/pages/CommunityPage';
import SurveillancePage from '@/pages/SurveillancePage';
import InsurancePage from '@/pages/InsurancePage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import AdminPage from '@/pages/AdminPage';
import VerifyAnimalPage from '@/pages/VerifyAnimalPage';
import DiseaseDetectionPage from '@/pages/DiseaseDetectionPage';
import SosPage from '@/pages/SosPage';
import VaccinationsPage from '@/pages/VaccinationsPage';
import AiAssistantPage from '@/pages/AiAssistantPage';

const queryClient = new QueryClient();

function AuthRoute({ component: Component, allowedRoles, ...rest }: any) {
  const { user } = useAuth();
  if (!user) {
    return <Redirect to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }
  return (
    <AppLayout>
      <Component {...rest} />
    </AppLayout>
  );
}

function SignupPage(props: any) {
  return <LoginPage {...props} isSignup />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />

      {/* Public QR Code Verification Routes */}
      <Route path="/verify/:tagId" component={VerifyAnimalPage} />
      <Route path="/verify" component={VerifyAnimalPage} />

      <Route path="/dashboard"><AuthRoute component={Dashboard} /></Route>
      <Route path="/animals"><AuthRoute component={AnimalsPage} /></Route>
      <Route path="/animals/:id"><AuthRoute component={AnimalProfilePage} /></Route>
      <Route path="/disease-detection">
        <AuthRoute 
          component={DiseaseDetectionPage} 
          allowedRoles={['Farmer', 'Admin']} 
        />
      </Route>
      <Route path="/assistant"><AuthRoute component={AiAssistantPage} /></Route>
      <Route path="/sos">
        <AuthRoute 
          component={SosPage} 
          allowedRoles={['Farmer', 'Government & NGO', 'Admin']} 
        />
      </Route>
      <Route path="/marketplace"><AuthRoute component={MarketplacePage} /></Route>
      <Route path="/community"><AuthRoute component={CommunityPage} /></Route>
      <Route path="/surveillance"><AuthRoute component={SurveillancePage} /></Route>
      <Route path="/insurance"><AuthRoute component={InsurancePage} /></Route>
      <Route path="/appointments"><AuthRoute component={AppointmentsPage} /></Route>
      <Route path="/notifications"><AuthRoute component={NotificationsPage} /></Route>
      <Route path="/vaccinations">
        <AuthRoute 
          component={VaccinationsPage} 
          allowedRoles={['Farmer', 'Animal Hospital', 'Admin']} 
        />
      </Route>
      <Route path="/admin"><AuthRoute component={AdminPage} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="pashuverse-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CallNotificationProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </CallNotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
