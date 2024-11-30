import { getGlobalData, setGlobalData } from './state.js';
import { populateColumnSelect, displayError } from './utils.js';

let dataSplittingSessionCounter = 0;

export function createNewDataSplittingSession() {
    dataSplittingSessionCounter++;
    const sessionId = `data-splitting-session-${dataSplittingSessionCounter}`;
    const sessionsContainer = document.getElementById('data-splitting-sessions');
    
    if (!sessionsContainer) {
        console.error('Data splitting sessions container not found');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'session data-splitting-session';
    sessionDiv.id = sessionId;
    
    sessionDiv.innerHTML = `
        <div class="session-header">
            <h3>Data Splitting Session ${dataSplittingSessionCounter}</h3>
            <button class="remove-session">Remove</button>
        </div>
        <div>
            <h4>Features</h4>
            <div class="column-select feature-columns"></div>
        </div>
        <div>
            <h4>Target</h4>
            <div class="column-select target-column"></div>
        </div>
        <div>
            <label for="${sessionId}-test-size">Test Size:</label>
            <input type="number" id="${sessionId}-test-size" min="0" max="1" step="0.1" value="0.2">
        </div>
        <button class="perform-data-splitting">Split Data</button>
        <div class="data-splitting-result"></div>
    `;
    
    sessionsContainer.appendChild(sessionDiv);
    
    const globalData = getGlobalData();
    populateColumnSelect(globalData[0], `#${sessionId} .feature-columns`);
    populateColumnSelect(globalData[0], `#${sessionId} .target-column`, false);  // false to allow only single selection
    
    sessionDiv.querySelector('.remove-session').onclick = function() {
        sessionsContainer.removeChild(sessionDiv);
    };
    
    sessionDiv.querySelector('.perform-data-splitting').onclick = function() {
        performDataSplitting(sessionId);
    };

    console.log(`New data splitting session created: ${sessionId}`);
}

function performDataSplitting(sessionId) {
    const globalData = getGlobalData();
    const sessionDiv = document.getElementById(sessionId);
    const featureColumns = Array.from(sessionDiv.querySelectorAll('.feature-columns input:checked')).map(input => input.value);
    const targetColumn = sessionDiv.querySelector('.target-column input:checked')?.value;
    const testSize = parseFloat(sessionDiv.querySelector(`#${sessionId}-test-size`).value);
    const resultDiv = sessionDiv.querySelector('.data-splitting-result');

    if (featureColumns.length === 0) {
        displayError('Please select at least one feature column.', 'data-splitting-error-message');
        return;
    }

    if (!targetColumn) {
        displayError('Please select a target column.', 'data-splitting-error-message');
        return;
    }

    if (isNaN(testSize) || testSize <= 0 || testSize >= 1) {
        displayError('Test size must be a number between 0 and 1.', 'data-splitting-error-message');
        return;
    }

    // Shuffle the data
    const shuffledData = [...globalData].sort(() => Math.random() - 0.5);

    // Split the data
    const splitIndex = Math.floor(shuffledData.length * (1 - testSize));
    const trainData = shuffledData.slice(0, splitIndex);
    const testData = shuffledData.slice(splitIndex);

    // Separate features and target
    const X_train = trainData.map(row => featureColumns.map(col => row[col]));
    const y_train = trainData.map(row => row[targetColumn]);
    const X_test = testData.map(row => featureColumns.map(col => row[col]));
    const y_test = testData.map(row => row[targetColumn]);

    // Store the split data in the global state
    const splitData = {
        X_train,
        y_train,
        X_test,
        y_test,
        featureColumns,
        targetColumn
    };
    setGlobalData(splitData);

    // Display splitting summary
    resultDiv.innerHTML = `
        <h4>Data Splitting Summary:</h4>
        <p>Features: ${featureColumns.join(', ')}</p>
        <p>Target: ${targetColumn}</p>
        <p>Training set size: ${trainData.length}</p>
        <p>Test set size: ${testData.length}</p>
    `;

    console.log('Data split completed');
    console.log('Split data:', splitData);
}

export function initializeDataSplitting() {
    const newDataSplittingSessionButton = document.getElementById('new-data-splitting-session');
    if (newDataSplittingSessionButton) {
        newDataSplittingSessionButton.addEventListener('click', createNewDataSplittingSession);
    } else {
        console.error('New data splitting session button not found');
    }
}