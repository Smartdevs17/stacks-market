import React from 'react';
import { BarChart2, Zap, Award } from 'lucide-react';

export const CollectionStats: React.FC = () => {
  return (
    <div className="protocol-stats-section">
      <h3>Market Insights</h3>
      <div className="stats-inner-grid">
        <div className="mini-stat">
          <BarChart2 size={18} className="text-primary" />
          <div className="mini-stat-info">
            <span className="label">Floor Price</span>
            <span className="value">12.5 STX</span>
          </div>
        </div>
        <div className="mini-stat">
          <Zap size={18} className="text-primary" />
          <div className="mini-stat-info">
            <span className="label">24h Vol</span>
            <span className="value">45.2k STX</span>
          </div>
        </div>
        <div className="mini-stat">
          <Award size={18} className="text-primary" />
          <div className="mini-stat-info">
            <span className="label">Total Assets</span>
            <span className="value">5,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
