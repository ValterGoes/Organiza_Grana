import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotificationPermission, requestNotificationPermission } from '@/lib/notifications';

const DISMISSED_KEY = 'gerenciador-vencimentos-notification-prompt-dismissed';

export function NotificationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const permission = getNotificationPermission();
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    setVisible(permission === 'default' && !dismissed);
  }, []);

  if (!visible) return null;

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted' || result === 'denied') {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setVisible(false);
  };

  return (
    <div className="border-b border-blue-200 bg-blue-50 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm text-blue-800">
            Ative as notificações para receber alertas de vencimento no celular.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleEnable} className="whitespace-nowrap">
            Ativar
          </Button>
          <button onClick={handleDismiss} className="text-blue-600 hover:text-blue-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
