import { hideCard } from "../utils/utils";

console.log("Content script loaded");

const processJobPage = () => {

    console.log("Processing job page");
    
    const jobCards = document.querySelectorAll<HTMLElement>('li[data-occludable-job-id]');

    jobCards.forEach((card) => {

        if (card.dataset.analyzedByGoldpan) return;

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

        card.dataset.analyzedByGoldpan = 'true';
        
    });
};

processJobPage();

const observer = new MutationObserver(() => processJobPage());
observer.observe(document.body, { childList: true, subtree: true });