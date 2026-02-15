import { JobSifter } from "../core/JobSifter";
import { SIFTER_KEYWORDS } from "../config/constants";

const goldpan = new JobSifter(SIFTER_KEYWORDS);
goldpan.startSifting().then(() => {
    console.log("Goldpan: Job Sifter initialized successfully.");
});


