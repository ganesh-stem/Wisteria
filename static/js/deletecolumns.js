import { getGlobalData, setGlobalData } from './state.js';
import { populateColumnSelect, displayError } from './utils.js';
import { updateCharts } from './chartgeneration.js';

let deleteColumnsSessionCounter = 0;

export function createNewDeleteColumnsSession() {
    deleteColumnsSessionCounter++;
    const sessionId = `delete-columns-session-${deleteColumnsSessionCounter}`;
    const sessionsContainer = document.getElementById('delete-columns-sessions');
    
    if (!sessionsContainer) {
        console.error('Delete columns sessions container not found');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'session delete-columns-session';
    sessionDiv.id = sessionId;
    
    sessionDiv.innerHTML = `
        <div class="session-header">
            <h3>Delete Columns Session ${deleteColumnsSessionCounter}</h3>
            <button class="remove-session">Remove</button>
        </div>
        <div class="column-select delete-columns"></div>
        <button class="perform-delete-columns">Delete Selected Columns</button>
        <div class="delete-columns-result"></div>
    `;
    
    sessionsContainer.appendChild(sessionDiv);
    
    const globalData = getGlobalData();
    populateColumnSelect(globalData[0], `#${sessionId} .delete-columns`);
    
    sessionDiv.querySelector('.remove-session').onclick = function() {
        sessionsContainer.removeChild(sessionDiv);
    };
    
    sessionDiv.querySelector('.perform-delete-columns').onclick = function() {
        performDeleteColumns(sessionId);
    };

    console.log(`New delete columns session created: ${sessionId}`);
}

function performDeleteColumns(sessionId) {
    const globalData = getGlobalData();
    const sessionDiv = document.getElementById(sessionId);
    const selectedColumns = Array.from(sessionDiv.querySelectorAll('.delete-columns input:checked')).map(input => input.value);
    const resultDiv = sessionDiv.querySelector('.delete-columns-result');

    if (selectedColumns.length === 0) {
        displayError('Please select at least one column to delete.', 'delete-columns-error-message');
        return;
    }

    let updatedData = globalData.map(row => {
        const newRow = { ...row };
        selectedColumns.forEach(column => {
            delete newRow[column];
        });
        return newRow;
    });

    setGlobalData(updatedData);
    updateCharts(); // This will update all charts

    // Display deletion summary
    resultDiv.innerHTML = `
        <h4>Deletion Summary:</h4>
        <p>${selectedColumns.length} column(s) deleted:</p>
        <ul>
            ${selectedColumns.map(column => `<li>${column}</li>`).join('')}
        </ul>
    `;

    // Update column selects in all sessions
    updateAllColumnSelects();
}

function updateAllColumnSelects() {
    const globalData = getGlobalData();
    if (globalData.length > 0) {
        const columns = Object.keys(globalData[0]);
        document.querySelectorAll('.column-select').forEach(select => {
            populateColumnSelect(globalData[0], `#${select.closest('.session').id} .column-select`);
        });
    }
}

export function initializeDeleteColumns() {
    const newDeleteColumnsSessionButton = document.getElementById('new-delete-columns-session');
    if (newDeleteColumnsSessionButton) {
        newDeleteColumnsSessionButton.addEventListener('click', createNewDeleteColumnsSession);
    } else {
        console.error('New delete columns session button not found');
    }
}