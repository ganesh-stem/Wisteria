// dataStructure.js

import { getGlobalData } from './state.js';

export function displayDataStructure() {
    const data = getGlobalData();
    if (!data || data.length === 0) {
        document.getElementById('data-structure-container').innerHTML = '<p class="no-data">No data available. Please upload a CSV file first.</p>';
        return;
    }

    const summaryElement = document.getElementById('data-structure-summary');
    const variablesElement = document.getElementById('data-structure-variables');

    // Display summary
    const numObservations = data.length;
    const numVariables = Object.keys(data[0]).length;
    summaryElement.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Observations:</span>
            <span class="summary-value">${numObservations}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Variables:</span>
            <span class="summary-value">${numVariables}</span>
        </div>
    `;

    // Display variables
    let variablesHTML = '';
    for (const [key, value] of Object.entries(data[0])) {
        const columnData = data.map(row => row[key]).filter(val => val !== null && val !== undefined);
        const dataType = getDataType(columnData);
        const sampleValues = columnData.slice(0, 5).map(formatValue).join(', ');

        variablesHTML += `
            <div class="variable-item">
                <div class="variable-header">
                    <span class="variable-name">${key}</span>
                    <span class="variable-type">${dataType}</span>
                </div>
                <div class="variable-details">
                    <span class="variable-entries">${columnData.length} ${dataType === 'Factor' ? 'levels' : 'entries'}</span>
                    <span class="variable-sample">Sample: ${sampleValues}</span>
                </div>
            </div>
        `;
    }
    variablesElement.innerHTML = variablesHTML;
}

function getDataType(values) {
    if (values.every(v => typeof v === 'number')) return 'Numeric';
    if (values.every(v => typeof v === 'boolean')) return 'Logical';
    if (values.every(v => !isNaN(Date.parse(v)))) return 'Date';
    return 'Factor';
}

function formatValue(value) {
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number') return value.toFixed(2);
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (value instanceof Date) return value.toISOString();
    return String(value);
}