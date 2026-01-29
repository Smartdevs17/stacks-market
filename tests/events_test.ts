
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that list-item emits a print event",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "list-item", [types.uint(1), types.uint(100)], wallet_1.address)
        ]);
        
        let event = block.receipts[0].events[0];
        assertEquals(event.contract_event.topic, "print");
    },
});

Clarinet.test({
    name: "Ensure that buy-item emits a print event",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        
        chain.mineBlock([
            Tx.contractCall("marketplace", "list-item", [types.uint(1), types.uint(100)], wallet_1.address)
        ]);

        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "buy-item", [types.uint(1)], wallet_2.address)
        ]);
        
        let event = block.receipts[0].events[0]; // buy event is last? or transfer event first?
        // Transfer events are usually first. We need to find the print event.
        // But for this simple test, we check if ANY print exists.
        
        // Actually, STX transfer emits stx_transfer_event.
        // We look for contract_event of type "print".
        let printEvent = block.receipts[0].events.find((e: any) => e.contract_event && e.contract_event.topic === "print");
        assertEquals(printEvent !== undefined, true);
    },
});

Clarinet.test({
    name: "Ensure that start-auction emits a print event",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        
        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "start-auction", [types.uint(2), types.uint(100), types.uint(10)], wallet_1.address)
        ]);
        
        let event = block.receipts[0].events[0];
        assertEquals(event.contract_event.topic, "print");
    },
});

Clarinet.test({
    name: "Ensure that place-bid emits a print event",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        
        chain.mineBlock([
            Tx.contractCall("marketplace", "start-auction", [types.uint(2), types.uint(100), types.uint(10)], wallet_1.address)
        ]);

        let block = chain.mineBlock([
            Tx.contractCall("marketplace", "place-bid", [types.uint(2), types.uint(150)], wallet_2.address)
        ]);
        
        let printEvent = block.receipts[0].events.find((e: any) => e.contract_event && e.contract_event.topic === "print");
        assertEquals(printEvent !== undefined, true);
    },
});
