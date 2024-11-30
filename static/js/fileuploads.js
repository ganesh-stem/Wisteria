import { setGlobalData } from './state.js';
import { initializeApp } from './main.js';

export function handleFileUpload(event) {
    console.log('handleFileUpload function called');
    event.preventDefault();
    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];
    var notificationArea = document.getElementById('notification-area');
    var uploadButton = document.querySelector('.upload-button');
    
    // Check if notification area exists
    if (!notificationArea) {
        console.error('Notification area not found. Creating a new one.');
        notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        document.body.appendChild(notificationArea);
    }
    
    // Clear previous messages
    notificationArea.innerHTML = '';

    if (file) {
        console.log('File selected:', file.name);
        if (!file.name.toLowerCase().endsWith('.csv')) {
            showNotification("Please upload a CSV file.", "error");
            return;
        }
        
        if (typeof Papa === 'undefined') {
            console.error('PapaParse is not defined. Make sure the library is included.');
            showNotification("CSV parsing library not loaded. Please check your internet connection and reload the page.", "error");
            return;
        }
        
        // Update button text and disable it
        uploadButton.textContent = 'Uploading...';
        uploadButton.disabled = true;
        
        Papa.parse(file, {
            complete: function(results) {
                console.log('Papa Parse complete', results);
                if (results.errors.length > 0) {
                    showNotification("Error parsing CSV: " + results.errors[0].message, "error");
                } else if (results.data.length === 0) {
                    showNotification("The CSV file is empty.", "error");
                } else {
                    console.log('CSV parsed successfully');
                    setGlobalData(results.data);
                    console.log('Global data set');
                    showNotification('File uploaded and parsed successfully!', "success");
                    setTimeout(() => {
                        initializeApp();
                    }, 1000); // Delay to show success message
                }
                // Reset button
                uploadButton.textContent = 'Upload and Analyze';
                uploadButton.disabled = false;
            },
            error: function(error) {
                console.error('Error parsing CSV:', error);
                showNotification("Failed to parse the CSV file. Please check the file and try again.", "error");
                // Reset button
                uploadButton.textContent = 'Upload and Analyze';
                uploadButton.disabled = false;
            },
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
    } else {
        console.log('No file selected');
        showNotification("Please select a CSV file.", "error");
    }
}

function showNotification(message, type) {
    var notificationArea = document.getElementById('notification-area');
    if (!notificationArea) {
        console.error('Notification area not found. Creating a new one.');
        notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        document.body.appendChild(notificationArea);
    }
    
    var notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationArea.appendChild(notification);
    
    // Ensure the notification is visible
    notificationArea.style.display = 'block';
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        setTimeout(() => {
            notification.remove();
            if (notificationArea.children.length === 0) {
                notificationArea.style.display = 'none';
            }
        }, 300);
    }, 5000);
}