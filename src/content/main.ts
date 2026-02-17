import { JobSifter } from "../core/JobSifter";
import { SIFTER_KEYWORDS, SIFTER_CONFIG } from "../config/constants";

const goldpan = new JobSifter(SIFTER_CONFIG);

goldpan.startSifting();


