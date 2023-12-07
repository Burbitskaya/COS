
let paddedCanvas1Data, canvas2Data,  mean2 ;
self.onmessage = function(event) {
    if(event.data.canvas2Data) {
        const { paddedCanvas1Data: paddedCanvas1, canvas2Data: canvas2} = event.data;
        //  importScripts('app.js');
        canvas2Data = canvas2;
        paddedCanvas1Data = paddedCanvas1;
        mean2 = calculateMean(canvas2Data, 0, 0, canvas2Data.length, canvas2Data[0].length);
    }else {
        //   try {
       const i = event.data.i;
       const j = event.data.j;
        //
         const correlation = calculatePearsonCorrelation(i, j);
    //    console.log(correlation)
       self.postMessage({i,j,correlation});
    }
 //   } catch (error) {
 //       console.error(error);
 //   }
};

function calculatePearsonCorrelation(i, j) {
    // Вычисление средних значений для каждой матрицы
    const mean1 = calculateMean(paddedCanvas1Data, i, j, canvas2Data.length+i, canvas2Data[0].length+j);

    // Вычисление суммы произведений отклонений от средних значений
    let sumProdDeviations = 0;
    let sumSquareDeviations1 = 0;
    let sumSquareDeviations2 = 0;

    for (let row = 0; row < canvas2Data.length; row++) {
        for (let col = 0; col < canvas2Data[0].length; col++) {
            const deviation1 = paddedCanvas1Data[row+i][col+j] - mean1;
            const deviation2 = canvas2Data[row][col] - mean2;
            sumProdDeviations += deviation1 * deviation2;
            sumSquareDeviations1 += deviation1 * deviation1;
            sumSquareDeviations2 += deviation2 * deviation2;
        }
    }

    // Вычисление корреляции Пирсона
    const div=Math.sqrt(sumSquareDeviations1 * sumSquareDeviations2);

    if(div>0){
            return (Math.abs((sumProdDeviations / div) * 255));
    }
    else return 0;

}

function calculateMean(array, startRow, startCol, endRow, endCol) {
    let sum = 0;
    let count = 0;
    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            sum += array[row][col];
            count++;
        }
    }
    return sum / count;
}