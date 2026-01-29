
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that collection offer emits a print event",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        
        let block = chain.mineBlock([
            Tx.contractCall("marketplace-v2", "place-collection-offer", [types.uint(1), types.uint(5000), types.uint(144)], wallet_1.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk().expectBool(true);
        
        let event = block.receipts[0].events[0];
        assertEquals(event.contract_event.topic, "print");
    },
});

Clarinet.test({
    name: "Ensure that get-collection-offer retrieves data",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        
        chain.mineBlock([
            Tx.contractCall("marketplace-v2", "place-collection-offer", [types.uint(1), types.uint(5000), types.uint(144)], wallet_1.address)
        ]);
        
        let block = chain.mineBlock([
            Tx.contractCall("marketplace-v2", "get-collection-offer", [types.uint(1), types.principal(wallet_1.address)], wallet_1.address)
        ]);
        
        let offer = block.receipts[0].result.expectTuple();
        offer['price'].expectUint(5000);
        // Expiry should be 1 + 144 + 1 (since 2 blocks mined) = 146 or closely related
    },
});
