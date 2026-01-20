
/**
 * Retrieves the job ID from a LinkedIn job card element.
 * @param card - The HTML element of the job card.
 * @returns The job ID as a string, or null if the element does not have the attribute.
 */
export const getJobIdFromCard = (card: HTMLElement): string | null => {
    return card.getAttribute('data-occludable-job-id');
};

/**
 * Hides the given HTML element (job card)by setting its display style to 'none'.
 * @param {HTMLElement} card - The card to hide.
 */
export const hideCard = (card: HTMLElement): void => {
    card.style.display = 'none';
    card.dataset.hiddenByCleaner = 'true';
}