
export function populateColumnSelect(dataPoint, selectSelector) {
    console.log('Populating column select', selectSelector);
    console.log('Data point:', dataPoint);
    const select = document.querySelector(selectSelector);
    if (!select) {
        console.error('Column select element not found:', selectSelector);
        return;
    }
    select.innerHTML = '';

    const containerDiv = document.createElement('div');
    containerDiv.className = 'column-select-container';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'column-select-header';
    headerDiv.innerHTML = `
        <input type="text" class="column-search" placeholder="Search columns...">
        <span><span class="selected-count">0</span> / <span class="total-count">0</span> selected</span>
    `;
    containerDiv.appendChild(headerDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'column-select-actions';
    actionsDiv.innerHTML = `
        <button class="select-all">Select All</button>
        <button class="deselect-all">Deselect All</button>
    `;
    containerDiv.appendChild(actionsDiv);

    const columnsDiv = document.createElement('div');
    columnsDiv.className = 'columns';
    containerDiv.appendChild(columnsDiv);

    select.appendChild(containerDiv);

    const columns = Object.keys(dataPoint);
    console.log('Columns to populate:', columns);
    const totalCount = columns.length;
    select.querySelector('.total-count').textContent = totalCount;

    // Group columns by data type
    const groups = {
        number: [],
        string: [],
        boolean: [],
        other: []
    };

    columns.forEach(column => {
        const value = dataPoint[column];
        if (typeof value === 'number') {
            groups.number.push(column);
        } else if (typeof value === 'string') {
            groups.string.push(column);
        } else if (typeof value === 'boolean') {
            groups.boolean.push(column);
        } else {
            groups.other.push(column);
        }
    });

    Object.entries(groups).forEach(([groupName, groupColumns]) => {
        if (groupColumns.length > 0) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'column-group';
            groupDiv.innerHTML = `<div class="column-group-title">${groupName.charAt(0).toUpperCase() + groupName.slice(1)}</div>`;

            groupColumns.forEach(column => {
                const columnDiv = document.createElement('div');
                columnDiv.className = 'column-option';
                columnDiv.innerHTML = `
                    <input type="checkbox" id="${selectSelector.replace('#', '')}-${column}" name="${column}" value="${column}">
                    <label for="${selectSelector.replace('#', '')}-${column}">${column}</label>
                `;
                groupDiv.appendChild(columnDiv);
            });

            columnsDiv.appendChild(groupDiv);
        }
    });

    // Add event listeners
    const searchInput = select.querySelector('.column-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        select.querySelectorAll('.column-option').forEach(option => {
            const label = option.querySelector('label');
            if (label.textContent.toLowerCase().includes(searchTerm)) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
    });

    const selectAllButton = select.querySelector('.select-all');
    const deselectAllButton = select.querySelector('.deselect-all');
    const checkboxes = select.querySelectorAll('input[type="checkbox"]');

    selectAllButton.addEventListener('click', () => setAllCheckboxes(true));
    deselectAllButton.addEventListener('click', () => setAllCheckboxes(false));

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });

    function setAllCheckboxes(checked) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        updateSelectedCount();
    }

    function updateSelectedCount() {
        const selectedCount = select.querySelectorAll('input[type="checkbox"]:checked').length;
        select.querySelector('.selected-count').textContent = selectedCount;
    }


    select.appendChild(containerDiv);

    console.log(`Column select populated for ${selectSelector}`);
}

export function generateBarChart(data, column, container, includeNull) {
    // Clear any existing content
    container.innerHTML = '';

    const margin = {top: 40, right: 20, bottom: 60, left: 60};
    const width = Math.max(300, container.clientWidth);  // Set minimum width to 300px
    const height = 300;  // Fixed height
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const allData = data.map(d => d[column]);
    const validData = allData.filter(d => d !== null && d !== undefined);
    const nullCount = allData.length - validData.length;

    const counts = d3.rollup(validData, v => v.length, d => d);
    let sortedCounts = Array.from(counts).sort((a, b) => b[1] - a[1]);

    const svg = d3.select(container).append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(sortedCounts.map(d => String(d[0])))
        .range([0, chartWidth])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(sortedCounts, d => d[1])])
        .nice()
        .range([chartHeight, 0]);

    svg.selectAll('rect')
        .data(sortedCounts)
        .enter()
        .append('rect')
        .attr('x', d => x(String(d[0])))
        .attr('y', d => y(d[1]))
        .attr('width', x.bandwidth())
        .attr('height', d => chartHeight - y(d[1]))
        .attr('fill', '#3498db');

    // Add x-axis
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Add y-axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', 0 - (margin.top / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text(`Distribution of ${column}`);

    // Add null value information as text
    if (includeNull && nullCount > 0) {
        svg.append('text')
            .attr('x', chartWidth)
            .attr('y', chartHeight + margin.bottom - 5)
            .attr('text-anchor', 'end')
            .style('font-size', '14px')
            .style('fill', '#e74c3c')
            .text(`Null values: ${nullCount}`);
    }
}

export function generateKdePlot(data, column, container) {
    // Clear any existing content
    container.innerHTML = '';

    const margin = {top: 40, right: 20, bottom: 60, left: 60};
    const width = Math.max(300, container.clientWidth);  // Set minimum width to 300px
    const height = 300;  // Fixed height
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const allData = data.map(d => d[column]);
    const numericData = allData.filter(d => d !== null && d !== undefined && !isNaN(Number(d))).map(Number);
    const nullCount = allData.length - numericData.length;

    if (numericData.length < 2) {
        const warning = document.createElement('div');
        warning.textContent = `Not enough valid data points to create a KDE plot. Found ${numericData.length} valid points.`;
        container.appendChild(warning);
        return;
    }

    const svg = d3.select(container).append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(numericData)).nice()
        .range([0, chartWidth]);

    const bandwidth = (d3.max(numericData) - d3.min(numericData)) / 10;
    const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), x.ticks(100));
    const density = kde(numericData);

    const y = d3.scaleLinear()
        .domain([0, d3.max(density, d => d[1])]).nice()
        .range([chartHeight, 0]);

    svg.append("path")
        .datum(density)
        .attr("fill", "none")
        .attr("stroke", "#3498db")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d[0]))
            .y(d => y(d[1]))
        );

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', 0 - (margin.top / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text(`KDE Plot of ${column}`);

    // Add null value information as text
    if (nullCount > 0) {
        svg.append('text')
            .attr('x', chartWidth)
            .attr('y', chartHeight + margin.bottom - 5)
            .attr('text-anchor', 'end')
            .style('font-size', '14px')
            .style('fill', '#e74c3c')
            .text(`Null values: ${nullCount}`);
    }
}

function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
    };
}

function kernelEpanechnikov(k) {
    return v => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
}

export function createGroupByBarPlot(data, container, yColumn, xLabel, aggregationFunction) {
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 300 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(data.map(d => d.key));
    y.domain([0, d3.max(data, d => d[yColumn])]);

    svg.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.key))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d[yColumn]))
        .attr('height', d => height - y(d[yColumn]))
        .attr('fill', 'steelblue');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y));

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 0 - (margin.top / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(`${aggregationFunction} of ${yColumn}`);

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(xLabel);
}

export function displayError(message, containerId) {
    const errorContainer = document.getElementById(containerId);
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.add('show');
        
        // Automatically hide the error message after 5 seconds
        setTimeout(() => {
            errorContainer.classList.remove('show');
        }, 5000);
    } else {
        console.error(`Error container not found: ${containerId}. Message:`, message);
    }
}

export function clearError(containerId) {
    const errorContainer = document.getElementById(containerId);
    if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.classList.remove('show');
    }
}