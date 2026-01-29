import React from 'react';
import { ShoppingCart } from 'lucide-react';

export const MarketActivity: React.FC = () => {
  const sales = [
    { item: 'Stacks Punk #001', price: '45 STX', time: '5 mins ago' },
    { item: 'Digital Genesis', price: '120 STX', time: '12 mins ago' },
    { item: 'Cipher Key', price: '90 STX', time: '45 mins ago' },
  ];

  return (
    <div className="activity-section">
      <div className="activity-header">
        <ShoppingCart size={20} />
        <h3>Recent Sales</h3>
      </div>
      <div className="activity-list">
        {sales.map((sale, i) => (
          <div key={i} className="activity-item">
            <div className="activity-dot" />
            <div className="activity-content">
              <span className="activity-type">{sale.item}</span>
              <span className="activity-amount">Sold for {sale.price}</span>
            </div>
            <span className="activity-time">{sale.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
