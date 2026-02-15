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
        // Lower case keywords for faster matching and consistency throughout the application
        this.sifterKeywords = keywords.map(kw => kw.toLowerCase());
    }

    public startSifting(): void {

        this.scanJobCards();

        //Looks for changes in the DOM to catch job cards as they load/refresh
        this.initializeObserver();

        console.log("Goldpan: Job Sifter started.");
    }

    public stopSifting(): void {
        // Stops observer to save resources when not needed, such as when user is not on a job listing page
        if (this.observer) {

            this.observer.disconnect();
            this.observer = null;
            console.log("Goldpan: Job Sifter stopped.");
            
        }
    }
}