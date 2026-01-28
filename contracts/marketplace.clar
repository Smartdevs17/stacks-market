;; marketplace
;; Minimal marketplace contract

(define-constant err-not-authorized (err u100))

(define-public (list-item (item-id uint) (price uint))
    (ok true)
)
