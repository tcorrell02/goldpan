import type { SearchStrategy } from './types';

export const SEARCH_STRATEGIES: SearchStrategy[] = [
    {
        name: 'LoggedInSearch',
        containerSelector: '.scaffold-layout__list', 
        jobCardSelector: 'li[data-occludable-job-id]',
        observedAttribute: 'data-occludable-job-id', 
        
        getJobId: (card: HTMLElement) => {
            return card.getAttribute('data-occludable-job-id') || null;
        }

    },
    {
        name: 'LoggedOutSearch',
        containerSelector: 'ul.jobs-search__results-list',
        jobCardSelector: 'div[data-entity-urn^="urn:li:jobPosting:"]',
        observedAttribute: 'data-entity-urn',
        
        getJobId: (card: HTMLElement) => {
            const urn = card.getAttribute('data-entity-urn');
            if (urn) return urn.split(':').pop() || null;
            return null;
        }
    }
];

