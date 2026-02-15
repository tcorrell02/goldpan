import { SELECTORS } from "../config/constants";

export class JobSifter {
    // Readonly to keep from modifying at script runtime
    private readonly sifterKeywords: string[];

    // Quick lookup for analyed job cards, fewer resources used due to reprocessing
    private processedJobIds = new Set<string>();
    private hiddenJobIds = new Set<string>();

    // Can disconnect observer when not in use
    private observer: MutationObserver | null = null;

    constructor(keywords: string[]) {
        this.sifterKeywords = keywords.map(kw => kw.toLowerCase()); // Lower case keywords for faster matching and consistency
    }

    public startSifting(): void {

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

    private scanJobCards(): void {
        const jobCards = document.querySelectorAll<HTMLElement>(SELECTORS.JOB_CARD);
        jobCards.forEach(card => this.processJobCard(card));
    }

    private processJobCard(card: HTMLElement): void {

        const jobId = card.getAttribute('data-occludable-job-id');
        if (!jobId) return; // Skip if no job ID, should be rare but good to check

        if (this.hiddenJobIds.has(jobId)) {
            card.style.display = 'none';
            return; // Already hidden, no need to reprocess
        }

        if (this.processedJobIds.has(jobId)) {
            return; // Already analyzed, skip to save resources
        }

        this.processedJobIds.add(jobId); // Mark as processed to avoid future reprocessing

        const cardTextElements = card.querySelectorAll<HTMLElement>(SELECTORS.JOB_CARD_TEXT_ELEMENT);
        let shouldHide = false;

        for (const textElem of cardTextElements) {
            const text = textElem.textContent?.toLowerCase().trim() || '';
            if (this.sifterKeywords.some(kw => text.includes(kw))) {
                shouldHide = true;
                break; // No need to check further if one keyword matches
            }
        }

        if (shouldHide) {
            this.hiddenJobIds.add(jobId);
            card.style.display = 'none';
        }
    }

    private initializeObserver(): void {
        if (this.observer) this.observer.disconnect(); // Clean up existing observer without full stop

        this.observer = new MutationObserver((mutations) => {
            //Batches DOM reads/writes together for better performance during rapid changes like infinite scroll or page refreshes
            requestAnimationFrame(() => {
                const hasAddedNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
                if (hasAddedNodes) {
                    this.scanJobCards();
                }
            })
        })

        // Fallback to body if specific container not found, should be rare
        const container =  document.querySelector(SELECTORS.JOB_CONTAINER) || document.body;

        this.observer.observe(container, { 
            childList: true, 
            subtree: true 
        });
    }
}