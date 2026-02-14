import { getJobIdFromCard, hideCard } from "../utils/utils";
// import '../styles.css';

console.log("Content script loaded");

const analyzedJobIds = new Set<string>();
const blockedJobIds = new Set<string>();

/*const injectGoldpanCss = () => {
    const goldpanCss = document.createElement('link');
    goldpanCss.rel = 'stylesheet';
    goldpanCss.href = chrome.runtime.getURL('styles.css');
    document.head.appendChild(goldpanCss);
} */

const processJobPage = () => {

    console.log("Processing job page");

    const jobCards = document.querySelectorAll<HTMLElement>('li[data-occludable-job-id]');

    jobCards.forEach((card) => {

        const jobId = getJobIdFromCard(card);

        if (!jobId || analyzedJobIds.has(jobId)) return;

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

        analyzedJobIds.add(jobId);
        
    });
};

processJobPage();

const observer = new MutationObserver(() => processJobPage());
observer.observe(document.body, { childList: true, subtree: true });