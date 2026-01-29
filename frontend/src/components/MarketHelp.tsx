import React from 'react';
import { HelpCircle, ExternalLink } from 'lucide-react';

export const MarketHelp: React.FC = () => {
  return (
    <div className="help-center-section">
      <div className="help-header">
        <HelpCircle size={20} />
        <h3>Marketplace Support</h3>
      </div>
      <p>Have questions about buying or selling? Chat with our community.</p>
      <button className="btn-secondary small-btn">
        <span>Visit Discord</span>
        <ExternalLink size={14} />
      </button>
    </div>
  );
};
