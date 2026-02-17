import type { SifterConfig } from "./types";

export const SIFTER_CONFIG: SifterConfig = {
    title: {
        exact: [],
        partial: ['senior']
    },
    company: {
        exact: ['dataannotation', 'lensa'], 
        partial: ['staffing', 'recruiting']
    },
    location: {
        exact: ['utah'], 
        partial: ['united states'] 
    }
};