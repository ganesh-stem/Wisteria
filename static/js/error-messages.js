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