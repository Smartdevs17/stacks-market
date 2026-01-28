;; marketplace
;; Minimal marketplace contract

(define-constant err-not-authorized (err u100))


(define-map listings uint {price: uint, owner: principal})
(define-map auctions uint {highest-bidder: (optional principal), highest-bid: uint, end-block: uint, owner: principal})

(define-read-only (get-listing (item-id uint))
    (map-get? listings item-id)
)

(define-read-only (get-auction (item-id uint))
    (map-get? auctions item-id)
)

(define-public (list-item (item-id uint) (price uint))
    (begin
        (map-set listings item-id {price: price, owner: tx-sender})
        (ok true)
    )
)

(define-public (buy-item (item-id uint))
    (let (
        (listing (unwrap! (get-listing item-id) (err u100)))
        (price (get price listing))
        (owner (get owner listing))
    )
        (try! (stx-transfer? price tx-sender owner))
        (map-delete listings item-id)
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
        ;; Ensure item is not already listed or auctioned? Simplified: Overwrite or fresh.
        ;; Assuming fresh item for simplicity, or check ownership if we had NFT trait.
        ;; For now, anyone can start auction for "their" item (by claiming it here).
        (map-set auctions item-id {
            highest-bidder: none,
            highest-bid: start-price,
            end-block: (+ block-height duration),
            owner: tx-sender
        })
        (ok true)
    )
)
