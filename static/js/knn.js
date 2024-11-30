export function trainKNN(X, y, nNeighbors) {
    console.log('Training KNN');
    console.log('Input data shape:', X.length, 'x', X[0].length);
    console.log('Number of neighbors:', nNeighbors);
    return {
        X: X,
        y: y,
        nNeighbors: nNeighbors
    };
}

export function predictKNN(model, X) {
    console.log('Predicting with KNN');
    console.log('Input data shape:', X.length, 'x', X[0].length);
    const predictions = X.map(x => knnPredict(model, x));
    console.log('Predictions:', predictions);
    return predictions;
}

function knnPredict(model, x) {
    const distances = model.X.map((xi, i) => ({
        distance: euclideanDistance(x, xi),
        label: model.y[i]
    }));
    distances.sort((a, b) => a.distance - b.distance);
    const nearestNeighbors = distances.slice(0, model.nNeighbors);
    const sum = nearestNeighbors.reduce((sum, neighbor) => sum + neighbor.label, 0);
    return sum > model.nNeighbors / 2 ? 1 : 0;
}

function euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, ai, i) => sum + Math.pow(ai - b[i], 2), 0));
}