import { handleFileUpload } from './fileuploads.js';
import { createNewDistributionSession, createNewGroupBySession, createNewScatterSession, populateColumnSelects } from './sessionmanagement.js';
import { updateCharts } from './chartgeneration.js';
import { initializeGroupBy } from './groupby.js';
import { initializeScatterPlot } from './scatterplot.js';
import { getGlobalData } from './state.js';
import { createNewImputationSession } from './imputation.js';
import { createNewEncodingSession, initializeEncoding } from './encoding.js';
import { createNewDeleteColumnsSession, initializeDeleteColumns } from './deletecolumns.js';
import { createNewDataSplittingSession, initializeDataSplitting } from './datasplitting.js';
import { createNewMLModelSession, initializeMLModels } from './mlmodels.js';
import { initializeTabs } from './tabs.js';
import { displayDataStructure } from './data-structure.js';

export function initializeApp() {
    console.log('Initializing app');
    const globalData = getGlobalData();
    console.log('Global data in initializeApp:', globalData);

    const distributionContainer = document.getElementById('distribution-container');
    const groupbyContainer = document.getElementById('groupby-container');
    const scatterContainer = document.getElementById('scatter-container');
    const imputationContainer = document.getElementById('imputation-container');
    const encodingContainer = document.getElementById('encoding-container');
    const deleteColumnsContainer = document.getElementById('delete-columns-container');
    const dataSplittingContainer = document.getElementById('data-splitting-container');
    const mlModelsContainer = document.getElementById('ml-models-container');
    
    if (distributionContainer && groupbyContainer && scatterContainer && imputationContainer && encodingContainer && deleteColumnsContainer && dataSplittingContainer && mlModelsContainer) {
        distributionContainer.style.display = 'block';
        groupbyContainer.style.display = 'block';
        scatterContainer.style.display = 'block';
        imputationContainer.style.display = 'block';
        encodingContainer.style.display = 'block';
        deleteColumnsContainer.style.display = 'block';
        dataSplittingContainer.style.display = 'block';
        mlModelsContainer.style.display = 'block';
        console.log('Containers set to display: block');
    } else {
        console.error('One or more containers not found in the DOM');
    }

    try {
        initializeGroupBy();
        console.log('Group by initialized');
    } catch (error) {
        console.error('Error initializing group by:', error);
    }

    try {
        initializeScatterPlot();
        console.log('Scatter plot initialized');
    } catch (error) {
        console.error('Error initializing scatter plot:', error);
    }

    try {
        initializeEncoding();
        console.log('Encoding initialized');
    } catch (error) {
        console.error('Error initializing encoding:', error);
    }

    try {
        initializeDeleteColumns();
        console.log('Delete columns initialized');
    } catch (error) {
        console.error('Error initializing delete columns:', error);
    }

    try {
        initializeDataSplitting();
        console.log('Data splitting initialized');
    } catch (error) {
        console.error('Error initializing data splitting:', error);
    }

    try {
        initializeMLModels();
        console.log('ML models initialized');
    } catch (error) {
        console.error('Error initializing ML models:', error);
    }

    try {
        initializeTabs();
        console.log('Tabs initialized');
    } catch (error) {
        console.error('Error initializing Tabs:', error);
    }

    document.querySelector('a[href="#data-structure"]').addEventListener('click', displayDataStructure);

    console.log('App initialization complete');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFileUpload);
        console.log('Upload form event listener added');
    } else {
        console.error('Upload form not found');
    }

    // Add event listeners for new session buttons
    document.getElementById('new-distribution-session')?.addEventListener('click', createNewDistributionSession);
    document.getElementById('new-groupby-session')?.addEventListener('click', createNewGroupBySession);
    document.getElementById('new-scatter-session')?.addEventListener('click', createNewScatterSession);
    document.getElementById('new-imputation-session')?.addEventListener('click', createNewImputationSession);
    document.getElementById('new-encoding-session')?.addEventListener('click', createNewEncodingSession);
    document.getElementById('new-delete-columns-session')?.addEventListener('click', createNewDeleteColumnsSession);
    document.getElementById('new-data-splitting-session')?.addEventListener('click', createNewDataSplittingSession);
    document.getElementById('new-ml-model-session')?.addEventListener('click', createNewMLModelSession);
});


function handleResize() {
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(container => {
        const sessionId = container.closest('.session').id;
        updateCharts(sessionId);
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.addEventListener('resize', debounce(handleResize, 250));


