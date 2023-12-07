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

const canvasC = document.getElementById('Corr');
const ctxC = canvasC.getContext('2d');
const chartC = new Chart(ctxC, {
    type: 'line',
    data: {
        labels: [],
        datasets: [],
    },
    options: {
        responsive: false, //Вписывать в размер canvas
    }
});

//
// const canvas0 = document.getElementById('Ampl');
// const ctx0 = canvas0.getContext('2d');
// const chart0 = new Chart(ctx0, {
//     type: 'bar',
//     data: {
//         labels: [],
//         datasets: [],
//     },
//     options: {
//         responsive: false, //Вписывать в размер canvas
//     }
// });
//
// const canvas1 = document.getElementById('Faz');
// const ctx1 = canvas1.getContext('2d');
// const chart1 = new Chart(ctx1, {
//     type: 'bar',
//     data: {
//         labels: [],
//         datasets: [],
//     },
//     options: {
//         responsive: false, //Вписывать в размер canvas
//     }
// });


function Rebuild() {
    if (chart.data.datasets.length > 0) {
        const lastDataset = chart.data.datasets[chart.data.datasets.length - 1];
        const N = lastDataset.data.length;
        let K = document.getElementById('K').value;
        let min = document.getElementById('minF').value;
        let max = document.getElementById('maxF').value;

        // // Получите данные из последнего датасета
        const signal = lastDataset.data;
        // const selectedSignal = discreteFourierTransform(signal);
        //const result = selectedSignal.slice(0, K);
        // console.log(result);
        //  const result = selectEquallySpacedElements(selectedSignal, K);
        // Выполните DFT на выбранных элементах
        // const selectedSignal=signal.slice(0,K);
        const selectedSignal = selectEquallySpacedElements(signal, K);
        let result = discreteFourierTransform(selectedSignal);

        let ampl = [];
        let lbl = [];
        let lblA = [];
        let faz = [];
        removeRow();

        result.forEach((value, index) => {
            lbl.push(index);
            ampl.push(Math.sqrt(value.real * value.real + value.imag * value.imag));
            lblA.push(index);
            // let myfaz = Math.atan2(value.imag, value.real);
            let myfaz = Math.atan(value.imag ? value.real / value.imag : 0);
            // if (myfaz < 0 && myfaz >= -Math.PI / 2) {
            //     myfaz = -Math.PI / 2 - myfaz;
            // } else if (myfaz >= 0 && myfaz <= Math.PI / 2) {
            //     myfaz = Math.PI / 2 - myfaz;
            // }
            //  else if(myfaz < -Math.PI / 2) {
            //     myfaz = -Math.PI - myfaz;
            // } else if (myfaz > Math.PI / 2) {
            //     myfaz = Math.PI - myfaz;
            // }
            faz.push(myfaz);
            addRow(value.real.toFixed(5), value.imag.toFixed(5));
        })

        if (min) {
            for (let i = 0; i < min; i++) {
                ampl[i] = 0;
                faz[i] = 0;
            }
        }
        if (max) {
            for (let i = result.length - 1; i > max; i--) {
                ampl[i] = 0;
                faz[i] = 0;
            }
        }
        chart0.data.labels = lblA;
        chart0.data.datasets = [
            {
                label: 'ampl', //Метка
                data: ampl, //Данные
                backgroundColor: 'red',
            }]
        chart0.update();

        for (let i = 0; i < faz.length; i++) {
            if (ampl[i] < 0.5) {
                faz[i] = 0;
            }
        }
        chart1.data.labels = lbl;
        chart1.data.datasets = [
            {
                label: 'faz', //Метка
                data: faz, //Данные
                backgroundColor: 'red',
            }]
        chart1.update();

        let points = [];
        for (let n = 0; n < N; n++) {
            let sum = ampl[0] / 2;
            let t = n / N;
            for (let R = 1; R < K / 2; R++) {
                sum += ampl[R] * Math.sin(2 * Math.PI * R * t + faz[R]);
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
    // const N = inputSignal.length;
    // let step;
    // let selectedSignal = [];
    // selectedSignal.push(inputSignal[0])
    // step = Math.floor((N - 1) / (K - 1));
    // for (let i = 1; i <= K - 2; i++) {
    //     selectedSignal.push(inputSignal[(i * step)]);
    // }
    // selectedSignal.push(inputSignal[N - 1]);
    // return selectedSignal;
    const N = inputSignal.length;
    const centerIndex = Math.floor(N / 2); // Индекс центральной точки
    const step = Math.floor(N / K); // Шаг для выбора точек до и после центра
    let selectedSignal = [];

    // Добавляем центральную точку, если K нечетное
    // if (K % 2 === 1) {
    //     selectedSignal.push(inputSignal[centerIndex]);
    // }
    // Добавляем точки до и после центра
    for (let i = K / 2; i >= 1; i--) {
        selectedSignal.push(inputSignal[centerIndex - i * step]);
    }

    // selectedSignal.push(inputSignal[centerIndex]);

    for (let i = 0; i < K / 2; i++) {
        selectedSignal.push(inputSignal[centerIndex + i * step]);
    }

    return selectedSignal;
}

// Функция для выполнения дискретного преобразования Фурье (DFT)
function discreteFourierTransform(inputSignal) {
    const N = inputSignal.length;
    let outputSignal = new Array(N);


    for (let k = 0; k < N; k++) {
        let realPart = 0;
        let imagPart = 0;

        for (let n = 0; n < N; n++) {
            let angle = (2 * Math.PI * k * n) / N;
            realPart += inputSignal[n] * Math.cos(angle);
            imagPart += inputSignal[n] * Math.sin(angle);
        }
        realPart = (realPart * 2) / N;
        imagPart = (imagPart * 2) / N;
        outputSignal[k] = {real: realPart, imag: imagPart};
    }

    return outputSignal;
}

function removeRow() {
    let tbody = document.getElementById("myTable").getElementsByTagName("tbody")[0];
    let len = tbody.rows.length;
    for (let i = 1; i < len; i++) {
        tbody.deleteRow(1);
    }
}

function addRow(real, imag) {
    let tbody = document.getElementById("myTable").getElementsByTagName("tbody")[0];
    let row = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.appendChild(document.createTextNode(real));
    let td2 = document.createElement("td");
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
        return Number(amplitude * Math.sin((2 * Math.PI * frequency * N) / t.length + (phase * Math.PI / 180)));
    });
}

function generateTRSignal(t, amplitude, frequency, phase) {
    return t.map(function (N) {
        return Number(2 * amplitude / Math.PI * Math.abs(Math.abs(((2 * Math.PI * frequency * N) / t.length + phase * Math.PI / 180 - Math.PI / 2) % (2 * Math.PI)) - Math.PI) - amplitude);
    });
}

function generateSQSignal(t, amplitude, frequency, phase) {
    return t.map(function (N) {
        if (Math.abs(((2 * Math.PI * frequency * N) / t.length + phase * Math.PI / 180) % (2 * Math.PI)) / (2 * Math.PI) <= 0.5) {
            return Number(amplitude)
        } else {
            return Number(-amplitude);
        }
    });
}


function Reset() {
    chart.data.labels = [];
    chart.data.datasets = [];
    chart.update();
    removeRow();
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

function AddNoise() {
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

    let B1 = Math.round(Math.max(...info));
    let B2 = B1 / 10 <= 1 ? 1 : Math.floor(Math.random() * (B1 / 10)) + 1;
    for (let i = 0; i < N; i++) {
        let sum = 0;
        for (let j = 50; j <= 70; j++) {
            let randomFactor = Math.random() < 0.5 ? 1 : 0;
            let term =
                Math.pow(-1, randomFactor) * B2 * Math.sin((2 * Math.PI * i * j) / N);
            sum += term;
        }
        info[i] += Number(sum);
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


function GetOrZero(value, index) {
    if (typeof value[index] === "undefined") return 0;
    else return value[index];
}

function fourthDegreeParabola(y) {
    let mul = 1.0 / 2431.0;
    let smoothedValues = [];

    for (let i = 0; i < y.length; i++) {
        let smoothedValue =
            mul *
            (110.0 * GetOrZero(y, i - 6) -
                198.0 * GetOrZero(y, i - 5) -
                135.0 * GetOrZero(y, i - 4) +
                110.0 * GetOrZero(y, i - 3) +
                390.0 * GetOrZero(y, i - 2) +
                600.0 * GetOrZero(y, i - 1) +
                677.0 * y[i] +
                600.0 * GetOrZero(y, i + 1) +
                390.0 * GetOrZero(y, i + 2) +
                110.0 * GetOrZero(y, i + 3) -
                135.0 * GetOrZero(y, i + 4) -
                198.0 * GetOrZero(y, i + 5) +
                110.0 * GetOrZero(y, i + 6));

        smoothedValues.push(smoothedValue);
    }

    return smoothedValues;
}

function movingAverages(y) {
    let window = Number(document.getElementById('window1').value);

    let offset = (window - 1) / 2;
    let smoothedValues = [];

    for (let j = 0; j < y.length; j++) {
        let sum = 0;

        for (let i = j - offset; i <= j + offset; i++) {
            if (i >= 0 && i < y.length) {
                sum += y[i];
            }
        }

        let average = sum / window;
        smoothedValues.push(average);
    }

    return smoothedValues;
}


function movingMedian(y) {
    let mywindow = Number(document.getElementById('window1').value);
    let K1 = Number(document.getElementById('medK').value);

    let window = parseInt(mywindow, 10);
    let K = parseInt(K1, 10);
    if (K >= window) {
        alert("removingElements should be less than window");
    }
    if (window % 2 == 0) {
        alert("window should be odd");
    }

    let offset = (window - 1) / 2;
    let antialiasedValues = [];

    for (let i = 0; i < y.length; i++) {
        let windowValues = [];
        for (let j = i - offset; j <= i + offset; j++) {
            if (j >= 0 && j < y.length) {
                windowValues.push(y[j]);
            }
        }
        windowValues.sort((a, b) => a - b);
        let elementsToKeep = windowValues.length - 2.0 * K;

        if (elementsToKeep > 0) {
            const result =
                windowValues
                    .slice(K, K + elementsToKeep)
                    .reduce((acc, val) => acc + val, 0) /
                elementsToKeep / 1.0;
            antialiasedValues.push(result);
        } else {
            antialiasedValues.push(0);
        }
    }

    return antialiasedValues;
}

function Smooth() {
    let y = chart.data.datasets[chart.data.datasets.length - 1].data;
    let smooth = document.getElementById('smooth').value;
    let info;
    // if(y[0].y){
    //     y=y.y;
    // }
    switch (smooth) {
        case '0':
            info = movingAverages(y);
            break;
        case '1':
            info = fourthDegreeParabola(y);
            break;
        case '2':
            info = movingMedian(y);
            break;
    }

    chart.data.datasets.push(
        {
            label: "сглаженное",
            data: info,
            borderColor: getRandomColor(),
            borderWidth: 2,
            fill: false
        }
    );

    chart.update();

}


function Imagination(type) {
    const canvas = document.getElementById("im");
    const contextIm = canvas.getContext("2d");
    let imgd = contextIm.getImageData(0, 0, canvas.width, canvas.height);
    let pix = imgd.data;
    let width = imgd.width;
    let height = imgd.height;
    let matrix, div, offset;
    switch (type) {
        case 0:
            div = 9;
            offset = 0;
            matrix = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
            break;
        case 1:
            div = 1;
            offset = 255;
            matrix = [[0, 0, 0], [0, -1, 0], [0, 0, 0]];
            break;
        case 2:
            div = 1;
            offset = 0;
            matrix = [[0, -0.2, 0], [-0.2, 1.8, -0.2], [0, -0.2, 0]];
            break;
        case 3:
            div = 1;
            offset = 0;
            matrix = [[-1, 0, 0], [0, -1, 0], [0, 0, 1]];
            break;
    }

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {

            let r = 0, g = 0, b = 0;

            for (let j = 0; j < matrix.length; j++) {
                const yy = Math.min(height - 1, Math.max(0, y + j - Math.floor(matrix.length / 2)));
                for (let k = 0; k < matrix[j].length; k++) {
                    const xx = Math.min(width - 1, Math.max(0, x + k - Math.floor(matrix.length / 2)));

                    r += pix[4 * (yy * width + xx)] * matrix[j][k];
                    g += pix[4 * (yy * width + xx) + 1] * matrix[j][k];
                    b += pix[4 * (yy * width + xx) + 2] * matrix[j][k];
                }
            }

            r = Math.min(255, Math.max(0, offset + (r / div))) & 0xFF;
            g = Math.min(255, Math.max(0, offset + (g / div))) & 0xFF;
            b = Math.min(255, Math.max(0, offset + (b / div))) & 0xFF;

            imgd.data[4 * (y * width + x)] = r;
            imgd.data[4 * (y * width + x) + 1] = g;
            imgd.data[4 * (y * width + x) + 2] = b;


        }
    }
    contextIm.putImageData(imgd, 0, 0);
    canvas1Data = getCanvasData(contextIm, canvas.width, canvas.height);
}

let canvas1Data, canvas2Data, paddedCanvas1Data;

function handleImageS(event) {
    const imageFileS = event.target.files[0];
    const canvas = document.getElementById("ims");
    const context = canvas.getContext("2d");

    const img = new Image();
    img.src = URL.createObjectURL(imageFileS);
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas2Data = getCanvasData(context, canvas.width, canvas.height);
    };
}

function handleImageL(event) {
    const imageFileL = event.target.files[0];
    const canvas = document.getElementById("im");
    const context = canvas.getContext("2d");

    const img = new Image();
    img.src = URL.createObjectURL(imageFileL);
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas1Data = getCanvasData(context, canvas.width, canvas.height);
    };
}

// Функция для получения данных из канваса
function getCanvasData(ctx, width, height) {

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const data = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4;
            const red = pixels[pixelIndex];
            const green = pixels[pixelIndex + 1];
            const blue = pixels[pixelIndex + 2];
            row.push(Math.floor(0.299 * red + 0.587 * green + 0.114 * blue));
        }
        data.push(row);
    }

    return data;
}

function getCanvasDataWithPadding() {
    // Создание нового массива с добавленным отступом
    const paddedData = [];
    let width = canvas1Data[0].length;
    let height = canvas1Data.length;

    let paddingw = canvas2Data[0].length;
    let paddingh = canvas2Data.length;
    // Добавление верхнего отступа
    for (let i = 0; i < paddingh; i++) {
        const row = Array.from({length: width + paddingw * 2}).fill(0);
        paddedData.push(row);
    }

    // Добавление самих данных из канваса
    for (let y = 0; y < height; y++) {
        const row = [];
        // Добавление левого отступа
        row.push(...Array.from({length: paddingw}).fill(0));

        // Добавление данных из канваса
        for (let x = 0; x < width; x++) {
            row.push(canvas1Data[y][x]);
        }

        // Добавление правого отступа
        row.push(...Array.from({length: paddingw}).fill(0));

        paddedData.push(row);
    }

    // Добавление нижнего отступа
    for (let i = 0; i < paddingh; i++) {
        const row = Array.from({length: width + paddingw * 2}).fill(0);
        paddedData.push(row);
    }

    return paddedData;
}

const numWorkers = 8;
const workers = Array(numWorkers).fill(null);// Массив воркеров


const progressBar = document.getElementById('progress');
function Stop2d(){
    for (let i = 0; i < workers.length; i++) {
        if(workers[i]) {
            workers[i].terminate();
            workers[i] = null;
        }
    }
    progressBar.setAttribute('value', 0);
}

function Correlation2d() {
    Stop2d();
        if (canvas1Data && canvas2Data) {
            if (canvas2Data.length > canvas1Data.length || canvas2Data[0].length > canvas1Data[0].length) {
                alert("Второе изображение должно быть больше первого");
                return;
            } else {
                paddedCanvas1Data = getCanvasDataWithPadding();
            }
        } else {
            alert("Загрузите изображения");
            return;
        }

        const numRows = paddedCanvas1Data.length - canvas2Data.length;
        const numCols = paddedCanvas1Data[0].length - canvas2Data[0].length;

        progressBar.setAttribute('max', numRows * numCols);
        progressBar.setAttribute('value', 0);


        const results = Array.from({length: numRows}, () => Array(numCols).fill(null)); // Массив результатов
    let n=0;
        // Создание и инициализация воркеров
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker('calculateCorrelation.js');
            worker.postMessage({
                paddedCanvas1Data,
                canvas2Data,
            });

            worker.onmessage = function (event) {
                if(event.data.correlation!==undefined){
                    n++;
                    progressBar.setAttribute('value', n);
                    results[event.data.i][event.data.j] = event.data.correlation;
                    if(n===numRows*numCols){
                        Draw(results);
                    }
                }
            };
            workers[i]=worker;
        }
        // Распределение задач между воркерами
        let workerIndex = 0;
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                const worker = workers[workerIndex];
                worker.postMessage({
                    i,
                    j,
                });
            }
            workerIndex = (workerIndex + 1) % numWorkers; // Переключение между воркерами
        }
    }

    function Draw(result) {
        canvas0.width = result[0].length;
        canvas0.height = result.length;
        const imageData = ctx0.createImageData(result[0].length, result.length);
        const data = imageData.data;

        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < result[0].length; j++) {

                const pixelIndex = ((i * result[0].length) + j) * 4;
                const value = result[i][j];
                data[pixelIndex] = value; // Красный канал
                data[pixelIndex + 1] = value; // Зеленый канал
                data[pixelIndex + 2] = value; // Синий канал
                data[pixelIndex + 3] = 255; // Альфа-канал
            }
        }

        ctx0.putImageData(imageData, 0, 0);
    }

    const canvas0 = document.getElementById('ims0');
    const ctx0 = canvas0.getContext('2d');

    function corr() {
        if (chart.data.datasets.length > 0) {
            const lastDataset = chart.data.datasets[chart.data.datasets.length - 1].data;
            let start = document.getElementById("minC").value ? document.getElementById('minC').value : 0;
            let end = document.getElementById('maxC').value ? document.getElementById('maxC').value : lastDataset.length - 1;

            const secondSignalData = lastDataset.slice(start, end);
            const secondSignalLength = secondSignalData.length;
            const newDataset = Array(secondSignalLength).fill(0)
            const firstSignalData = [...newDataset, ...lastDataset, ...newDataset];
            let correl = [];
            for (let i = 0; i < firstSignalData.length - secondSignalData.length; i++) {
                correl.push(correlation(i, firstSignalData, secondSignalData));
            }
            chartC.data.labels = Array.from({length: correl.length}, (_, i) => i - secondSignalLength);
            chartC.data.datasets = [
                {
                    label: 'corel', //Метка
                    data: correl, //Данные
                    backgroundColor: 'red',
                }]
            chartC.update();
        }
    }


    function correlation(j, firstSignalData, secondSignalData) {
        function calculateMean(array, start, end) {
            const sum = array.slice(start, end + 1).reduce((acc, val) => acc + val, 0);
            return sum / (end - start + 1);
        }

        const meanSecondSignal = secondSignalData.reduce((acc, val) => acc + val, 0) / secondSignalData.length;
        const meanFirstSignal = calculateMean(firstSignalData, j, j + secondSignalData.length - 1);
        let sum = 0;
        let sum1 = 0;
        let sum2 = 0;
        for (let i = 0; i < secondSignalData.length; i++) {
            sum += (firstSignalData[i + j] - meanFirstSignal) * (secondSignalData[i] - meanSecondSignal);
            sum1 += Math.pow((firstSignalData[i + j] - meanFirstSignal), 2)
            sum2 += Math.pow((secondSignalData[i] - meanSecondSignal), 2);
        }
        let div = Math.sqrt(sum1 * sum2);
        return sum / div;
    }
