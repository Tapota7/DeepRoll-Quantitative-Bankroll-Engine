import React, { useState } from 'react';

interface QuickTransactionModalProps {
  isOpen: boolean;
  type: 'deposit' | 'withdraw' | 'adjustment';
  onClose: () => void;
  onConfirm: (type: 'deposit' | 'withdraw' | 'adjustment', amount: number, source: string) => void;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  type,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [source, setSource] = useState<string>('GGPoker');

  if (!isOpen) return null;

  const titles = {
    deposit: 'Registrar Depósito',
    withdraw: 'Registrar Retiro',
    adjustment: 'Registrar Ajuste / Bono',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      onConfirm(type, parsedAmount, source);
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050507]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0f172a] rounded-xl p-5 shadow-2xl space-y-4 border border-[rgba(255,255,255,0.08)] font-mono text-[12px] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.08)]">
          <h3 className="font-sans text-[16px] font-bold text-[#f8fafc]">{titles[type]}</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#f8fafc] p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] text-[#94a3b8] uppercase">Monto (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#64748b]">$</span>
              <input
                className="w-full bg-[#050507] py-2 pl-7 pr-3 rounded text-[#f8fafc] font-bold focus:outline-none border border-[rgba(255,255,255,0.1)] focus:border-[#38bdf8]"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#94a3b8] uppercase">Sala / Origen</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-[#050507] py-2 px-3 rounded text-[#f8fafc] focus:outline-none border border-[rgba(255,255,255,0.1)] focus:border-[#38bdf8]"
            >
              <option value="GGPoker">GGPoker (Cajero Principal)</option>
              <option value="Bono / Rakeback">Bono / Rakeback (Fish Buffet)</option>
              <option value="Billetera Cripto / Skrill">Billetera Cripto / Skrill</option>
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="w-full py-2 bg-[#10b981] hover:bg-[#34d399] text-[#050507] font-bold rounded transition-colors shadow-sm"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
