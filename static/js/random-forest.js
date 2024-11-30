import { trainDecisionTree, predictDecisionTree } from './decision-tree.js';

function bootstrapSample(X, y) {
    const n = X.length;
    const indices = Array.from({ length: n }, () => Math.floor(Math.random() * n));
    return [
        indices.map(i => X[i]),
        indices.map(i => y[i])
    ];
}

function selectRandomFeatures(X, n_features) {
    const features = Array.from({ length: X[0].length }, (_, i) => i);
    const selectedFeatures = [];
    for (let i = 0; i < n_features; i++) {
        const index = Math.floor(Math.random() * features.length);
        selectedFeatures.push(features[index]);
        features.splice(index, 1);
    }
    return X.map(x => selectedFeatures.map(f => x[f]));
}

export function trainRandomForest(X, y, nEstimators, maxDepth) {
    console.log('Training Random Forest');
    console.log('Input data shape:', X.length, 'x', X[0].length);
    console.log('Number of estimators:', nEstimators);
    console.log('Max depth:', maxDepth);

    const n_features = Math.floor(Math.sqrt(X[0].length));
    const forest = [];

    for (let i = 0; i < nEstimators; i++) {
        const [X_sample, y_sample] = bootstrapSample(X, y);
        const X_features = selectRandomFeatures(X_sample, n_features);
        const tree = trainDecisionTree(X_features, y_sample, maxDepth);
        forest.push(tree);
    }

    return {
        forest: forest,
        n_features: n_features
    };
}

export function predictRandomForest(model, X) {
    console.log('Predicting with Random Forest');
    console.log('Input data shape:', X.length, 'x', X[0].length);

    const predictions = X.map(x => {
        const treePredictions = model.forest.map(tree => {
            const x_features = selectRandomFeatures([x], model.n_features)[0];
            return predictDecisionTree(tree, [x_features])[0];
        });
        
        const sum = treePredictions.reduce((a, b) => a + b, 0);
        return sum > treePredictions.length / 2 ? 1 : 0;
    });

    console.log('Random Forest predictions:', predictions);
    return predictions;
}