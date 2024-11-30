let globalData = null;

export function setGlobalData(data) {
    globalData = data;
    console.log('Global data set in state.js:', globalData);
}

export function getGlobalData() {
    console.log('Getting global data from state.js:', globalData);
    return globalData;
}