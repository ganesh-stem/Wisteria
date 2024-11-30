class DecisionTreeNode {
    constructor(feature = null, threshold = null, left = null, right = null, value = null) {
        this.feature = feature;
        this.threshold = threshold;
        this.left = left;
        this.right = right;
        this.value = value;
    }
}

function calculateGini(y) {
    const counts = y.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
    const total = y.length;
    return 1 - Object.values(counts).reduce((acc, count) => acc + Math.pow(count / total, 2), 0);
}

function splitData(X, y, feature, threshold) {
    const leftIndices = X.map((x, i) => x[feature] <= threshold ? i : null).filter(i => i !== null);
    const rightIndices = X.map((x, i) => x[feature] > threshold ? i : null).filter(i => i !== null);
    return [
        [leftIndices.map(i => X[i]), leftIndices.map(i => y[i])],
        [rightIndices.map(i => X[i]), rightIndices.map(i => y[i])]
    ];
}

function findBestSplit(X, y) {
    let bestGini = Infinity;
    let bestFeature = null;
    let bestThreshold = null;

    for (let feature = 0; feature < X[0].length; feature++) {
        const values = X.map(x => x[feature]);
        const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
        
        for (let i = 0; i < uniqueValues.length - 1; i++) {
            const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
            const [leftData, rightData] = splitData(X, y, feature, threshold);
            const [X_left, y_left] = leftData;
            const [X_right, y_right] = rightData;
            
            const gini = (y_left.length / y.length) * calculateGini(y_left) +
                         (y_right.length / y.length) * calculateGini(y_right);
            
            if (gini < bestGini) {
                bestGini = gini;
                bestFeature = feature;
                bestThreshold = threshold;
            }
        }
    }

    return [bestFeature, bestThreshold];
}

function buildTree(X, y, depth = 0, maxDepth = Infinity) {
    if (depth === maxDepth || new Set(y).size === 1) {
        const value = y.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        return new DecisionTreeNode(null, null, null, null, value);
    }

    const [feature, threshold] = findBestSplit(X, y);

    if (feature === null) {
        const value = y.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        return new DecisionTreeNode(null, null, null, null, value);
    }

    const [leftData, rightData] = splitData(X, y, feature, threshold);
    const [X_left, y_left] = leftData;
    const [X_right, y_right] = rightData;

    const leftChild = buildTree(X_left, y_left, depth + 1, maxDepth);
    const rightChild = buildTree(X_right, y_right, depth + 1, maxDepth);

    return new DecisionTreeNode(feature, threshold, leftChild, rightChild);
}

export function trainDecisionTree(X, y, maxDepth) {
    console.log('Training Decision Tree');
    console.log('Input data shape:', X.length, 'x', X[0].length);
    console.log('Max depth:', maxDepth);
    return buildTree(X, y, 0, maxDepth);
}

function predictSample(model, x) {
    if (model.value !== null) {
        return Number(Object.keys(model.value).reduce((a, b) => model.value[a] > model.value[b] ? a : b));
    }

    if (x[model.feature] <= model.threshold) {
        return predictSample(model.left, x);
    } else {
        return predictSample(model.right, x);
    }
}

export function predictDecisionTree(model, X) {
    console.log('Predicting with Decision Tree');
    console.log('Input data shape:', X.length, 'x', X[0].length);
    const predictions = X.map(x => predictSample(model, x));
    console.log('Predictions:', predictions);
    return predictions;
}