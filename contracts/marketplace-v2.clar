;; marketplace-v2
;; Advanced marketplace with collection offers

(define-constant err-not-authorized (err u100))
(define-constant err-invalid-offer (err u105))

(define-constant contract-owner tx-sender)

(define-map listings uint {price: uint, owner: principal})
(define-map auctions uint {highest-bidder: (optional principal), highest-bid: uint, end-block: uint, owner: principal})
(define-map royalties uint {creator: principal, bps: uint})
(define-map collections uint {name: (string-ascii 20), items: (list 100 uint)})

;; New: Collection Offers
(define-map collection-offers {collection-id: uint, offeror: principal} {price: uint, expiry: uint})

(define-read-only (get-collection-offer (collection-id uint) (offeror principal))
    (map-get? collection-offers {collection-id: collection-id, offeror: offeror})
)

(define-public (place-collection-offer (collection-id uint) (price uint) (expiry uint))
    (begin
        ;; Lock funds would happen here in real impl
        (map-set collection-offers {collection-id: collection-id, offeror: tx-sender} {price: price, expiry: (+ block-height expiry)})
        (print {event: "collection-offer", collection-id: collection-id, offeror: tx-sender, price: price})
        (ok true)
    )
)

;; Include original functionality...
(define-public (list-item (item-id uint) (price uint))
    (begin
        (map-set listings item-id {price: price, owner: tx-sender})
        (print {event: "list-item", item-id: item-id, price: price, seller: tx-sender})
        (ok true)
    )
)

(define-public (buy-item (item-id uint))
    (let (
        (listing (unwrap! (map-get? listings item-id) (err u100)))
        (price (get price listing))
    )
        ;; Simplified transfer logic for v2 stub
        (map-delete listings item-id)
        (print {event: "buy-item", item-id: item-id, buyer: tx-sender, price: price})
        (ok true)
    )
)
