import { getGlobalData, setGlobalData } from './state.js';
import { populateColumnSelect, displayError } from './utils.js';
import { updateCharts } from './chartgeneration.js';

let imputationSessionCounter = 0;

export function createNewImputationSession() {
    imputationSessionCounter++;
    const sessionId = `imputation-session-${imputationSessionCounter}`;
    const sessionsContainer = document.getElementById('imputation-sessions');
    
    if (!sessionsContainer) {
        console.error('Imputation sessions container not found');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'session imputation-session';
    sessionDiv.id = sessionId;
    
    sessionDiv.innerHTML = `
        <div class="session-header">
            <h3>Imputation Session ${imputationSessionCounter}</h3>
            <button class="remove-session">Remove</button>
        </div>
        <div class="column-select imputation-columns"></div>
        <select class="imputation-method">
            <option value="mean">Mean</option>
            <option value="median">Median</option>
            <option value="mode">Mode</option>
        </select>
        <button class="perform-imputation">Perform Imputation</button>
        <div class="imputation-result"></div>
    `;
    
    sessionsContainer.appendChild(sessionDiv);
    
    const globalData = getGlobalData();
    populateColumnSelect(globalData[0], `#${sessionId} .imputation-columns`);
    
    sessionDiv.querySelector('.remove-session').onclick = function() {
        sessionsContainer.removeChild(sessionDiv);
    };
    
    sessionDiv.querySelector('.perform-imputation').onclick = function() {
        performImputation(sessionId);
    };

    console.log(`New imputation session created: ${sessionId}`);
}

function performImputation(sessionId) {
    const globalData = getGlobalData();
    const sessionDiv = document.getElementById(sessionId);
    const selectedColumns = Array.from(sessionDiv.querySelectorAll('.imputation-columns input:checked')).map(input => input.value);
    const imputationMethod = sessionDiv.querySelector('.imputation-method').value;
    const resultDiv = sessionDiv.querySelector('.imputation-result');

    if (selectedColumns.length === 0) {
        displayError('Please select at least one column for imputation.', 'imputation-error-message');
        return;
    }

    let imputedData = [...globalData];
    let imputationSummary = {};

    selectedColumns.forEach(column => {
        const columnData = globalData.map(row => row[column]);
        const nonNullData = columnData.filter(value => value !== null && value !== undefined && value !== '');
        let imputationValue;

        switch (imputationMethod) {
            case 'mean':
                const numericData = nonNullData.filter(value => !isNaN(Number(value))).map(Number);
                imputationValue = d3.mean(numericData);
                break;
            case 'median':
                const sortedNumericData = nonNullData.filter(value => !isNaN(Number(value))).map(Number).sort((a, b) => a - b);
                imputationValue = d3.median(sortedNumericData);
                break;
            case 'mode':
                imputationValue = mode(nonNullData);
                break;
        }

        let imputedCount = 0;
        imputedData = imputedData.map(row => {
            if (row[column] === null || row[column] === undefined || row[column] === '') {
                imputedCount++;
                return { ...row, [column]: imputationValue };
            }
            return row;
        });

        imputationSummary[column] = {
            method: imputationMethod,
            value: imputationValue,
            count: imputedCount
        };
    });

    setGlobalData(imputedData);
    updateCharts(); // This will update all charts

    // Display imputation summary
    resultDiv.innerHTML = `
        <h4>Imputation Summary:</h4>
        <ul>
            ${Object.entries(imputationSummary).map(([column, summary]) => `
                <li>${column}: ${summary.count} values imputed with ${summary.method} (${formatImputationValue(summary.value)})</li>
            `).join('')}
        </ul>
    `;
}

function mode(arr) {
    if (arr.length === 0) return undefined;
    const counts = new Map();
    let maxCount = 0;
    let maxValue;

    for (const value of arr) {
        const count = (counts.get(value) || 0) + 1;
        counts.set(value, count);
        if (count > maxCount) {
            maxCount = count;
            maxValue = value;
        }
    }

    return maxValue;
}

function formatImputationValue(value) {
    if (value === undefined || value === null) {
        return 'N/A';
    } else if (typeof value === 'number') {
        return value.toFixed(2);
    } else {
        return value.toString();
    }
}