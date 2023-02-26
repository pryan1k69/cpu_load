// Получаем данные
setInterval(() => {
    fetch('/get').then((response) => {
        return response.json();
    }).then((data) => {
        var data_1 = data[0]
        var data_2 = data[1]
        var a = Object.values(data_1)
        var b = Object.values(data_2)
        console.log(a)
        console.log(b)

    });
}, 5050)