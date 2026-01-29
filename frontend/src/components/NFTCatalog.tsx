import React from 'react';
import { Tag, User } from 'lucide-react';

export const NFTCatalog: React.FC = () => {
  const dummyItems = [
    { id: 1, name: 'Stacks Punk #001', price: '45.00', owner: 'ST1PQ...624W' },
    { id: 2, name: 'Digital Genesis', price: '120.50', owner: 'ST1PQ...624W' },
    { id: 3, name: 'Cipher Key', price: '89.99', owner: 'ST2XF...HB7R' },
  ];

  return (
    <div className="nft-catalog">
      <h3>NFT Marketplace</h3>
      <div className="catalog-grid">
        {dummyItems.map((item) => (
          <div key={item.id} className="nft-card">
            <div className="nft-image-placeholder">
              <Tag size={48} className="placeholder-icon" />
            </div>
            <div className="nft-details">
              <h4>{item.name}</h4>
              <div className="nft-meta">
                <div className="nft-owner">
                  <User size={14} />
                  <span>{item.owner}</span>
                </div>
                <p className="nft-price">{item.price} STX</p>
              </div>
              <button className="btn-primary full-width small-btn">Buy Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
