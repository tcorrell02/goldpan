# Goldpan: Job Sifter

Goldpan: Job Sifter is a simple, fast client-side browser extension that builds on LinkedIn's existing job search tools to hide jobs you don't want to see.

Having to scroll past the same irrelevant postings makes job hunting exhausting. Goldpan is focused on improving user experience by quietly filtering your feed so you only see opportunities that actually matter to you. Sift through the dirt with Goldpan: Job Sifter and find only gold left behind!

Goldpan currently only works with non-AI job search when logged in to LinkedIn, with more search functionality coming soon.

## What It Does

* **Filters by category:** Blocks job cards based on the Job Title, Company Name, or Location.
* **Exact matching:** Goldpan filters out exact matches you provide. This is perfect for completely blocking specific company names you know you want to avoid.
* **Partial matching:** You can easily allow partial matches (substrings) to filter out broader terms. This is recommended for filtering out locations or generic job titles.
* **Fast and invisible:** It runs smoothly in the background. It doesn't slow down your browser or cause the page to lag, even if you scroll through the job feed for hours.

## How It Works

Instead of constantly scanning the whole page and slowing down your computer, Goldpan simply watches the job feed as you scroll. The exact second a new job card loads, Goldpan quickly checks the text. If the company, title, or location matches your blocked words, Goldpan instantly hides it before you even have to look at it.

## How to Install (Developer Version)

Since Goldpan is not yet in the Chrome Web Store, you will need to build it locally before loading it into your browser.

1. Download or clone this project repository to your computer.
2. Open your terminal in the project folder and run `npm install`.
3. Run `npm run build` or `npx vite build` to create the final extension files in a `dist` folder.
4. Open Google Chrome and navigate to `chrome://extensions/`.
5. Turn on **Developer mode** using the toggle switch.
6. Click **Load unpacked** at the top.
7. Select the `dist` folder inside your Goldpan project.
8. Go to the LinkedIn Jobs page, and watch the feed clean itself up!

## Setting Your Keywords

Right now, you manage your blocked words directly in `src/config/constants.ts`. Open the code and add your terms. 
As a best practice:
* Use **exact matching** for company names or other specific strings.
* Use **partial matching (substrings)** for job titles and broad locations. **Warn**: being too general with partial matches will result in unintended filtering.

## What's Next

* Multitool Upgrade: Functionality for AI search and regular job search when not logged in to LinkedIn.
* Non-Stick Coating for Reposted Jobs: Collect reposted jobs as you search so that you never see them in the future.
* Easier Sifting: Building a popup UI so you can easily add, remove, and toggle your blocked words right from your browser, without ever needing to touch the code.

---

## Contributing

**Currently, I am not accepting direct Pull Requests for this repository.** Goldpan: Job Sifter is in early, active development, and I am focused on building out the core roadmap. However, the project is open-source! You are highly encouraged to **Fork** this repository, modify the code to fit your own job-hunting needs, and experiment with it on your own GitHub account. 

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

---