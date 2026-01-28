
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that marketplace can optionally list items",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "list-item", [types.uint(1), types.uint(500)], wallet_1.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify listing
        let listingBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "get-listing", [types.uint(1)], wallet_1.address)
        ]);
        let listing = listingBlock.receipts[0].result.expectSome().expectTuple();
        listing['price'].expectUint(500);
        listing['owner'].expectPrincipal(wallet_1.address);
    },
});

Clarinet.test({
    name: "Ensure that user can unlist an item",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        
        // List item first
        chain.mineBlock([
            Tx.contractCall("marketplace", "list-item", [types.uint(1), types.uint(500)], wallet_1.address)
        ]);

        // Unlist item
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "unlist-item", [types.uint(1)], wallet_1.address)
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify listing is gone
        let listingBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "get-listing", [types.uint(1)], wallet_1.address)
        ]);
        listingBlock.receipts[0].result.expectNone();
    },
});

Clarinet.test({
    name: "Ensure that user can buy an item",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        
        // List item first
        chain.mineBlock([
            Tx.contractCall("marketplace", "list-item", [types.uint(1), types.uint(100)], wallet_1.address)
        ]);

        // Buy item
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "buy-item", [types.uint(1)], wallet_2.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify listing is deleted
        let listingBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "get-listing", [types.uint(1)], wallet_1.address)
        ]);
        listingBlock.receipts[0].result.expectNone();
    },
});

Clarinet.test({
    name: "Ensure that owner can update price",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        
        // List item
        chain.mineBlock([
            Tx.contractCall("marketplace", "list-item", [types.uint(1), types.uint(500)], wallet_1.address)
        ]);

        // Update price
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "update-price", [types.uint(1), types.uint(600)], wallet_1.address)
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify new price
        let listingBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "get-listing", [types.uint(1)], wallet_1.address)
        ]);
        let listing = listingBlock.receipts[0].result.expectSome().expectTuple();
        listing['price'].expectUint(600);
    },
});

Clarinet.test({
    name: "Ensure that auctions can be started and bids can be placed",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        
        // Start auction
        let startBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "start-auction", [types.uint(1), types.uint(100), types.uint(10)], wallet_1.address)
        ]);
        startBlock.receipts[0].result.expectOk().expectBool(true);

        // Place bid
        let bidBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "place-bid", [types.uint(1), types.uint(200)], wallet_2.address)
        ]);
        bidBlock.receipts[0].result.expectOk().expectBool(true);
        
        // Verify auction state
        let auctionBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "get-auction", [types.uint(1)], wallet_1.address)
        ]);
        let auction = auctionBlock.receipts[0].result.expectSome().expectTuple();
        auction['highest-bidder'].expectSome().expectPrincipal(wallet_2.address);
        auction['highest-bid'].expectUint(200);
    },
});

Clarinet.test({
    name: "Ensure that outbid users are refunded",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        let wallet_3 = accounts.get("wallet_3")!;
        
        // Start auction
        chain.mineBlock([
            Tx.contractCall("marketplace", "start-auction", [types.uint(1), types.uint(100), types.uint(10)], wallet_1.address)
        ]);

        // Wallet 2 bids 200
        chain.mineBlock([
            Tx.contractCall("marketplace", "place-bid", [types.uint(1), types.uint(200)], wallet_2.address)
        ]);

        // Wallet 3 bids 300 - Should trigger refund to Wallet 2
        let bidBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "place-bid", [types.uint(1), types.uint(300)], wallet_3.address)
        ]);
        bidBlock.receipts[0].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Ensure that auctions can be settled correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        
        // Start auction duration 10
        chain.mineBlock([
            Tx.contractCall("marketplace", "start-auction", [types.uint(1), types.uint(100), types.uint(10)], wallet_1.address)
        ]);

        // Place lead bid
        chain.mineBlock([
            Tx.contractCall("marketplace", "place-bid", [types.uint(1), types.uint(200)], wallet_2.address)
        ]);

        // Pass time
        chain.mineEmptyBlockUntil(20);

        // End auction
        let endBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "end-auction", [types.uint(1)], wallet_1.address)
        ]);
        endBlock.receipts[0].result.expectOk().expectBool(true);
        
        // Verify auction is deleted
        let auctionBlock = chain.mineBlock([
            Tx.contractCall("marketplace", "get-auction", [types.uint(1)], wallet_1.address)
        ]);
        auctionBlock.receipts[0].result.expectNone();
    },
});
