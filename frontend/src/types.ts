export interface MarketStats {
  activeListings: number;
  totalVolume: string;
  myItems: number;
}

export interface NFTItem {
  id: number;
  name: string;
  price: string;
  owner: string;
}
