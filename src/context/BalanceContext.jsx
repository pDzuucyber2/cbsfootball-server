import { createContext, useContext, useState } from "react";

const BalanceContext = createContext();

export const useBalance = () => {
  const context = useContext(BalanceContext);

  if (!context) {
    throw new Error("useBalance must be used inside BalanceProvider");
  }

  return context;
};

export const BalanceProvider = ({ children }) => {
  const [balances, setBalances] = useState({
    TZS: 0,
    USDT: 0,
    USD: 0,
    KES: 0,
    UGX: 0,
    RWF: 0,
    BIF: 0,
    ZMW: 0,
    MWK: 0,
    MZN: 0,
    SSP: 0,
    BWP: 0,
    MGA: 0,
  });

  const updateSingleBalance = (currency, amount) => {
    setBalances((prev) => ({
      ...prev,
      [currency]: Number(amount || 0),
    }));
  };

  return (
    <BalanceContext.Provider
      value={{
        balances,
        setBalances,
        updateSingleBalance,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};