import { Cluster } from 'puppeteer-cluster';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { Command } from 'commander';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

class GoogleMapsBusinessScraper {
    constructor(options = {}) {
        this.options = {
            maxConcurrency: options.maxConcurrency ?? 4,
            useParallel: options.useParallel ?? true,
            headless: options.headless ?? true,
            maxResults: options.maxResults ?? 50,
            delay: options.delay ?? 2000,
            verbose: options.verbose ?? false,
            retryLimit: options.retryLimit ?? 3,
            timeout: options.timeout ?? 45000,
            googleSheetsId: options.googleSheetsId,
            outputFormat: options.outputFormat ?? 'both',
            scrollStrategy: options.scrollStrategy ?? 'double',
            maxScrollAttempts: options.maxScrollAttempts ?? 15,
            scrollDelay: options.scrollDelay ?? 2000,
            ...options
        };
        
        this.selectors = {
            feedContainer: '[role="feed"]',
            resultContainer: '.Nv2PK',
            resultLinks: 'a[href*="/place/"]',
            businessName: 'h1.DUwDvf.lfPIob',
            businessCategory: 'button.DkEaL',
            websiteLink: 'a[data-item-id="authority"]',
            phoneNumber: 'button[aria-label^="Phone:"]',
            address: 'button[data-item-id="address"]',
            rating: 'div.F7nice span[aria-hidden="true"]',
            reviewCount: 'button[aria-label*="reviews"]',
            hours: 'div[aria-label*="Hours"]',
            priceLevel: 'span[aria-label*="Price"]'
        };
        
        this.results = [];
        this.cluster = null;
        this.browser = null;
        this.page = null;
        this.googleSheet = null;
        this.stats = {
            total: 0,
            processed: 0,
            successful: 0,
            failed: 0,
            scrollAttempts: 0,
            startTime: null,
            endTime: null,
            mode: 'sequential'
        };
    }

    async performDoubleScroll(page) {
        return await page.evaluate(() => {
            const container = document.querySelector('[role="feed"]');
            if (!container) return { success: false, error: 'No feed container found' };
            
            const beforeScrollTop = container.scrollTop;
            const beforeHeight = container.scrollHeight;
            
            container.scrollTop += 800;
            
            setTimeout(() => {
                container.scrollTop += 200;
            }, 500);
            
            return {
                success: true,
                beforeScrollTop,
                afterScrollTop: container.scrollTop + 200,
                beforeHeight,
                heightChanged: container.scrollHeight > beforeHeight
            };
        });
    }

    async handleInfiniteScroll(page, maxResults) {
        let scrollAttempts = 0;
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 3;
        
        while (scrollAttempts < this.options.maxScrollAttempts) {
            try {
                const currentResults = await page.$$eval(this.selectors.resultContainer, els => els.length);
                
                if (currentResults >= maxResults) {
                    break;
                }

                const scrollResult = await this.performDoubleScroll(page);
                
                if (!scrollResult.success) {
                    consecutiveFailures++;
                    if (consecutiveFailures >= maxConsecutiveFailures) {
                        break;
                    }
                    continue;
                }

                consecutiveFailures = 0;
                await new Promise(resolve => setTimeout(resolve, this.options.scrollDelay));

                const newResultCount = await page.$$eval(this.selectors.resultContainer, els => els.length);
                
                if (newResultCount === currentResults) {
                    break;
                }
                
                scrollAttempts++;
                this.stats.scrollAttempts = scrollAttempts;
                
            } catch (error) {
                scrollAttempts++;
                consecutiveFailures++;
            }
        }
        
        const finalCount = await page.$$eval(this.selectors.resultContainer, els => els.length);
        return {
            totalResults: finalCount,
            scrollAttempts,
            success: finalCount > 0
        };
    }

    async extractBusinessData(page, query, resultIndex) {
        return await page.evaluate((selectors, query, resultIndex) => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.textContent.trim() : 'Not Found';
            };

            const getHref = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.href : 'Not Found';
            };

            const getPhoneFromAria = (selector) => {
                const el = document.querySelector(selector);
                if (el) {
                    const ariaLabel = el.getAttribute('aria-label');
                    return ariaLabel ? ariaLabel.replace('Phone: ', '').trim() : 'Not Found';
                }
                return 'Not Found';
            };

            const getCoordinates = () => {
                const urlMatch = window.location.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (urlMatch) {
                    return {
                        lat: parseFloat(urlMatch[1]),
                        lng: parseFloat(urlMatch[2])
                    };
                }
                return null;
            };

            return {
                name: getText(selectors.businessName),
                category: getText(selectors.businessCategory),
                website: getHref(selectors.websiteLink),
                phone: getPhoneFromAria(selectors.phoneNumber),
                address: getText(selectors.address),
                rating: getText(selectors.rating),
                reviewCount: getText(selectors.reviewCount),
                hours: getText(selectors.hours),
                priceLevel: getText(selectors.priceLevel),
                coordinates: getCoordinates(),
                searchQuery: query,
                resultIndex: resultIndex,
                googleMapsUrl: window.location.href,
                extractedAt: new Date().toISOString()
            };
        }, this.selectors, query, resultIndex);
    }

    async scrapeSequential(query, maxResults) {
        try {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-gpu'
                ]
            });

            this.page = await this.browser.newPage();
            
            await this.page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            );

            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `https://www.google.com/maps/search/${encodedQuery}`;
            
            await this.page.goto(searchUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            await this.page.waitForSelector(this.selectors.resultContainer, { timeout: 20000 });
            await new Promise(resolve => setTimeout(resolve, this.options.delay));
            
            const scrollResult = await this.handleInfiniteScroll(this.page, maxResults);
            
            if (!scrollResult || !scrollResult.success) {
                const currentCount = await this.page.$$eval(this.selectors.resultContainer, els => els.length);
                if (currentCount === 0) {
                    throw new Error('Failed to load any results during scrolling');
                }
            }
            
            const businessUrls = await this.page.$$eval(this.selectors.resultLinks, links => 
                Array.from(links, (link, index) => ({
                    url: link.href,
                    index: index + 1
                }))
            );
            
            const resultsToProcess = Math.min(maxResults, businessUrls.length);
            
            for (let i = 0; i < resultsToProcess; i++) {
                const business = businessUrls[i];
                
                try {
                    await this.page.goto(business.url, {
                        waitUntil: 'networkidle2',
                        timeout: this.options.timeout
                    });
                    
                    await this.page.waitForSelector(this.selectors.businessName, { timeout: 10000 });
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    const businessDetails = await this.extractBusinessData(this.page, query, i + 1);
                    
                    if (businessDetails && businessDetails.name !== 'Not Found') {
                        this.results.push(businessDetails);
                        this.stats.successful++;
                    } else {
                        this.stats.failed++;
                    }

                    if (i < resultsToProcess - 1) {
                        const delay = this.options.delay + Math.random() * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }

                } catch (error) {
                    this.stats.failed++;
                    continue;
                }
                
                this.stats.processed++;
            }

            return this.results;

        } catch (error) {
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Express endpoints
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/scrape-gmaps', async (req, res) => {
    try {
        const { query, maxResults = 15, mode = 'sequential' } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        console.log(`Starting scrape for "${query}" with maxResults=${maxResults}, mode=${mode}`);
        
        const scraper = new GoogleMapsBusinessScraper({
            useParallel: mode === 'parallel',
            maxResults: maxResults,
            headless: 'new'
        });

        const results = await scraper.scrapeSequential(query, maxResults);
        
        res.json({
            results,
            stats: scraper.stats
        });

    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ error: error.message });
    }
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 