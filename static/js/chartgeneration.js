import { generateBarChart, generateKdePlot } from './utils.js';
import { getGlobalData } from './state.js';
export function updateCharts(sessionId = null) {
    const globalData = getGlobalData();
    
    if (sessionId) {
        // Update a specific session
        updateSession(sessionId, globalData);
    } else {
        // Update all sessions
        const sessions = document.querySelectorAll('.session');
        sessions.forEach(session => updateSession(session.id, globalData));
    }
}

function updateSession(sessionId, globalData) {
    const sessionDiv = document.getElementById(sessionId);
    if (!sessionDiv) {
        console.error(`Session div not found for ID: ${sessionId}`);
        return;
    }

    if (sessionDiv.classList.contains('groupby-session') ||
        sessionDiv.classList.contains('imputation-session') || 
        sessionDiv.classList.contains('encoding-session') ||
        sessionDiv.classList.contains('delete-columns-session') ||
        sessionDiv.classList.contains('data-splitting-session') ||
        sessionDiv.classList.contains('logistic-regression-session')) {
        // These sessions don't require chart updates
        return;
    }

    const selectedColumns = Array.from(sessionDiv.querySelectorAll('.column-select input:checked')).map(input => input.value);
    const chartTypeSelect = sessionDiv.querySelector('.chart-type');
    const chartType = chartTypeSelect ? chartTypeSelect.value : 'bar'; // Default to 'bar' if not found
    const includeNullCheckbox = sessionDiv.querySelector('.include-null');
    const includeNull = includeNullCheckbox ? includeNullCheckbox.checked : false; // Default to false if not found
    
    let gridContainer = sessionDiv.querySelector('.grid-container');
    if (!gridContainer) {
        gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        sessionDiv.appendChild(gridContainer);
    }
    
    gridContainer.innerHTML = '';
    if (selectedColumns.length > 0) {
        selectedColumns.forEach(column => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.innerHTML = `<h4>${column} - ${chartType}</h4>`;
            gridContainer.appendChild(gridItem);

            generateChart(globalData, column, chartType, gridItem, includeNull);
        });
    }
}

function generateChart(data, column, chartType, gridItem, includeNull) {
    console.log("Generating chart for column:", column);
    console.log("Chart type:", chartType);
    console.log("Include null:", includeNull);

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.height = '300px';
    gridItem.appendChild(chartContainer);

    let filteredData = includeNull ? data : data.filter(row => row[column] !== null && row[column] !== undefined);
    console.log("Filtered data length:", filteredData.length);

    if (chartType === 'bar') {
        generateBarChart(data, column, chartContainer, includeNull);
    } else if (chartType === 'kde') {
        generateKdePlot(filteredData, column, chartContainer);
    }
}