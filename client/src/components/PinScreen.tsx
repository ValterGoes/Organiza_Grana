import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ShieldCheck, AlertTriangle } from 'lucide-react';

const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

export function PinScreen() {
  const { state, setup, unlock, resetAll } = useAuth();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [showReset, setShowReset] = useState(false);

  const isSetup = state === 'setup';

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handlePinComplete = useCallback(
    async (value: string) => {
      if (cooldown > 0) return;

      if (isSetup) {
        if (step === 'enter') {
          setPin(value);
          setStep('confirm');
          setConfirmPin('');
          setError('');
        } else {
          if (value === pin) {
            await setup(pin);
          } else {
            setError('Os PINs não coincidem. Tente novamente.');
            setStep('enter');
            setPin('');
            setConfirmPin('');
          }
        }
      } else {
        const success = await unlock(value);
        if (success) {
          setAttempts(0);
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          setPin('');
          if (newAttempts >= MAX_ATTEMPTS) {
            setError(`Muitas tentativas. Aguarde ${COOLDOWN_SECONDS}s.`);
            startCooldown();
            setAttempts(0);
          } else {
            setError(`PIN incorreto. ${MAX_ATTEMPTS - newAttempts} tentativa${MAX_ATTEMPTS - newAttempts !== 1 ? 's' : ''} restante${MAX_ATTEMPTS - newAttempts !== 1 ? 's' : ''}.`);
          }
        }
      }
    },
    [isSetup, step, pin, attempts, cooldown, setup, unlock, startCooldown],
  );

  const handleReset = () => {
    if (confirm('Isso apagará TODOS os seus dados permanentemente. Deseja continuar?')) {
      resetAll();
      setShowReset(false);
      setAttempts(0);
      setError('');
      setPin('');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#3BA36C] via-[#2d8a56] to-[#1f6e40] px-4">
      <Card className="w-full max-w-sm border-0 shadow-2xl">
        <CardHeader className="text-center">
          <img
            src="/Logo.webp"
            alt="Organiza Grana"
            className="mx-auto mb-3 h-20 w-auto drop-shadow-md"
          />
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#3BA36C]/10">
            {isSetup ? (
              <ShieldCheck className="h-7 w-7 text-[#3BA36C]" />
            ) : (
              <Lock className="h-7 w-7 text-[#3BA36C]" />
            )}
          </div>
          <CardTitle className="text-xl text-gray-900">
            {isSetup
              ? step === 'enter'
                ? 'Crie seu PIN'
                : 'Confirme seu PIN'
              : 'Digite seu PIN'}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {isSetup
              ? step === 'enter'
                ? 'Escolha um PIN de 6 dígitos para proteger seus dados'
                : 'Digite o PIN novamente para confirmar'
              : 'Insira seu PIN para acessar suas faturas'}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={PIN_LENGTH}
            value={isSetup ? (step === 'enter' ? pin : confirmPin) : pin}
            onChange={(value) => {
              if (cooldown > 0) return;
              if (isSetup && step === 'confirm') {
                setConfirmPin(value);
              } else {
                setPin(value);
              }
              setError('');
            }}
            onComplete={handlePinComplete}
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={cooldown > 0}
          >
            <InputOTPGroup>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-12 w-12 text-lg"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {cooldown > 0 && (
            <p className="text-sm text-gray-500">
              Tente novamente em <span className="font-semibold">{cooldown}s</span>
            </p>
          )}

          {!isSetup && (
            <div className="mt-4 text-center">
              {showReset ? (
                <div className="space-y-2">
                  <p className="text-xs text-red-600">
                    Todos os dados serão perdidos permanentemente.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReset(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleReset}
                    >
                      Apagar tudo
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowReset(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Esqueceu o PIN?
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
