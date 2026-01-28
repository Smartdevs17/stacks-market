
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
