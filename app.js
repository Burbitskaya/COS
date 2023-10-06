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

const canvas0 = document.getElementById('Ampl');
const ctx0 = canvas0.getContext('2d');
const chart0 = new Chart(ctx0, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [],
    },
    options: {
        responsive: false, //Вписывать в размер canvas
    }
});

const canvas1 = document.getElementById('Faz');
const ctx1 = canvas1.getContext('2d');
const chart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [],
    },
    options: {
        responsive: false, //Вписывать в размер canvas
    }
});

function Rebuild(){
    if (chart.data.datasets.length > 0){
        const lastDataset = chart.data.datasets[chart.data.datasets.length - 1];
        const N = lastDataset.data.length;
        let K = document.getElementById('K').value;

        // Получите данные из последнего датасета
        const signal = lastDataset.data;

        const selectedSignal = selectEquallySpacedElements(signal, K);

        // Выполните DFT на выбранных элементах
        const result = discreteFourierTransform(selectedSignal);

        let ampl=[];
        let lbl=[];
        let faz=[];
        result.forEach((value,index)=>{
            lbl.push(index+1);
            ampl.push(Math.sqrt(value.real*value.real+value.imag*value.imag));
            faz.push(Math.atan2(value.real, value.imag));
        })

        chart0.data.labels=lbl;
        chart0.data.datasets=[
            {
                label: 'ampl', //Метка
                data: ampl, //Данные
                backgroundColor: 'red',
            }]
        chart0.update();

        chart1.data.labels=lbl;
        chart1.data.datasets=[
            {
                label: 'faz', //Метка
                data: faz, //Данные
                backgroundColor: 'red',
            }]
        chart1.update();

        let points=[];
        for( let n=0; n<N;n++){
            let sum=ampl[0]/2;
            let t=n/N;
            for  (let R=1; R<K/2-1; R++){
                sum+=ampl[R]*Math.sin(2*Math.PI*R*t+faz[R]);
            }
            points.push(sum);
        }
        chart.data.datasets.push(
            {
                label: "reset",
                data: points,
                borderColor: 'blue',
                borderWidth: 2,
                fill: false
            }
        );
        chart.update();
    }
}

// Функция для выбора K элементов равномерно из N
function selectEquallySpacedElements(inputSignal, K) {
    const N = inputSignal.length;
    let step;
    let selectedSignal = [];
    selectedSignal.push(inputSignal[0])
    if (K > 2) {
        if (N === K) {
            step = 1;
        } else step = Math.floor((N - 2) / (K - 1));
        for (let i = 1; i <= K - 2; i++) {
            selectedSignal.push(inputSignal[i * step]);
        }
    }
    selectedSignal.push(inputSignal[N - 1]);

    return selectedSignal;
}

// Функция для выполнения дискретного преобразования Фурье (DFT)
function discreteFourierTransform(inputSignal) {
    const N = inputSignal.length;
    let outputSignal = new Array(N);
    removeRow();
    for (let k = 0; k < N; k++) {
        let realPart = 0;
        let imagPart = 0;

        for (let n = 0; n < N; n++) {
            const angle = (2 * Math.PI * k * n) / N;
            realPart += inputSignal[n] * Math.cos(angle);
            imagPart += inputSignal[n] * Math.sin(angle);
        }
        realPart=(realPart*2)/N;
        imagPart=(imagPart*2)/N;
        addRow(realPart, imagPart);
        outputSignal[k] = { real: realPart, imag: imagPart };
    }

    return outputSignal;
}

function removeRow(){
    let tbody=document.getElementById("myTable").getElementsByTagName("tbody")[0];
    for(let i=1; i<tbody.rows.length;i++) {
        tbody.deleteRow(i);
    }
}
function addRow(real, imag){
    let tbody=document.getElementById("myTable").getElementsByTagName("tbody")[0];
    let row=document.createElement("tr");
    let td1=document.createElement("td");
    td1.appendChild(document.createTextNode(real));
    let td2=document.createElement("td");
    td2.appendChild(document.createTextNode(imag));
    row.appendChild(td1);
    row.appendChild(td2);
    tbody.appendChild(row);
}

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
    for (let N = 0; N < Ns; N++) {
        t.push(N);
    }
    return t;
}

function generateSinSignal(t, amplitude, frequency, phase) {
    return t.map(function (N) {
        return amplitude * Math.sin((2 * Math.PI * frequency * N) / t.length + (phase * Math.PI / 180));
    });
}

function generateTRSignal(t, amplitude, frequency, phase) {
    return t.map(function (N) {
        return 2 * amplitude / Math.PI * Math.abs(Math.abs(((2 * Math.PI * frequency * N) / t.length  + phase * Math.PI / 180 - Math.PI / 2) % (2 * Math.PI)) - Math.PI) - amplitude;
    });
}

function generateSQSignal(t, amplitude, frequency, phase) {
    return t.map(function (N) {
        if (Math.abs(((2 * Math.PI * frequency * N) / t.length + phase * Math.PI / 180) % (2 * Math.PI)) / (2 * Math.PI) <= 0.5) {
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
    }
}

function Add() {
    let amplitude = document.getElementById('amplitude').value;
    let frequency = document.getElementById('frequency').value;
    let phase = document.getElementById('phase').value;
    let N = document.getElementById('N').value;
    let time = generateTimeArray(N);
    let type = document.getElementById("select").value;
    let info;
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