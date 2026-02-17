import type { SifterConfig } from "../core/types";

export const SIFTER_KEYWORDS = [
    'united states'
] as const;

export const SELECTORS = {
    JOB_CONTAINER: '.scaffold-layout__list',
    JOB_CARD: 'li[data-occludable-job-id]',
} as const

export const SIFTER_CONFIG: SifterConfig = {
    title: {
        exact: [],
        partial: ['senior']
    },
    company: {
        exact: ['dataannotation'], 
        partial: ['staffing', 'recruiting']
    },
    location: {
        exact: ['utah'], 
        partial: ['united states'] 
    }
};