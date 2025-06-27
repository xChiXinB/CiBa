let i = 1;
while (i <= 10) {
    const x = crypto.randomUUID();
    setTimeout(() => {
        console.log(x);
    }, 1000);
    i++;
}