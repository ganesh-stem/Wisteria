import { trainLogisticRegression, predictLogisticRegression } from './logistic-regression.js';
import { trainKNN, predictKNN } from './knn.js';
import { trainDecisionTree, predictDecisionTree } from './decision-tree.js';
import { trainRandomForest, predictRandomForest } from './random-forest.js';
import { getGlobalData } from './state.js';
import { displayError } from './utils.js';

let mlModelSessionCounter = 0;

export function createNewMLModelSession() {
    mlModelSessionCounter++;
    const sessionId = `ml-model-session-${mlModelSessionCounter}`;
    const sessionsContainer = document.getElementById('ml-models-sessions');
    
    if (!sessionsContainer) {
        console.error('ML models sessions container not found');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'session ml-model-session';
    sessionDiv.id = sessionId;
    
    sessionDiv.innerHTML = `
        <div class="session-header">
            <h3>ML Model Session ${mlModelSessionCounter}</h3>
            <button class="remove-session">Remove</button>
        </div>
        <div>
            <label for="${sessionId}-model-type">Model Type:</label>
            <select id="${sessionId}-model-type">
                <option value="logistic-regression">Logistic Regression</option>
                <option value="knn">K-Nearest Neighbors</option>
                <option value="decision-tree">Decision Tree</option>
                <option value="random-forest">Random Forest</option>
            </select>
        </div>
        <div class="model-params">
            <!-- Model-specific parameters will be dynamically added here -->
        </div>
        <button class="train-model">Train Model</button>
        <div class="model-result"></div>
    `;
    
    sessionsContainer.appendChild(sessionDiv);
    
    sessionDiv.querySelector('.remove-session').onclick = function() {
        sessionsContainer.removeChild(sessionDiv);
    };
    
    sessionDiv.querySelector('.train-model').onclick = function() {
        trainModel(sessionId);
    };

    sessionDiv.querySelector('#' + sessionId + '-model-type').onchange = function() {
        updateModelParams(sessionId);
    };

    updateModelParams(sessionId);

    console.log(`New ML model session created: ${sessionId}`);
}

function updateModelParams(sessionId) {
    const sessionDiv = document.getElementById(sessionId);
    const modelType = sessionDiv.querySelector('#' + sessionId + '-model-type').value;
    const paramsDiv = sessionDiv.querySelector('.model-params');

    let paramsHtml = '';
    switch (modelType) {
        case 'logistic-regression':
            paramsHtml = `
                <div>
                    <label for="${sessionId}-learning-rate">Learning Rate:</label>
                    <input type="number" id="${sessionId}-learning-rate" min="0.001" max="1" step="0.001" value="0.01">
                </div>
                <div>
                    <label for="${sessionId}-iterations">Number of Iterations:</label>
                    <input type="number" id="${sessionId}-iterations" min="100" max="10000" step="100" value="1000">
                </div>
            `;
            break;
        case 'knn':
            paramsHtml = `
                <div>
                    <label for="${sessionId}-n-neighbors">Number of Neighbors:</label>
                    <input type="number" id="${sessionId}-n-neighbors" min="1" max="20" step="1" value="5">
                </div>
            `;
            break;
        case 'decision-tree':
            paramsHtml = `
                <div>
                    <label for="${sessionId}-max-depth">Max Depth:</label>
                    <input type="number" id="${sessionId}-max-depth" min="1" max="20" step="1" value="5">
                </div>
            `;
            break;
        case 'random-forest':
            paramsHtml = `
                <div>
                    <label for="${sessionId}-n-estimators">Number of Estimators:</label>
                    <input type="number" id="${sessionId}-n-estimators" min="10" max="200" step="10" value="100">
                </div>
                <div>
                    <label for="${sessionId}-max-depth">Max Depth:</label>
                    <input type="number" id="${sessionId}-max-depth" min="1" max="20" step="1" value="5">
                </div>
            `;
            break;
    }
    paramsDiv.innerHTML = paramsHtml;
}

function trainModel(sessionId) {
    const splitData = getGlobalData();
    console.log('Retrieved split data:', splitData);
    const sessionDiv = document.getElementById(sessionId);
    const modelType = sessionDiv.querySelector('#' + sessionId + '-model-type').value;
    const resultDiv = sessionDiv.querySelector('.model-result');

    if (!splitData || !splitData.X_train || !splitData.y_train || !splitData.X_test || !splitData.y_test) {
        displayError('Please split the data into features and target first.', 'ml-models-error-message');
        return;
    }

    console.log(`Training ${modelType} model...`);

    let model, y_pred_train, y_pred_test;
    try {
        switch (modelType) {
            case 'logistic-regression':
                const learningRate = parseFloat(sessionDiv.querySelector('#' + sessionId + '-learning-rate').value);
                const iterations = parseInt(sessionDiv.querySelector('#' + sessionId + '-iterations').value);
                model = trainLogisticRegression(splitData.X_train, splitData.y_train, learningRate, iterations);
                y_pred_train = predictLogisticRegression(model, splitData.X_train);
                y_pred_test = predictLogisticRegression(model, splitData.X_test);
                break;
            case 'knn':
                const nNeighbors = parseInt(sessionDiv.querySelector('#' + sessionId + '-n-neighbors').value);
                model = trainKNN(splitData.X_train, splitData.y_train, nNeighbors);
                y_pred_train = predictKNN(model, splitData.X_train);
                y_pred_test = predictKNN(model, splitData.X_test);
                break;
            case 'decision-tree':
                const maxDepth = parseInt(sessionDiv.querySelector('#' + sessionId + '-max-depth').value);
                model = trainDecisionTree(splitData.X_train, splitData.y_train, maxDepth);
                y_pred_train = predictDecisionTree(model, splitData.X_train);
                y_pred_test = predictDecisionTree(model, splitData.X_test);
                break;
            case 'random-forest':
                const nEstimators = parseInt(sessionDiv.querySelector('#' + sessionId + '-n-estimators').value);
                const rfMaxDepth = parseInt(sessionDiv.querySelector('#' + sessionId + '-max-depth').value);
                model = trainRandomForest(splitData.X_train, splitData.y_train, nEstimators, rfMaxDepth);
                y_pred_train = predictRandomForest(model, splitData.X_train);
                y_pred_test = predictRandomForest(model, splitData.X_test);
                break;
        }

        console.log('Model training completed');
        console.log('y_pred_train:', y_pred_train);
        console.log('y_pred_test:', y_pred_test);

        // Convert string labels to numbers if necessary
        const y_train = splitData.y_train.map(Number);
        const y_test = splitData.y_test.map(Number);

        // Calculate metrics
        const trainAccuracy = accuracy(y_train, y_pred_train);
        const testAccuracy = accuracy(y_test, y_pred_test);
        const trainF1 = f1Score(y_train, y_pred_train);
        const testF1 = f1Score(y_test, y_pred_test);

        console.log('Metrics calculated:');
        console.log('Train Accuracy:', trainAccuracy);
        console.log('Test Accuracy:', testAccuracy);
        console.log('Train F1 Score:', trainF1);
        console.log('Test F1 Score:', testF1);

        // Display results
        resultDiv.innerHTML = `
            <h4>${modelType.replace('-', ' ')} Results:</h4>
            <p>Train Accuracy: ${(trainAccuracy * 100).toFixed(2)}%</p>
            <p>Test Accuracy: ${(testAccuracy * 100).toFixed(2)}%</p>
            <p>Train F1 Score: ${trainF1.toFixed(4)}</p>
            <p>Test F1 Score: ${testF1.toFixed(4)}</p>
        `;

        console.log(`${modelType} training and evaluation completed`);
    } catch (error) {
        console.error(`Error in ${modelType} training or prediction:`, error);
        displayError(`An error occurred while training or evaluating the ${modelType} model. Please check the console for more details.`, 'ml-models-error-message');
    }
}

function accuracy(y_true, y_pred) {
    const correct = y_true.filter((y, i) => y === y_pred[i]).length;
    return correct / y_true.length;
}

function f1Score(y_true, y_pred) {
    let tp = 0, fp = 0, fn = 0;
    for (let i = 0; i < y_true.length; i++) {
        if (y_true[i] === 1 && y_pred[i] === 1) tp++;
        if (y_true[i] === 0 && y_pred[i] === 1) fp++;
        if (y_true[i] === 1 && y_pred[i] === 0) fn++;
    }
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    return 2 * (precision * recall) / (precision + recall) || 0;
}

export function initializeMLModels() {
    const newMLModelSessionButton = document.getElementById('new-ml-model-session');
    if (newMLModelSessionButton) {
        newMLModelSessionButton.addEventListener('click', createNewMLModelSession);
    } else {
        console.error('New ML model session button not found');
    }
}