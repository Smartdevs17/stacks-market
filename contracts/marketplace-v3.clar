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
