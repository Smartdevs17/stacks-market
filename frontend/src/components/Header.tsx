import React from 'react';
import { useStacks } from '../hooks/useStacks';
import { ShoppingBag, LogOut, Wallet } from 'lucide-react';

export const Header: React.FC = () => {
  const { address, connectWallet, disconnectWallet } = useStacks();

  return (
    <header className="header">
      <div className="logo-container">
        <ShoppingBag className="logo-icon" size={32} />
        <h1>Stacks Market</h1>
      </div>
      <div className="nav-actions">
        {address ? (
          <div className="user-info">
            <code className="address-chip">
              {address.slice(0, 6)}...{address.slice(-4)}
            </code>
            <button onClick={disconnectWallet} className="btn-secondary">
              <LogOut size={18} />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          <button onClick={connectWallet} className="btn-primary">
            <Wallet size={18} />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
};
