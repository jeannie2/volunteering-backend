require('dotenv').config()
const puppeteer = require('puppeteer')

async function scrapePage(website, results) {
  const { url, source, titleSelector, descriptionSelector, linkSelector, mainLink } = website
  console.log(url, source, titleSelector, descriptionSelector, linkSelector, mainLink)

  const maxRetries = 3; // Maximum number of retries
  let retryCount = 0; // Retry counter

  while (retryCount < maxRetries) {
    try {
      const browser = await puppeteer.connect({ browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}` })
      const page = await browser.newPage()
      await page.goto(url)

      await page.waitForSelector(linkSelector, { timeout: 120000 })

      const elements = await page.$(titleSelector)
      const descriptions = await page.$(descriptionSelector)
      const hrefValues = await page.$eval(linkSelector, elements => elements.map(element => element.getAttribute('href')))

      const data = await Promise.all(elements.map(async (element, index) => {
        let title = await element.evaluate(el => el.textContent);
        let description = await descriptions[index].evaluate(el => el.textContent)
        let hrefValue = hrefValues[index]
        let opportunityLink = mainLink + hrefValue

        if (title === '') {
          title = 'No title available'
        }

        if (description === '') {
          description = 'No description available'
        }

        if (opportunityLink === '') {
          description = 'No link available'
        }

        console.log('Title: ', title)
        console.log('Description:', description)
        console.log('hrefValue: ', hrefValue)
        console.log('opportunityLink :', opportunityLink)

        return { url, source, title, description, opportunityLink }
      }))

      results.push(...data)

      await browser.close()
      return; // Exit the function if successful
    } catch (error) {
      console.error(`Error scraping page ${url}:`, error)
      retryCount++; // Increment the retry counter
    }
  }

  console.error(`Failed to scrape page ${url} after ${maxRetries} retries`);
}

async function startScraping() {
  // Rest of your code...

  // Retry the scraping process for each website
  await Promise.all(websites.map(website => scrapePage(website, results)))

  return results
}

module.exports = { startScraping }
