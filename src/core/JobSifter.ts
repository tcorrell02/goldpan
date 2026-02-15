import { SELECTORS } from "../config/constants";

export class JobSifter {
    // Readonly to keep from modifying at script runtime
    private readonly sifterKeywords: string[];

   // Map of JobID -> ContentHash to detect if a recycled card actually has new text
    private processedCache = new Map<string, string>();

    // Can disconnect observer when not in use
    private observer: MutationObserver | null = null;

    constructor(keywords: string[]) {
        this.sifterKeywords = keywords.map(kw => kw.toLowerCase().trim()); // Lower case keywords for faster matching and consistency
    }

    //Need aync to ensure chrome.storage loads before processing cards later
    public async startSifting(): Promise<void> {
        this.injectStyles(); // Ensure styles are applied before processing cards to avoid flicker
        this.scanJobCards();
        this.initializeObserver(); //Looks for changes in the DOM to catch job cards as they load/refresh
        console.log("Goldpan: Job Sifter started.");
    }

    public stopSifting(): void {
        if (this.observer) { // Stops observer to save resources when not needed, such as when user is not on a job listing page
            this.observer.disconnect();
            this.observer = null;
            console.log("Goldpan: Job Sifter stopped.");
        }
    }

    private injectStyles(): void {
        if (document.getElementById('goldpan-filter-styles')) return; // Avoid injecting styles multiple times

        const style = document.createElement('style');
        style.id = 'goldpan-filter-styles';

        //Solves the recycled node without causing invalid network errors
        style.textContent = `
            .goldpan-hidden { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    //Need  arrow function to prevserve "this" context from the class for MutationObserver callback
    private scanJobCards = (): void => {
        const jobCards = document.querySelectorAll<HTMLElement>(SELECTORS.JOB_CARD);
        jobCards.forEach(card => this.processJobCard(card));
    }

    private processJobCard(card: HTMLElement): void {

        const jobId = card.getAttribute('data-occludable-job-id');
        if (!jobId) return; // Skip if no job ID, should be rare but good to check

        const currentText = card.innerText.toLowerCase().trim();
        const contentHash = currentText.substring(0, 100); // Simple hash by taking the first 100 chars, good enough for change detection

        if (this.processedCache.get(jobId) === contentHash) return; // If we've already processed this card and content hasn't changed, skip it
       
        if (currentText.length < 10) return; // Logic: If the card is currently empty (lazy loading), don't cache it yet

        this.processedCache.set(jobId, contentHash);

        const shouldFilter = this.sifterKeywords.some(kw => currentText.includes(kw));
        card.classList.toggle('goldpan-hidden', shouldFilter); // Hide card if it matches any keyword, otherwise ensure it's visible
    }

    private initializeObserver(): void {
        console.log("Observer started.");
        if (this.observer) this.observer.disconnect(); // Clean up existing observer without full stop

        const container =  document.querySelector(SELECTORS.JOB_CONTAINER) || document.body;
        this.observer = new MutationObserver(this.scanJobCards);
        this.observer.observe(container, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            attributeFilter: ['class', 'data-occludable-job-id']
        }); 
    }
}