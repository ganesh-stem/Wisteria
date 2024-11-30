// tabs.js

export function initializeTabs() {
    const tabLinks = document.querySelectorAll('.sidebar nav ul li a');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update active tab link
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target content, hide others
            tabContents.forEach(content => {
                if (content.id === targetId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}