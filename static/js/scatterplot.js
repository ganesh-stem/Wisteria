// scatterplot.js

import { getGlobalData } from './state.js';

export function initializeScatterPlot() {
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('create-scatter')) {
            const sessionId = event.target.closest('.scatter-session').id;
            createScatterPlots(getGlobalData(), sessionId);
        }
    });
    console.log('Scatter plot button initialized');
}

export function createScatterPlots(data, sessionId) {
    const container = document.getElementById(sessionId);
    if (!container) {
        console.error(`Container with id ${sessionId} not found`);
        return;
    }

    const xAxisColumns = Array.from(container.querySelectorAll('.x-axis-columns input:checked')).map(input => input.value);
    const yAxisColumns = Array.from(container.querySelectorAll('.y-axis-columns input:checked')).map(input => input.value);

    if (xAxisColumns.length === 0 || yAxisColumns.length === 0) {
        console.error('X-axis or Y-axis columns not selected');
        return;
    }

    const chartContainer = container.querySelector('.chart-container');
    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }
    chartContainer.innerHTML = '';

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    chartContainer.appendChild(gridContainer);

    xAxisColumns.forEach(xColumn => {
        yAxisColumns.forEach(yColumn => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridContainer.appendChild(gridItem);

            createScatterPlot(data, xColumn, yColumn, gridItem);
        });
    });
}

function createScatterPlot(data, xColumn, yColumn, container) {
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 300 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .range([0, width]);

    const y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(d3.extent(data, d => +d[xColumn]));
    y.domain(d3.extent(data, d => +d[yColumn]));

    svg.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 3.5)
        .attr('cx', d => x(+d[xColumn]))
        .attr('cy', d => y(+d[yColumn]))
        .attr('fill', 'steelblue');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .style('text-anchor', 'middle')
        .text(xColumn);

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(yColumn);
}