import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NFTCatalog } from './components/NFTCatalog';
import { MintForm } from './components/MintForm';
import { CollectionStats } from './components/CollectionStats';
import { MarketActivity } from './components/MarketActivity';
import { MarketHelp } from './components/MarketHelp';
import { Footer } from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <section className="dashboard-hero">
            <h2>Marketplace Dashboard</h2>
            <p>Discover, buy, and sell digital assets on Stacks.</p>
          </section>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Active Listings</h3>
              <p className="stat-value">0</p>
            </div>
            <div className="stat-card">
              <h3>Total Volume</h3>
              <p className="stat-value">0 STX</p>
            </div>
            <div className="stat-card">
              <h3>My Items</h3>
              <p className="stat-value">0</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <NFTCatalog />
            <MintForm />
          </div>

          <CollectionStats />
          <MarketActivity />
          <MarketHelp />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default App
