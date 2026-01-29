# Stacks Market: Marketplace Invariants

Core rules and constraints enforced by the `marketplace` smart contract.

## Listing Safety
- **Ownership Invariant**: Only the current owner of an NFT can list it for sale or start an auction.
- **Single-Listing Constraint**: An item cannot be listed for fixed-price sale and active auction simultaneously.

## Royalty Integrity
- **Creator Payment Invariant**: Every primary and secondary sale MUST distribute the configured royalty percentage to the creator before releasing funds to the seller.
- **Fee Cap**: Total marketplace fees + royalties cannot exceed 20% (2000 bps).

## Auction Rules
- **Bid Finality**: Once a bid is placed, it cannot be withdrawn except when outbid.
- **Minimum Bid Invariant**: Higher bids must exceed the previous high bid by at least 1%.
