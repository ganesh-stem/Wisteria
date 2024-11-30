export function trainLogisticRegression(X, y, learningRate, iterations) {
    console.log('Training Logistic Regression');
    console.log('Input data shape:', X.length, 'x', X[0].length);
    console.log('Learning rate:', learningRate);
    console.log('Iterations:', iterations);

    const m = X.length;
    const n = X[0].length;
    let theta = new Array(n).fill(0);

    for (let i = 0; i < iterations; i++) {
        const h = X.map(x => sigmoid(dotProduct(x, theta)));
        const gradient = new Array(n).fill(0);
        for (let j = 0; j < n; j++) {
            gradient[j] = (1 / m) * dotProduct(X.map(x => x[j]), h.map((h_i, idx) => h_i - y[idx]));
        }
        theta = theta.map((t, idx) => t - learningRate * gradient[idx]);
    }

    console.log('Logistic Regression training completed');
    return theta;
}

export function predictLogisticRegression(model, X) {
    console.log('Predicting with Logistic Regression');
    console.log('Input data shape:', X.length, 'x', X[0].length);
    const predictions = X.map(x => sigmoid(dotProduct(x, model)) >= 0.5 ? 1 : 0);
    console.log('Predictions:', predictions);
    return predictions;
}

function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
}

function dotProduct(a, b) {
    return a.reduce((sum, ai, i) => sum + ai * b[i], 0);
}