export interface MatchGroup {
    exact: string[];
    partial: string[];
}

export interface SifterConfig {
    title: MatchGroup;
    company: MatchGroup;
    location: MatchGroup;
}