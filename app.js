const canvas = document.getElementById('Chart');
const ctx = canvas.getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [],
    },
    options: {
        responsive: false, //Вписывать в размер canvas
    }
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateTimeArray(Ns) {
    let t = [];
    for (let N = 0; N < 3 * Ns; N++) {
        t.push(N);
    }
    return t;
}

function generateSinSignal(t, amplitude, frequency, phase) {
    return t.map(function (N) {
        return amplitude * Math.sin((2 * Math.PI * frequency * N) / t.length * 3 + (phase * Math.PI / 180));
    });
}

function generateTRSignal(t, amplitude, frequency, phase) {
    return t.map(function (N) {
        return 2 * amplitude / Math.PI * Math.abs(Math.abs(((2 * Math.PI * frequency * N) / t.length * 3 + phase * Math.PI / 180 - Math.PI / 2) % (2 * Math.PI)) - Math.PI) - amplitude;
    });
}

function generateSQSignal(t, amplitude, frequency, phase) {
    return t.map(function (N) {
        if (Math.abs(((2 * Math.PI * frequency * N) / t.length * 3 + phase * Math.PI / 180) % (2 * Math.PI)) / (2 * Math.PI) <= 0.5) {
            return amplitude
        } else {
            return -amplitude;
        }
    });
}


function Reset() {
    chart.data.labels = [];
    chart.data.datasets = [];
    chart.update();
}

function Sum() {
    if (chart.data.datasets.length > 1) {

        let data = [];

        let maxLength = 0;

        for (let i = 0; i < chart.data.datasets.length; i += 1) {
            if (chart.data.datasets[i].data.length > maxLength) {
                maxLength = chart.data.datasets[i].data.length;
            }
        }

        for (let n = 0; n < maxLength; n += 1) {
            data.push(s(n));
        }

        function s(n) {
            let result = 0;
            for (let i = 0; i < chart.data.datasets.length; i += 1) {
                if (n < chart.data.datasets[i].data.length) {
                    result += Number(chart.data.datasets[i].data[n]);
                }
            }
            return result;
        }

        chart.data.datasets.push(
            {
                label: 'sum', //Метка
                data: data, //Данные
                borderColor: 'red', //Цвет
                borderWidth: 2, //Толщина линии
                fill: false //Не заполнять под графиком
            })

        chart.update();
        //    console.log(data, chart.data.datasets);
    }
}

function Add() {
    console.log(chart);
    let amplitude = document.getElementById('amplitude').value;
    let frequency = document.getElementById('frequency').value;
    let phase = document.getElementById('phase').value;
    let N = document.getElementById('N').value;
    let time = generateTimeArray(N);
    let type = document.getElementById("select").value;
    let info;
    console.log(type);
    switch (type) {
        case '0':
            info = generateSinSignal(time, amplitude, frequency, phase);
            break;
        case '1':
            info = generateTRSignal(time, amplitude, frequency, phase);
            break;
        case '2':
            info = generateSQSignal(time, amplitude, frequency, phase);
            break;
    }

    chart.data.labels = time;
    console.log(chart);
    chart.data.datasets.push(
        {
            label: "",
            data: info,
            borderColor: getRandomColor(),
            borderWidth: 2,
            fill: false
        }
    );
    chart.update();
}