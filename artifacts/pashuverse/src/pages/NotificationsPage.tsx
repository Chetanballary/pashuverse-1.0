import React from 'react';
import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Activity, Syringe, CalendarCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: rawNotifications, isLoading } = useListNotifications();

  const fallbackNotifications = [
    { id: 1, title: "Vaccination Due Reminder", message: "FMD Booster due for Gir Cow #102 on July 30, 2026.", type: "vaccination due", isRead: false, createdAt: new Date().toISOString() },
    { id: 2, title: "Outbreak Heatmap Alert", message: "District Vet Office issued Lumpy Skin alert for Hassan district.", type: "disease alert", isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, title: "Tele-Vet Appointment Confirmed", message: "Dr. Anita Sharma confirmed video consultation for 10:30 AM tomorrow.", type: "appointment reminder", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  const notifications = (Array.isArray(rawNotifications) && rawNotifications.length > 0) ? rawNotifications : fallbackNotifications;
  const markRead = useMarkNotificationRead();

  const handleMarkAsRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  const getIcon = (type: string) => {
    switch ((type || 'general').toLowerCase()) {
      case 'disease alert': return <Activity className="w-5 h-5 text-red-500" />;
      case 'vaccination due': return <Syringe className="w-5 h-5 text-blue-500" />;
      case 'appointment reminder': return <CalendarCheck className="w-5 h-5 text-sky-500" />;
      case 'emergency': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Notifications
          </h1>
        </div>
        <Button variant="outline" className="glass-panel text-muted-foreground hover:text-foreground">
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1,2,3,4].map(i => <Card key={i} className="h-24 animate-pulse bg-card/50" />)
        ) : notifications?.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border-white/5">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          notifications?.map(notif => (
            <Card 
              key={notif.id} 
              className={`glass-panel border-white/5 transition-colors overflow-hidden ${!notif.isRead ? 'border-l-4 border-l-primary bg-card/80' : 'bg-card/40'}`}
            >
              <CardContent className="p-4 flex gap-4">
                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-background' : 'bg-background/50'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-base font-semibold ${!notif.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.isRead ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 text-muted-foreground hover:text-primary mt-1"
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
