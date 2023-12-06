export function calculatePearsonCorrelation(i, j) {
    // Вычисление средних значений для каждой матрицы
    const mean1 = calculateMean(paddedCanvas1Data);
    const mean2 = calculateMean(canvas2Data);
    console.log(mean1,mean2);
    // Вычисление суммы произведений отклонений от средних значений
    let sumProdDeviations = 0;
    let sumSquareDeviations1 = 0;
    let sumSquareDeviations2 = 0;

    for (let row = i; row < canvas2Data.length; row++) {
        for (let col = j; col < canvas2Data[0].length; col++) {
            const deviation1 = paddedCanvas1Data[row][col] - mean1;
            const deviation2 = canvas2Data[row][col] - mean2;
            sumProdDeviations += deviation1 * deviation2;
            sumSquareDeviations1 += deviation1 * deviation1;
            sumSquareDeviations2 += deviation2 * deviation2;
        }
    }

    // Вычисление корреляции Пирсона
    return  sumProdDeviations / Math.sqrt(sumSquareDeviations1 * sumSquareDeviations2);
}

function calculateMean(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;
    let sum = 0;
    let count = 0;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const [red, green, blue, alpha] = matrix[row][col];
            sum += (red + green + blue + alpha);
            count += 4;
        }
    }

    return sum / count;
}