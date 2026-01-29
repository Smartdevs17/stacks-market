;; marketplace
;; Advanced marketplace with royalties and collections

(define-constant err-not-authorized (err u100))
(define-constant err-invalid-royalty (err u104))

(define-constant contract-owner tx-sender)

(define-map listings uint {price: uint, owner: principal})
(define-map auctions uint {highest-bidder: (optional principal), highest-bid: uint, end-block: uint, owner: principal})

;; New: Royalties and Collections
(define-map royalties uint {creator: principal, bps: uint}) ;; basis points (100 = 1%)
(define-map collections uint {name: (string-ascii 20), items: (list 100 uint)})

(define-read-only (get-listing (item-id uint))
    (map-get? listings item-id)
)

(define-read-only (get-contract-owner)
    (ok contract-owner)
)

(define-read-only (is-item-listed (item-id uint))
    (is-some (map-get? listings item-id))
)

(define-read-only (get-auction (item-id uint))
    (map-get? auctions item-id)
)

(define-read-only (get-royalty (item-id uint))
    (map-get? royalties item-id)
)

(define-read-only (get-collection-details (collection-id uint))
    (map-get? collections collection-id)
)

;; Admin Functions
(define-public (delist-admin (item-id uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
        (map-delete listings item-id)
        (map-delete auctions item-id)
        (ok true)
    )
)

(define-public (set-royalty (item-id uint) (creator principal) (bps uint))
    (begin
        ;; Only contract owner or existing creator can set royalties for now (simplified)
        (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
        (asserts! (<= bps u1000) err-invalid-royalty) ;; Max 10%
        (ok (map-set royalties item-id {creator: creator, bps: bps}))
    )
)

(define-public (list-item (item-id uint) (price uint))
    (begin
        (map-set listings item-id {price: price, owner: tx-sender})
        (print {event: "list-item", item-id: item-id, price: price, seller: tx-sender})
        (ok true)
    )
)

(define-public (buy-item (item-id uint))
    (let (
        (listing (unwrap! (get-listing item-id) (err u100)))
        (price (get price listing))
        (owner (get owner listing))
        (royalty-data (get-royalty item-id))
    )
        (match royalty-data
            data (let (
                (royalty-amount (/ (* price (get bps data)) u10000))
                (seller-amount (- price royalty-amount))
            )
                (try! (stx-transfer? royalty-amount tx-sender (get creator data)))
                (try! (stx-transfer? seller-amount tx-sender owner))
            )
            (try! (stx-transfer? price tx-sender owner))
        )
        (map-delete listings item-id)
        (print {event: "buy-item", item-id: item-id, buyer: tx-sender, price: price})
        (ok true)
    )
)

(define-public (unlist-item (item-id uint))
    (let (
        (listing (unwrap! (get-listing item-id) (err u100)))
    )
        (asserts! (is-eq tx-sender (get owner listing)) err-not-authorized)
        (map-delete listings item-id)
        (ok true)
    )
)

(define-public (update-price (item-id uint) (new-price uint))
    (let (
        (listing (unwrap! (get-listing item-id) (err u100)))
    )
        (asserts! (is-eq tx-sender (get owner listing)) err-not-authorized)
        (map-set listings item-id (merge listing {price: new-price}))
        (ok true)
    )
)

(define-public (start-auction (item-id uint) (start-price uint) (duration uint))
    (begin
        (map-set auctions item-id {
            highest-bidder: none,
            highest-bid: start-price,
            end-block: (+ block-height duration),
            owner: tx-sender
        })
        (print {event: "start-auction", item-id: item-id, start-price: start-price, duration: duration})
        (ok true)
    )
)

(define-public (place-bid (item-id uint) (bid-amount uint))
    (let (
        (auction (unwrap! (get-auction item-id) (err u100)))
        (current-bid (get highest-bid auction))
        (current-bidder (get highest-bidder auction))
    )
        (asserts! (< block-height (get end-block auction)) (err u101))
        (asserts! (> bid-amount current-bid) (err u102))
        
        (match current-bidder
            prev-bidder (try! (as-contract (stx-transfer? current-bid tx-sender prev-bidder)))
            true
        )
        
        (try! (stx-transfer? bid-amount tx-sender (as-contract tx-sender)))
        (map-set auctions item-id (merge auction {highest-bidder: (some tx-sender), highest-bid: bid-amount}))
        (print {event: "place-bid", item-id: item-id, bidder: tx-sender, amount: bid-amount})
        (ok true)
    )
)

(define-public (end-auction (item-id uint))
    (let (
        (auction (unwrap! (get-auction item-id) (err u100)))
        (highest-bidder (get highest-bidder auction))
        (highest-bid (get highest-bid auction))
        (owner (get owner auction))
        (royalty-data (get-royalty item-id))
    )
        (asserts! (>= block-height (get end-block auction)) (err u103))
        
        (match highest-bidder
            winner (match royalty-data
                data (let (
                    (royalty-amount (/ (* highest-bid (get bps data)) u10000))
                    (seller-amount (- highest-bid royalty-amount))
                )
                    (try! (as-contract (stx-transfer? royalty-amount tx-sender (get creator data))))
                    (try! (as-contract (stx-transfer? seller-amount tx-sender owner)))
                )
                (try! (as-contract (stx-transfer? highest-bid tx-sender owner)))
            )
            true
        )
        
        (map-delete auctions item-id)
        (ok true)
    )
)
