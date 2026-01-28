;; marketplace
;; Minimal marketplace contract

(define-constant err-not-authorized (err u100))


(define-map listings uint {price: uint, owner: principal})

(define-read-only (get-listing (item-id uint))
    (map-get? listings item-id)
)

(define-public (list-item (item-id uint) (price uint))
    (ok true)
)
