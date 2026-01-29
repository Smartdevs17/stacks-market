;; marketplace-v3
;; Advanced marketplace with Dutch Auction support
;;
;; This contract allows for auctions where price decreases linearly over time until sold.

;; Error Codes
(define-constant err-not-authorized (err u100))
(define-constant err-invalid-price (err u101))
(define-constant err-auction-expired (err u102))
(define-constant err-item-already-sold (err u103))
(define-constant err-price-too-low (err u104))


(define-constant contract-owner tx-sender)

;; Dutch Auction Map
;; ID -> {seller, start-price, reserve-price, start-block, duration, decay-rate}

(define-read-only (get-auction (auction-id uint))
    (map-get? dutch-auctions auction-id)
)

(define-read-only (get-current-price (auction-id uint))
    (let (
        (auction (unwrap! (get-auction auction-id) (err u100)))
        (elapsed (- block-height (get start-block auction)))
        (decay (* elapsed (get decay-rate auction)))
        (start-price (get start-price auction))
    )
        ;; Price = Start - Decay, but max(Result, Reserve)
        (if (> decay start-price)
            (ok (get reserve-price auction)) ;; Should allow for 0 or reserve
            (let (
                (calculated-price (- start-price decay))
            )
                (if (< calculated-price (get reserve-price auction))
                    (ok (get reserve-price auction))
                    (ok calculated-price)
                )
            )

(define-read-only (get-dutch-fee (price uint))
    (/ price u100) ;; 1% fee hardcoded for v3
)

(define-public (create-auction (auction-id uint) (start-price uint) (reserve-price uint) (duration uint) (decay-rate uint))
    (begin
        (asserts! (is-none (get-auction auction-id)) err-item-already-sold) ;; Reusing err for ID conflict
        (asserts! (> start-price reserve-price) err-invalid-price)
        
        (map-set dutch-auctions auction-id {
            seller: tx-sender,
            start-price: start-price,
            reserve-price: reserve-price,
            start-block: block-height,
            duration: duration,
            decay-rate: decay-rate
        })
        (print {event: "create-dutch-auction", auction-id: auction-id, start-price: start-price, decay: decay-rate})

(define-public (buy-dutch-auction (auction-id uint))
    (let (
        (auction (unwrap! (get-auction auction-id) (err u100)))
        (current-price-result (unwrap! (get-current-price auction-id) (err u100)))
        (fee (get-dutch-fee current-price-result))
        (seller-amount (- current-price-result fee))
    )
        (asserts! (<= block-height (+ (get start-block auction) (get duration auction))) err-auction-expired)
        
        ;; Transfer Funds
        (try! (stx-transfer? seller-amount tx-sender (get seller auction)))
        (try! (stx-transfer? fee tx-sender contract-owner))
        
        (map-delete dutch-auctions auction-id)
        (print {event: "buy-dutch-auction", auction-id: auction-id, buyer: tx-sender, price: current-price-result, fee: fee})
        (ok true)
    )
)




