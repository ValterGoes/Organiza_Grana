import { useLocation, Link } from 'wouter';
import { Receipt, ShoppingBag } from 'lucide-react';

export function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { path: '/', label: 'Vencimentos', icon: Receipt },
    { path: '/gastos', label: 'Gastos Diários', icon: ShoppingBag },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white safe-area-bottom">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[#3BA36C]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#3BA36C]' : 'text-gray-400'}`} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
