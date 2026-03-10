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
(define-map dutch-auctions
  uint
  {
    seller: principal,
    start-price: uint,
    reserve-price: uint,
    start-block: uint,
    duration: uint,
    decay-rate: uint
  }
)

(define-read-only (get-auction (auction-id uint))
  (map-get? dutch-auctions auction-id)
)

(define-read-only (get-current-price (auction-id uint))
  (let (
        (auction (unwrap! (get-auction auction-id) err-not-authorized))
        (elapsed (- block-height (get start-block auction)))
        (decay (* elapsed (get decay-rate auction)))
        (start-price (get start-price auction))
       )
    ;; Price = Start - Decay, but floored at reserve-price
    (if (> decay start-price)
        (ok (get reserve-price auction))
        (let ((calculated-price (- start-price decay)))
          (if (< calculated-price (get reserve-price auction))
              (ok (get reserve-price auction))
              (ok calculated-price)
          )
        )
    )
  )
)

(define-read-only (get-dutch-fee (price uint))
  (/ price u100) ;; 1% fee
)

(define-public (create-auction
  (auction-id uint)
  (start-price uint)
  (reserve-price uint)
  (duration uint)
  (decay-rate uint)
)
  (begin
    (asserts! (is-none (get-auction auction-id)) err-item-already-sold)
    (asserts! (> start-price reserve-price) err-invalid-price)

    (map-set dutch-auctions auction-id
      {
        seller: tx-sender,
        start-price: start-price,
        reserve-price: reserve-price,
        start-block: block-height,
        duration: duration,
        decay-rate: decay-rate
      }
    )

    (print {
      event: "create-dutch-auction",
      auction-id: auction-id,
      start-price: start-price,
      decay: decay-rate
    })

    (ok true)
  )
)

(define-public (buy-dutch-auction (auction-id uint))
  (let (
        (auction (unwrap! (get-auction auction-id) err-not-authorized))
        (current-price (unwrap! (get-current-price auction-id) err-not-authorized))
        (fee (get-dutch-fee current-price))
        (seller-amount (- current-price fee))
       )
    (asserts!
      (<= block-height (+ (get start-block auction) (get duration auction)))
      err-auction-expired
    )

    ;; Transfer funds
    (try! (stx-transfer? seller-amount tx-sender (get seller auction)))
    (try! (stx-transfer? fee tx-sender contract-owner))

    (map-delete dutch-auctions auction-id)

    (print {
      event: "buy-dutch-auction",
      auction-id: auction-id,
      buyer: tx-sender,
      price: current-price,
      fee: fee
    })

    (ok true)
  )
)
