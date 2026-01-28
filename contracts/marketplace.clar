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

(define-public (place-bid (item-id uint) (bid-amount uint))
    (let (
        (auction (unwrap! (get-auction item-id) (err u100)))
        (current-bid (get highest-bid auction))
        (current-bidder (get highest-bidder auction))
    )
        (asserts! (< block-height (get end-block auction)) (err u101)) ;; Auction ended
        (asserts! (> bid-amount current-bid) (err u102)) ;; Bid too low
        
        ;; Return funds to previous bidder if exists
        (match current-bidder
            prev-bidder (try! (as-contract (stx-transfer? current-bid tx-sender prev-bidder)))
            true ;; No previous bidder, do nothing
        )
        
        ;; Lock new bid
        (try! (stx-transfer? bid-amount tx-sender (as-contract tx-sender)))
        
        ;; Update auction
        (map-set auctions item-id (merge auction {highest-bidder: (some tx-sender), highest-bid: bid-amount}))
        (ok true)
    )
)

(define-public (end-auction (item-id uint))
    (let (
        (auction (unwrap! (get-auction item-id) (err u100)))
        (highest-bidder (get highest-bidder auction))
        (highest-bid (get highest-bid auction))
        (owner (get owner auction))
    )
        (asserts! (>= block-height (get end-block auction)) (err u103)) ;; Auction not yet ended
        
        (match highest-bidder
            winner (try! (as-contract (stx-transfer? highest-bid tx-sender owner))) ;; Transfer funds to seller
            true ;; No bids, nothing to transfer
        )
        
        ;; Transfer item (Conceptual: Update owner map or just delete auction as completed)
        ;; For this mock, we just delete the auction.
        (map-delete auctions item-id)
        (ok true)
    )
)
