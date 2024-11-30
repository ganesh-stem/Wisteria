// groupby.js

import { getGlobalData } from './state.js';
import { createGroupByBarPlot } from './utils.js';

export function initializeGroupBy() {
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('perform-groupby')) {
            const sessionId = event.target.closest('.groupby-session').id;
            if (sessionId) {
                performGroupBy(sessionId);
            } else {
                console.error('Could not find session ID for group by operation');
            }
        }
    });
    console.log('Group by button initialized');
}

export function performGroupBy(sessionId) {
    console.log(`Performing group by operation, session ID: ${sessionId}`);
    const globalData = getGlobalData();
    if (!globalData || globalData.length === 0) {
        console.error('Global data is empty or undefined in performGroupBy');
        return;
    }

    const sessionDiv = document.getElementById(sessionId);
    if (!sessionDiv) {
        console.error(`Session div not found for ID: ${sessionId}`);
        return;
    }

    const groupByColumns = Array.from(sessionDiv.querySelectorAll('.groupby-columns input:checked')).map(input => input.value);
    const aggregationColumns = Array.from(sessionDiv.querySelectorAll('.aggregation-columns input:checked')).map(input => input.value);
    const aggregationFunction = sessionDiv.querySelector('.aggregation-function').value;

    if (groupByColumns.length === 0 || aggregationColumns.length === 0) {
        console.error('Group by or aggregation columns not selected');
        return;
    }

    console.log(`Group by: ${groupByColumns}, Aggregation: ${aggregationColumns}, Function: ${aggregationFunction}`);

    // Perform the group by operation
    const groupedData = d3.group(globalData, ...groupByColumns.map(col => d => d[col]));
    
    const aggregatedData = Array.from(groupedData, ([key, group]) => {
        const aggregatedValues = {};
        aggregationColumns.forEach(col => {
            let value;
            switch (aggregationFunction) {
                case 'sum':
                    value = d3.sum(group, d => +d[col]);
                    break;
                case 'avg':
                    value = d3.mean(group, d => +d[col]);
                    break;
                case 'count':
                    value = group.length;
                    break;
                default:
                    value = 0;
            }
            aggregatedValues[col] = value;
        });
        // Handle both single and multiple group-by columns
        const keyString = Array.isArray(key) ? key.join(' - ') : key;
        return { key: keyString, ...aggregatedValues };
    });

    console.log('Aggregated data:', aggregatedData);

    // Create or clear the chart container
    let chartContainer = sessionDiv.querySelector('.chart-container');
    if (!chartContainer) {
        chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        sessionDiv.appendChild(chartContainer);
    }
    chartContainer.innerHTML = '';

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    chartContainer.appendChild(gridContainer);

    aggregationColumns.forEach((col, index) => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridContainer.appendChild(gridItem);

        createGroupByBarPlot(aggregatedData, gridItem, col, groupByColumns.join(' + '), aggregationFunction);
    });
}