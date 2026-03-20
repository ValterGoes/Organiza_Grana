import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { autoBackupIfNeeded } from "@/lib/backup";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { BottomNav } from "./components/BottomNav";
import { PinScreen } from "./components/PinScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Expenses from "./pages/Expenses";

function Router() {
  return (
    <>
      <div className="pb-16">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/gastos"} component={Expenses} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <BottomNav />
    </>
  );
}

function AppContent() {
  const { state } = useAuth();

  // Durante loading, mostrar apenas o fundo verde sem flash do logo
  if (state === 'loading') {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-[#3BA36C] via-[#2d8a56] to-[#1f6e40]" />
    );
  }

  if (state === 'setup' || state === 'locked') {
    return <PinScreen />;
  }

  return <Router />;
}

function App() {
  useEffect(() => {
    // Solicitar armazenamento persistente para evitar perda de dados
    if (navigator.storage?.persist) {
      navigator.storage.persist();
    }
    // Backup automático a cada 7 dias
    autoBackupIfNeeded();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
