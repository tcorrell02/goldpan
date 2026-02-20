import type { SearchStrategy } from './types';

export const SEARCH_STRATEGIES: SearchStrategy[] = [
    {
        name: 'LoggedInSearch',
        containerSelector: '.scaffold-layout__list', 
        jobCardSelector: 'li[data-occludable-job-id]', 
        
        getJobId: (card: HTMLElement) => {
            return card.getAttribute('data-occludable-job-id') || null;
        }

    },
];

