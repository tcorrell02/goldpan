export interface JobCardData {
    id: string;
    title: string;
    company: string;
    location: string;
    //add more fields as needed
}

export interface SearchStrategy {
    name: string;
    containerSelector: string;
    jobCardSelector: string;
}