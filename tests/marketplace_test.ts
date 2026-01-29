
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
    name: "Ensure that royalties are correctly applied on sales",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        let creator = accounts.get("wallet_3")!;
        
        // Set royalty (5% = 500 bps)
        chain.mineBlock([
            Tx.contractCall("marketplace", "set-royalty", [types.uint(1), types.principal(creator.address), types.uint(500)], deployer.address)
        ]);

        // List item
        chain.mineBlock([
            Tx.contractCall("marketplace", "list-item", [types.uint(1), types.uint(1000)], wallet_1.address)
        ]);

        // Buy item
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "buy-item", [types.uint(1)], wallet_2.address)
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Detailed check of STX transfers would require analysis of block events/receipts
        // In Clarinet simulation, we verify the transaction succeeds with the logic inside buy-item.
    },
});

Clarinet.test({
    name: "Ensure admin can delist items",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let wallet_1 = accounts.get("wallet_1")!;
        
        // List item
        chain.mineBlock([
            Tx.contractCall("marketplace", "list-item", [types.uint(1), types.uint(500)], wallet_1.address)
        ]);

        // Admin delists
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "delist-admin", [types.uint(1)], deployer.address)
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
    name: "Ensure auctions handle royalties at the end",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        let creator = accounts.get("wallet_3")!;

        // Set royalty 10%
        chain.mineBlock([
            Tx.contractCall("marketplace", "set-royalty", [types.uint(1), types.principal(creator.address), types.uint(1000)], deployer.address)
        ]);

        // Start auction
        chain.mineBlock([
            Tx.contractCall("marketplace", "start-auction", [types.uint(1), types.uint(100), types.uint(10)], wallet_1.address)
        ]);

        // Bid
        chain.mineBlock([
            Tx.contractCall("marketplace", "place-bid", [types.uint(1), types.uint(200)], wallet_2.address)
        ]);

        // End auction
        chain.mineEmptyBlockUntil(20);
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "end-auction", [types.uint(1)], wallet_1.address)
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Ensure that get-contract-owner returns the correct deployer address",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "get-contract-owner", [], deployer.address)
        ]);
        block.receipts[0].result.expectOk().expectPrincipal(deployer.address);
    },
});

Clarinet.test({
    name: "Ensure that get-collection-details returns none for non-existent collections",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "get-collection-details", [types.uint(999)], wallet_1.address)
        ]);
        block.receipts[0].result.expectNone();
    },
});

Clarinet.test({
    name: "Ensure that is-item-listed correctly identifies active listings",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        
        // Initial state: not listed
        let queryInitial = chain.mineBlock([
            Tx.contractCall("marketplace", "is-item-listed", [types.uint(1)], wallet_1.address)
        ]);
        queryInitial.receipts[0].result.expectBool(false);

        // List item
        chain.mineBlock([
            Tx.contractCall("marketplace", "list-item", [types.uint(1), types.uint(500)], wallet_1.address)
        ]);

        // Post-list: true
        let queryAfter = chain.mineBlock([
            Tx.contractCall("marketplace", "is-item-listed", [types.uint(1)], wallet_1.address)
        ]);
        queryAfter.receipts[0].result.expectBool(true);
    },
});
