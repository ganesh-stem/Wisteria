import { getGlobalData, setGlobalData } from './state.js';
import { populateColumnSelect, displayError } from './utils.js';

let encodingSessionCounter = 0;

export function createNewEncodingSession() {
    encodingSessionCounter++;
    const sessionId = `encoding-session-${encodingSessionCounter}`;
    const sessionsContainer = document.getElementById('encoding-sessions');
    
    if (!sessionsContainer) {
        console.error('Encoding sessions container not found');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'session encoding-session';
    sessionDiv.id = sessionId;
    
    sessionDiv.innerHTML = `
        <div class="session-header">
            <h3>Encoding Session ${encodingSessionCounter}</h3>
            <button class="remove-session">Remove</button>
        </div>
        <div class="column-select encoding-columns"></div>
        <select class="encoding-method">
            <option value="one-hot">One-Hot Encoding</option>
            <option value="label">Label Encoding</option>
        </select>
        <button class="perform-encoding">Perform Encoding</button>
        <div class="encoding-result"></div>
    `;
    
    sessionsContainer.appendChild(sessionDiv);
    
    const globalData = getGlobalData();
    populateColumnSelect(globalData[0], `#${sessionId} .encoding-columns`);
    
    sessionDiv.querySelector('.remove-session').onclick = function() {
        sessionsContainer.removeChild(sessionDiv);
    };
    
    sessionDiv.querySelector('.perform-encoding').onclick = function() {
        performEncoding(sessionId);
    };

    console.log(`New encoding session created: ${sessionId}`);
}

function performEncoding(sessionId) {
    const globalData = getGlobalData();
    const sessionDiv = document.getElementById(sessionId);
    const selectedColumns = Array.from(sessionDiv.querySelectorAll('.encoding-columns input:checked')).map(input => input.value);
    const encodingMethod = sessionDiv.querySelector('.encoding-method').value;
    const resultDiv = sessionDiv.querySelector('.encoding-result');

    if (selectedColumns.length === 0) {
        displayError('Please select at least one column for encoding.', 'encoding-error-message');
        return;
    }

    let encodedData = [...globalData];
    let encodingSummary = {};

    selectedColumns.forEach(column => {
        if (encodingMethod === 'one-hot') {
            const { data, summary } = performOneHotEncoding(encodedData, column);
            encodedData = data;
            encodingSummary[column] = summary;
        } else if (encodingMethod === 'label') {
            const { data, summary } = performLabelEncoding(encodedData, column);
            encodedData = data;
            encodingSummary[column] = summary;
        }
    });

    setGlobalData(encodedData);

    // Display encoding summary
    resultDiv.innerHTML = `
        <h4>Encoding Summary:</h4>
        <ul>
            ${Object.entries(encodingSummary).map(([column, summary]) => `
                <li>${column}: ${summary}</li>
            `).join('')}
        </ul>
    `;

    console.log('Encoding completed');
}


function performOneHotEncoding(data, column) {
    const uniqueValues = [...new Set(data.map(row => row[column]).filter(value => value !== null))];
    const encodedData = data.map(row => {
        const encodedRow = { ...row };
        if (row[column] === null) {
            uniqueValues.forEach(value => {
                encodedRow[`${column}_${value}`] = null;
            });
        } else {
            uniqueValues.forEach(value => {
                encodedRow[`${column}_${value}`] = row[column] === value ? 1 : 0;
            });
        }
        delete encodedRow[column];
        return encodedRow;
    });

    return {
        data: encodedData,
        summary: `One-hot encoded into ${uniqueValues.length} new columns. Null values preserved.`
    };
}

function performLabelEncoding(data, column) {
    const uniqueValues = [...new Set(data.map(row => row[column]).filter(value => value !== null))];
    const labelMap = {};
    uniqueValues.forEach((value, index) => {
        labelMap[value] = index;
    });

    const encodedData = data.map(row => ({
        ...row,
        [column]: row[column] === null ? null : labelMap[row[column]]
    }));

    return {
        data: encodedData,
        summary: `Label encoded ${uniqueValues.length} unique values. Null values preserved.`
    };
}

export function initializeEncoding() {
    const newEncodingSessionButton = document.getElementById('new-encoding-session');
    if (newEncodingSessionButton) {
        newEncodingSessionButton.addEventListener('click', createNewEncodingSession);
    } else {
        console.error('New encoding session button not found');
    }
}