import { SELECTORS } from "../config/constants";
import type { JobCardData } from "./types";

export class JobSifter {
    private readonly sifterKeywords: string[];
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
        // 1. Attempt to get the card's unique ID
        const jobId = card.getAttribute('data-occludable-job-id');
        if (!jobId) return;

        // 2. Parse the DOM into a clean TypeScript object
        const jobData = this.extractCardData(card, jobId);
        if (!jobData) return;

        // 3. Evaluate & Execute
        const shouldFilter = this.sifterKeywords.some(kw => jobData.location.includes(kw));
        card.classList.toggle('goldpan-hidden', shouldFilter);
        
    }

    private extractCardData(card: HTMLElement, jobId: string): JobCardData | null {
        // 1. Initialize DOM walker to extract text nodes
        const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null);
        const textNodes: string[] = [];
        let node: Node | null;

        // 2. Walk through text nodes and collect their values
        while (node = walker.nextNode()) {
            const text = node.nodeValue?.toLowerCase().trim();
            if (text && text.length > 0) textNodes.push(text);
        }

        // 3. Discard if card not loaded enough for further analysis
        if (textNodes.length < 4) return null;

        return {
            id: jobId,
            title: textNodes[0],
            company: textNodes[2],
            location: textNodes[3]
        }

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