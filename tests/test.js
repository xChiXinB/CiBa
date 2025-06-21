const condition = false;

(condition?
    (() => {
        console.log('true');
    }):
    (() => {
        console.log('false');
    }))();

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;