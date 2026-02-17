export interface JobCardData {
    id: string;
    title: string;
    company: string;
    location: string;
    //add more fields as needed
}

export interface MatchGroup {
    exact: string[];
    partial: string[];
}

export interface SifterConfig {
    title: MatchGroup;
    company: MatchGroup;
    location: MatchGroup;
}