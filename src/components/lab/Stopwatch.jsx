import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Save, RotateCcw } from 'lucide-react';
import CountdownOverlay from '@/components/common/CountdownOverlay';

export default function Stopwatch({ onSave }) {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const start = useCallback(() => {
    setRunning(true);
    startTimeRef.current = Date.now() - time * 1000;
    intervalRef.current = setInterval(() => {
      setTime((Date.now() - startTimeRef.current) / 1000);
    }, 10);
  }, [time]);

  const stop = useCallback(() => {
    setRunning(false);
    clearInterval(intervalRef.current);
  }, []);

  const formatTime = (t) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    onSave(parseFloat(time.toFixed(2)));
    setTime(0);
  };

  const handleReset = () => {
    setTime(0);
  };

  return (
    <div className="text-center space-y-6">
      {countdown && <CountdownOverlay onDone={() => { setCountdown(false); start(); }} />}
      <div className="font-display text-5xl md:text-6xl font-bold tracking-wider tabular-nums text-primary">
        {formatTime(time)}
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {!running ? (
          <>
            <Button onClick={() => setCountdown(true)} size="lg" className="gap-2 px-8 flex-1 sm:flex-none min-w-[140px]">
              <Play className="w-5 h-5" /> {time > 0 ? 'Continuar' : 'Iniciar'}
            </Button>
            {time > 0 && (
              <Button onClick={handleReset} variant="outline" size="lg" className="gap-2 flex-1 sm:flex-none min-w-[120px]">
                <RotateCcw className="w-5 h-5" /> Reiniciar
              </Button>
            )}
            {time > 0 && (
              <Button onClick={handleSave} size="lg" className="gap-2 flex-1 sm:flex-none min-w-[120px]">
                <Save className="w-5 h-5" /> Guardar
              </Button>
            )}
          </>
        ) : (
          <Button onClick={stop} variant="destructive" size="lg" className="gap-2 px-8 w-full sm:w-auto">
            <Square className="w-5 h-5" /> Detener
          </Button>
        )}
      </div>
    </div>
  );
}