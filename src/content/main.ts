import { JobSifter } from "../core/JobSifter";
import { SIFTER_CONFIG } from "../config/constants";
import { SEARCH_STRATEGIES } from "../core/constants";

const goldpan = new JobSifter(SIFTER_CONFIG, SEARCH_STRATEGIES[1]);

goldpan.startSifting();


