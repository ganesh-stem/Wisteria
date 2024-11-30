// sessionmanagement.js
import { populateColumnSelect } from './utils.js';
import { getGlobalData } from './state.js';
import { performGroupBy } from './groupby.js';
import { createScatterPlots } from './scatterplot.js';
import { updateCharts } from './chartgeneration.js';


let sessionCounter = 0;
let groupBySessionCounter = 0;
let scatterSessionCounter = 0;
let distributionSessionCounter = 0;

export function createNewDistributionSession() {
    distributionSessionCounter++;
    const sessionId = `distribution-session-${distributionSessionCounter}`;
    const sessionsContainer = document.getElementById('distribution-sessions');
    
    if (!sessionsContainer) {
        console.error('Distribution sessions container not found');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'session distribution-session';
    sessionDiv.id = sessionId;
    
    sessionDiv.innerHTML = `
        <div class="session-header">
            <h3>Distribution Session ${distributionSessionCounter}</h3>
            <button class="remove-session">Remove</button>
        </div>
        <div class="column-select"></div>
        <div>
            <input type="checkbox" id="${sessionId}-include-null" class="include-null">
            <label for="${sessionId}-include-null">Include Null Values</label>
        </div>
        <label for="${sessionId}-chart-type">Chart Type:</label>
        <select id="${sessionId}-chart-type" class="chart-type">
            <option value="bar">Bar Plot</option>
            <option value="kde">KDE Plot</option>
        </select>
        <button class="update-chart">Update Chart</button>
        <div class="grid-container"></div>
    `;
    
    sessionsContainer.appendChild(sessionDiv);
    
    const globalData = getGlobalData();
    populateColumnSelect(globalData[0], `#${sessionId} .column-select`);
    
    sessionDiv.querySelector('.remove-session').onclick = function() {
        sessionsContainer.removeChild(sessionDiv);
    };
    
    sessionDiv.querySelector('.update-chart').onclick = function() {
        updateCharts(sessionId);
    };

    console.log(`New distribution session created: ${sessionId}`);
    return sessionId;
}

export function createNewSession() {
    console.log('Creating new session');
    const globalData = getGlobalData();
    if (!globalData || globalData.length === 0) {
        console.error('Global data is empty or undefined in createNewSession');
        return;
    }
    sessionCounter++;
    const sessionId = `session-${sessionCounter}`;
    const sessionsContainer = document.getElementById('sessions');
    
    if (!sessionsContainer) {
        console.error('Sessions container not found');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'session';
    sessionDiv.id = sessionId;
    
    sessionDiv.innerHTML = `
        <div class="session-header">
            <h3>Distribution Session ${sessionCounter}</h3>
            <button class="remove-session">Remove</button>
        </div>
        <div class="column-select"></div>
        <div>
            <input type="checkbox" id="${sessionId}-include-null" class="include-null">
            <label for="${sessionId}-include-null">Include Null Values</label>
        </div>
        <label for="${sessionId}-chart-type">Chart Type:</label>
        <select id="${sessionId}-chart-type">
            <option value="bar">Bar Plot</option>
            <option value="kde">KDE Plot</option>
        </select>
        <button class="update-chart">Update Chart</button>
        <div class="grid-container"></div>
    `;
    
    sessionsContainer.appendChild(sessionDiv);
    
    console.log('Populating column select for new session');
    populateColumnSelect(globalData[0], `#${sessionId} .column-select`);
    
    const removeButton = sessionDiv.querySelector('.remove-session');
    if (removeButton) {
        removeButton.onclick = function() {
            sessionsContainer.removeChild(sessionDiv);
        };
    } else {
        console.error('Remove button not found in the new session');
    }
    
    const updateButton = sessionDiv.querySelector('.update-chart');
    if (updateButton) {
        updateButton.onclick = function() {
            updateCharts(sessionId);
        };
    } else {
        console.error('Update chart button not found in the new session');
    }

    console.log(`New session created: ${sessionId}`);
    return sessionId;
}


export function createNewGroupBySession() {
    groupBySessionCounter++;
    const sessionId = `groupby-session-${groupBySessionCounter}`;
    const sessionsContainer = document.getElementById('groupby-sessions');
    
    if (!sessionsContainer) {
        console.error('Group by sessions container not found');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'session groupby-session';
    sessionDiv.id = sessionId;
    
    sessionDiv.innerHTML = `
        <div class="session-header">
            <h3>Group By Session ${groupBySessionCounter}</h3>
            <button class="remove-session">Remove</button>
        </div>
        <div class="group-by-section">
            <h4>GROUP BY Clause</h4>
            <p>Select columns to group by:</p>
            <div class="column-select groupby-columns"></div>
        </div>
        <div class="aggregation-section">
            <h4>SELECT Clause (Aggregation)</h4>
            <p>Select columns to aggregate and choose the aggregation function:</p>
            <div class="column-select aggregation-columns"></div>
            <select class="aggregation-function">
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
                <option value="count">Count</option>
            </select>
        </div>
        <button class="perform-groupby">Perform Group By</button>
        <div class="chart-container"></div>
    `;
    
    sessionsContainer.appendChild(sessionDiv);
    
    const globalData = getGlobalData();
    populateColumnSelects(globalData, sessionId);
    
    sessionDiv.querySelector('.remove-session').onclick = function() {
        sessionsContainer.removeChild(sessionDiv);
    };
    
    sessionDiv.querySelector('.perform-groupby').onclick = function() {
        performGroupBy(sessionId);
    };

    console.log(`New group by session created: ${sessionId}`);
}


export function createNewScatterSession() {
    scatterSessionCounter++;
    const sessionId = `scatter-session-${scatterSessionCounter}`;
    const sessionsContainer = document.getElementById('scatter-sessions');
    
    if (!sessionsContainer) {
        console.error('Scatter sessions container not found');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'session scatter-session';
    sessionDiv.id = sessionId;
    
    sessionDiv.innerHTML = `
        <div class="session-header">
            <h3>Scatter Plot Session ${scatterSessionCounter}</h3>
            <button class="remove-session">Remove</button>
        </div>
        <div class="column-select x-axis-columns"></div>
        <div class="column-select y-axis-columns"></div>
        <button class="create-scatter">Create Scatter Plots</button>
        <div class="chart-container"></div>
    `;
    
    sessionsContainer.appendChild(sessionDiv);
    
    const globalData = getGlobalData();
    populateColumnSelects(globalData, sessionId);
    
    sessionDiv.querySelector('.remove-session').onclick = function() {
        sessionsContainer.removeChild(sessionDiv);
    };
    
    sessionDiv.querySelector('.create-scatter').onclick = function() {
        createScatterPlots(globalData, sessionId);
    };

    console.log(`New scatter plot session created: ${sessionId}`);
}

export function populateColumnSelects(data, sessionId) {
    console.log('Populating column selects for session:', sessionId);
    if (!data || data.length === 0) {
        console.error('Data is empty or undefined in populateColumnSelects');
        return;
    }
    const columns = Object.keys(data[0]);
    console.log('Columns found:', columns);
    
    let selects;
    if (sessionId.startsWith('groupby-session')) {
        selects = ['groupby-columns', 'aggregation-columns'];
    } else if (sessionId.startsWith('scatter-session')) {
        selects = ['x-axis-columns', 'y-axis-columns'];
    } else {
        console.error('Unknown session type:', sessionId);
        return;
    }
    
    selects.forEach(selectClass => {
        const select = document.querySelector(`#${sessionId} .${selectClass}`);
        if (select) {
            populateColumnSelect(data[0], `#${sessionId} .${selectClass}`);
            console.log(`Populated select: ${selectClass}`);
        } else {
            console.error(`Select element with class ${selectClass} not found in session ${sessionId}`);
        }
    });
}