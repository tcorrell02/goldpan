import { SELECTORS } from "../config/constants";

export class JobSifter {
    private readonly sifterKeywords: string[];
    private processedCache = new Map<string, string>();
    private observer: MutationObserver | null = null;

    private scanTimeout: number | null = null; // To debounce rapid mutations

    constructor(keywords: readonly string[]) {
        this.sifterKeywords = keywords.map(kw => kw.toLowerCase().trim());
    }

    //Make async later when adding chrome storage
    public async startSifting(): Promise<void> {
        this.injectStyles();
        this.scanJobCards();
        this.initializeObserver();
        console.log("Goldpan: Job Sifter started.");
    }

    public stopSifting(): void {
        if (this.observer) { 
            this.observer.disconnect();
            this.observer = null;
            if (this.scanTimeout) window.clearTimeout(this.scanTimeout);
            console.log("Goldpan: Job Sifter stopped.");
        }
    }

    private injectStyles(): void {
        if (document.getElementById('goldpan-filter-styles')) return;

        const style = document.createElement('style');
        style.id = 'goldpan-filter-styles';
        //Collapses the job card safely with flex/grid layouts
        //WILL cause expected network aborts in the console for lazy-loaded assets
        style.textContent = `
            .goldpan-hidden { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    private triggerScan = (): void => {
        if (this.scanTimeout) window.clearTimeout(this.scanTimeout);
        this.scanTimeout = window.setTimeout(() => this.scanJobCards(), 50);
    }

    private scanJobCards = (): void => {
        const jobCards = document.querySelectorAll<HTMLElement>(SELECTORS.JOB_CARD);
        jobCards.forEach(card => this.processJobCard(card));
    }

    private processJobCard(card: HTMLElement): void {

        const jobId = card.getAttribute('data-occludable-job-id');
        if (!jobId) return; // Skip if no job ID, should be rare but good to check

        const currentText = card.innerText.toLowerCase().trim();

        // 1. Guard: If the card is empty (lazy loading), abort immediately to save CPU
        if (currentText.length < 10) return;

        // 2. Hash & Cache Check
        const contentHash = currentText.substring(0, 100);
        if (this.processedCache.get(jobId) === contentHash) return;

        this.processedCache.set(jobId, contentHash);

        // 3. Evaluate & Execute
        const shouldFilter = this.sifterKeywords.some(kw => currentText.includes(kw));
        card.classList.toggle('goldpan-hidden', shouldFilter); // Hide card if it matches any keyword, otherwise ensure it's visible
    }

    private initializeObserver(): void {
        if (this.observer) this.observer.disconnect(); // Clean up existing observer without full stop

        const container =  document.querySelector(SELECTORS.JOB_CONTAINER) || document.body;

        // Pass the debounced trigger instead of the heavy scan
        this.observer = new MutationObserver(this.triggerScan);
        this.observer.observe(container, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            attributeFilter: ['class', 'data-occludable-job-id']
        }); 
    }
}