import { SELECTORS } from "./constants";
import type { JobCardData } from "./types";
import type { SifterConfig } from "../config/types";

interface CompiledMatchGroup {
    exact: Set<string>;
    partial: string[];
}

/**
 * JobSifter handles the core DOM monitoring and filtering logic for Goldpan.
 * Architecture Note: This operates as a Content Script. It prioritizes non-destructive 
 * DOM manipulation (CSS hiding) over node removal to avoid desyncing the host's
 * virtual DOM.
 */

export class JobSifter {
    private observer: MutationObserver | null = null;

    // We debounce the observer because Single Page Applications often batch 
    // DOM inserts. A single scroll event could trigger dozens of mutations.
    private scanTimeout: number | null = null;

    // PERFORMANCE: A high-speed cache to prevent running the TreeWalker 
    // and rules on cards that haven't changed since the last observer tick.
    private precheckCache = new Map<string, { rawText: string, shouldFilter: boolean }>();

    private sifterRules = {
        title: {exact: new Set<string>(), partial: [] as string[]},
        company: {exact: new Set<string>(), partial: [] as string[]},
        location: {exact: new Set<string>(), partial: [] as string[]}
    };

    constructor(config: SifterConfig) {
        this.ruleConfig(config);
    }

    /**
     * Normalizes and pre-compiles rule data structures.
     * Performance: Converts exact matches into a Set for O(1) lookup time
     * for faster evaluation.
     */
    private ruleConfig(config: SifterConfig): void {
        const categories: (keyof SifterConfig)[] = ['title', 'company', 'location'];

        categories.forEach(category => {
            const rawMatchGroup = config[category];

            // Normalization is done once here to avoid calling .toLowerCase() 
            // thousands of times per second inside the evaluation loop.
            const exactNormalized = rawMatchGroup.exact.map(s => s.toLowerCase().trim());
            this.sifterRules[category].exact = new Set(exactNormalized);
            
            this.sifterRules[category].partial = rawMatchGroup.partial.map(s => s.toLowerCase().trim());
        });
    }

    //Make async later when adding chrome storage
    public startSifting(): void {
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

    /**
     * Injects a CSS class used to hide elements.
     * Trade-off: Setting `display: none` on partially loaded elements will cause the browser 
     * to immediately abort pending network requests (e.g., company logos) for that element. 
     * This is expected and actually saves user bandwidth, though it creates "noisy" console errors.
     */
    private injectStyles(): void {
        if (document.getElementById('goldpan-filter-styles')) return;

        const style = document.createElement('style');
        style.id = 'goldpan-filter-styles';
        style.textContent = `
            .goldpan-hidden { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    /**
     * 50ms Debouncer for the MutationObserver.
     * Groups rapid-fire DOM mutations into a single execution to prevent main-thread blocking.
     */
    private triggerScan = (): void => {
        if (this.scanTimeout) window.clearTimeout(this.scanTimeout);
        this.scanTimeout = window.setTimeout(() => this.scanJobCards(), 50);
    }

    private scanJobCards = (): void => {
        const jobCards = document.querySelectorAll<HTMLElement>(SELECTORS.JOB_CARD);
        jobCards.forEach(card => this.processJobCard(card));
    }

    private processJobCard(card: HTMLElement): void {
        // LinkedIn uses 'data-occludable-job-id' as a pseudo-anchor for job card tracking.
        // We require it to ensure we step from one job card to the next.
        const jobId = card.getAttribute('data-occludable-job-id');
        if (!jobId) return;


        const currentRawText = card.textContent || '';
        const cached = this.precheckCache.get(jobId);
        
        if (cached && cached.rawText === currentRawText) {
            card.classList.toggle('goldpan-hidden', cached.shouldFilter);
            return;
        }

        const jobData = this.extractCardData(card, jobId);
        if (!jobData) return;

        // Outsource evaluation for readability
        const shouldFilter = this.evaluateRules(jobData);

        this.precheckCache.set(jobId, { rawText: currentRawText, shouldFilter });

        // Using classList.toggle ensures cards are hidden efficiently. If the job card is 
        // already hidden, it won't trigger unnecessary style changes.
        card.classList.toggle('goldpan-hidden', shouldFilter);
        
    }

    /**
     * Extracts text data from the card.
     * Strategy: Uses `TreeWalker` instead of `.innerText` or `querySelector`s.
     * Why: 
     * 1. `.innerText` forces a synchronous layout recalculation (reflow) which is very expensive.
     * 2. `querySelector`s are easily impacted by minor UI updates by the host site.
     * Note: This relies on DOM text-node order (0=title, 2=company, 3=location). It's simple,
     * but sensitive to layout restructuring.
     */
    private extractCardData(card: HTMLElement, jobId: string): JobCardData | null {
        const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null);
        const textNodes: string[] = [];
        let node: Node | null;

        while (node = walker.nextNode()) {
            const text = node.nodeValue?.toLowerCase().trim();
            if (text && text.length > 0) textNodes.push(text);
        }

        // 3. Stop early if the card is not loaded enough to contain key nodes
        if (textNodes.length < 4) return null;

        return {
            id: jobId,
            title: textNodes[0],
            company: textNodes[2],
            location: textNodes[3]
        }

    }

    private evaluateRules(jobData: JobCardData): boolean { 
        // Short-circuiting: Returns true at the first positive match,
        // saving resources on evaluating subsequent rules.
        if (this.evaluateMatchGroup(jobData.title, this.sifterRules.title)) return true;
        if (this.evaluateMatchGroup(jobData.company, this.sifterRules.company)) return true;
        if (this.evaluateMatchGroup(jobData.location, this.sifterRules.location)) return true;

        return false;
    }

    private evaluateMatchGroup(text:string, rules: CompiledMatchGroup): boolean {
        if (!text) return false;

        // O(1) Set lookup
        if (rules.exact.has(text)) return true;

        // O(n) array lookup
        if (rules.partial.some(kw => text.includes(kw))) return true;

        return false;
    }

    /**
     * Sets up the DOM listener for mutations (like lazy-loaded/infinite-scroll items).
     */
    private initializeObserver(): void {
        if (this.observer) this.observer.disconnect(); // Clean up existing observer without full stop

        const container =  document.querySelector(SELECTORS.JOB_CONTAINER) || document.body;

        // Performance: attributeFilter severely limits the amount of mutation events fired,
        // ignoring irrelevant changes like hover states or style updates.
        this.observer = new MutationObserver(this.triggerScan);
        this.observer.observe(container, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            attributeFilter: ['class', 'data-occludable-job-id']
        }); 
    }
}