import { useState } from 'react';

export interface InvestmentHold {
  holdId: string;
  offerId: string;
  amount: number;
  status: 'pending' | 'captured' | 'released' | 'failed';
  createdAt: string;
}

export const useInvest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentHold, setCurrentHold] = useState<InvestmentHold | null>(null);

  const createHold = async (offerId: string, amount: number): Promise<InvestmentHold> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call to create hold
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response
      const hold: InvestmentHold = {
        holdId: `hold_${Date.now()}`,
        offerId,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setCurrentHold(hold);
      return hold;
    } catch (err) {
      const errorMessage = 'Falha ao criar hold. Verifique seu saldo.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const captureHold = async (holdId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call to capture hold
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (currentHold?.holdId === holdId) {
        setCurrentHold({
          ...currentHold,
          status: 'captured',
        });
      }
    } catch (err) {
      const errorMessage = 'Falha ao capturar fundos.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const releaseHold = async (holdId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call to release hold
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (currentHold?.holdId === holdId) {
        setCurrentHold({
          ...currentHold,
          status: 'released',
        });
      }
    } catch (err) {
      const errorMessage = 'Falha ao liberar hold.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    currentHold,
    createHold,
    captureHold,
    releaseHold,
  };
};
