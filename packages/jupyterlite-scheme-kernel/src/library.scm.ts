export const library = `

(begin

(define *last-error* #f)

(define (format-error-message msg irritants)
  (if (and (string? msg) (list? irritants))
      (apply format msg irritants)
      msg))

(define (handle-condition con prefix)
  (let ([who (and (who-condition? con) (condition-who con))]
        [msg (and (message-condition? con) (condition-message con))]
        [irr (and (irritants-condition? con) (condition-irritants con))])
    (with-output-to-string
      (lambda ()
        (when prefix
          (display prefix)
          (display ": "))
        (cond
          [msg
           (when who
             (display who)
             (display ": "))
           (display (format-error-message msg irr))]
          [else
            (if (violation? con)
                (begin
                  (display "Violation")
                  (when who
                    (display " in ")
                    (display who))
                  (when irr
                    (display ": ")
                    (display (format-error-message msg irr))))
                (write con))])))))

(define (safe-read port)
  (guard (con
         [(condition? con)
          (set! *last-error* (handle-condition con "Syntax error"))
          #f])
    (read port)))

(define (safe-eval expr env)
  (guard (con
         [(condition? con)
          (set! *last-error* (handle-condition con #f))
          #f])
    (eval expr env)))

(define (get-last-error)
  (let ([err *last-error*])
    (set! *last-error* #f)
    err))

(define (write-to-string value)
  (with-output-to-string
    (lambda ()
      (write value))))

)


`
