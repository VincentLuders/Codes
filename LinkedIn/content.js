document.addEventListener('keydown', async (e) => {
    if (e.ctrlKey && e.key === 'g') {
        try {
            const moreActionsButton = document.querySelector('button[aria-label="More actions"]');
            moreActionsButton.click();

            await new Promise(resolve => setTimeout(resolve, 500));

            const saveToPdfButton = document.querySelector('div[aria-label="Save to PDF"]');
            saveToPdfButton.click();
        } catch (error) {
            console.error('Error triggering download:', error);
        }
    }
});