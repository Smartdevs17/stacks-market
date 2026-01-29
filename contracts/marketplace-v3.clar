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
        )
    )
)


