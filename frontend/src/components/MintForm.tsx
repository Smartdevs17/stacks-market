import React, { useState } from 'react';
import { PlusSquare } from 'lucide-react';

export const MintForm: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Minting NFT:', { name, description });
  };

  return (
    <div className="card-form secondary-theme">
      <h3>Mint New NFT</h3>
      <p className="card-subtitle">Create a unique digital asset on the Stacks blockchain.</p>
      <form onSubmit={handleMint}>
        <div className="input-group">
          <label>NFT Name</label>
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder="Enter name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
        </div>
        <div className="input-group">
          <label>Description</label>
          <div className="input-wrapper">
            <textarea 
              rows={3}
              placeholder="Describe your asset" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
        </div>
        <button type="submit" className="btn-secondary full-width">
          <PlusSquare size={20} />
          <span>Mint NFT</span>
        </button>
      </form>
    </div>
  );
};
