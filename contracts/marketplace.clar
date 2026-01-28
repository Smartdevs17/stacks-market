;; marketplace
;; Minimal marketplace contract

(define-constant err-not-authorized (err u100))


(define-map listings uint {price: uint, owner: principal})

(define-read-only (get-listing (item-id uint))
    (map-get? listings item-id)
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
