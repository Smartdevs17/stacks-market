
export const SWARM_CONFIG = {
    // Micro-transaction amount (1 uSTX)
    MICRO_AMOUNT: 1, 
    
    // Batch size for concurrent transactions
    BATCH_SIZE: 10,
    
    // Total iterations per run
    ITERATIONS: 100,
    
    // Delay between batches (ms) to avoid rate limits
    DELAY_MS: 2000,
    
    // Target Contracts
    MARKET_CONTRACT: 'marketplace-v3',
    AUCTION_ID: 1 // Target the genesis auction
};
