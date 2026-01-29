import React from 'react';
import { Home, Tag, Hammer, Settings, BarChart3 } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li className="active">
            <Home size={20} />
            <span>Marketplace</span>
          </li>
          <li>
            <Tag size={20} />
            <span>Listings</span>
          </li>
          <li>
            <Hammer size={20} />
            <span>Auctions</span>
          </li>
          <div className="nav-divider" />
          <li>
            <BarChart3 size={20} />
            <span>Analytics</span>
          </li>
          <li>
            <Settings size={20} />
            <span>Settings</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};
