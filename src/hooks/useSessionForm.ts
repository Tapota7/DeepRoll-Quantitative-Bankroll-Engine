import { useState, useMemo, useEffect, useRef } from 'react';
import { Session, Operator } from '../types/poker';
import { calculateSessionMetrics, SessionCalculationResult } from '../utils/pokerMath';

export interface UseSessionFormProps {
  isOpen: boolean;
  nextSessionNumber: number;
  onSaveSession: (newSession: Session) => void;
  onClose: () => void;
}

export function useSessionForm({
  isOpen,
  nextSessionNumber,
  onSaveSession,
  onClose,
}: UseSessionFormProps) {
  const operator: Operator = 'GGPoker';
  const [stake, setStake] = useState<string>('NL5 Deep');
  const [hands, setHands] = useState<number>(1200);
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [directProfit, setDirectProfit] = useState<number>(28.5);
  const [rakeback, setRakeback] = useState<number>(3.8);
  const [notes, setNotes] = useState<string>('Sesión auditada en GGPoker');
  const [tiltScore, setTiltScore] = useState<number>(10);
  const [tags, setTags] = useState<string[]>(['#A-Game', '#GGPoker']);

  const firstInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Cálculos reactivos puros desacoplados
  const metrics: SessionCalculationResult = useMemo(() => {
    return calculateSessionMetrics({
      stake,
      hands,
      durationMinutes,
      directProfit,
      rakeback,
    });
  }, [stake, hands, durationMinutes, directProfit, rakeback]);

  // Autofocus ergonómico al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
        firstInputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  // Atajos de teclado para registro en <15s:
  // - Ctrl + Enter o Cmd + Enter confirma e inserta
  // - Escape cierra el modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const idFormatted = `#0${nextSessionNumber}`;
    const newSession: Session = {
      id: idFormatted,
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      operator,
      stake,
      bb: metrics.bigBlind,
      hands,
      durationMinutes,
      durationFormatted: metrics.durationFormatted,
      rakeback,
      directProfit,
      netProfit: metrics.netProfit,
      cajasImpact: metrics.cajasImpact,
      winrateBB100: metrics.winrateBB100,
      notes,
      tiltScore,
      tags,
    };

    onSaveSession(newSession);
    onClose();
  };

  return {
    state: {
      operator,
      stake,
      hands,
      durationMinutes,
      directProfit,
      rakeback,
      notes,
      tiltScore,
      tags,
      metrics,
    },
    actions: {
      setStake,
      setHands,
      setDurationMinutes,
      setDirectProfit,
      setRakeback,
      setNotes,
      setTiltScore,
      setTags,
      handleSubmit,
    },
    refs: {
      firstInputRef,
      formRef,
    },
  };
}
