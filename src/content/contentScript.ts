import { hideCard } from "../utils/utils";

console.log("Content script loaded");

const processJobPage = () => {
    const jobCards = document.querySelectorAll<HTMLElement>('li[data-occludable-job-id]');

    jobCards.forEach((card) => {

        if (card.dataset.hiddenByCleaner) return;

        const cardTextSet = card.querySelectorAll<HTMLSpanElement>('span');

        for (const span of cardTextSet) {

            const text = span.textContent?.trim();
            
            if (!text) continue;

            console.log(`Examining job card text: ${text}`);

            if (text.includes('United States')) {
                hideCard(card);
                console.log(`Hid job card based on location: ${text}`);
                break;
            }
        };
        
    });
};

processJobPage();

const observer = new MutationObserver(() => processJobPage());
observer.observe(document.body, { childList: true, subtree: true });