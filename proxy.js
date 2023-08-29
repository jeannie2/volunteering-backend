require('dotenv').config()
const puppeteer = require('puppeteer')

async function scrapePage(website, results) {
  const { url, source, titleSelector, descriptionSelector, linkSelector, mainLink } = website
  console.log(url, source, titleSelector, descriptionSelector, linkSelector, mainLink)

  try {
    const browser = await puppeteer.connect({ browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}` })

    const page = await browser.newPage()
    await page.goto(url)

    await page.waitForSelector(linkSelector, { timeout: 120000 })

    const elements = await page.$$(titleSelector)
    const descriptions = await page.$$(descriptionSelector)
    const hrefValues = await page.$$eval(linkSelector, elements => elements.map(element => element.getAttribute('href')))

    const data = await Promise.all(elements.map(async (element, index) => {
      const title = await element.evaluate(el => el.textContent);
      let description = await descriptions[index].evaluate(el => el.textContent)
      let hrefValue = hrefValues[index]
      let opportunityLink = mainLink + hrefValue

      if (description.trim() === '') {
        description = 'No description available'
      }

      if (opportunityLink.trim() === '') {
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
  } catch (error) {
    console.error(`Error scraping page ${url}:`, error)
    throw error
  }
}

async function startScraping() {
  const websites = [
    {
      url: 'https://timeauction.org/en/projects?q%5Bby_skill_categories%5D%5B%5D=52&q%5Bby_skill_categories%5D%5B%5D=48&q%5Bby_volunteer_position_or_details_or_location%5D=&page=1',
      source: 'Time Auction',
      titleSelector: 'h5.project-card_content-title',
      descriptionSelector: 'p.project-card_hover-preview-org',
      linkSelector: 'a[href^="/en/project/"]',
      mainLink: 'https://www.timeauction.org',
    },
    // {
    //   url: 'https://www.catchafire.org/volunteer/software-it?order=recent&page=1&slug=software-it&page=1',
    //   source: 'Catchafire',
    //   titleSelector: 'h4.ids--type-display-small.caf-my-3',
    //   descriptionSelector: 'h6.ids--type-caption.ids--color-type-base-text-subdued.truncate-2',
    //   linkSelector: 'a.caf-card-listing-container',
    //   mainLink: 'https://www.catchafire.org',
    // },
    {
      url: 'https://www.taprootplus.org/opportunities?utf8=%E2%9C%93&search%5Bkeyword%5D=&search%5Bscope%5D=all&search%5Btype%5D=all&search%5Bsort_by%5D=recent&search%5Bcategories%5D%5B%5D=20&page=1',
      source: 'Taproot Foundation',
      titleSelector: 'h4.opportunity-content__title',
      descriptionSelector: 'h3.opportunity-content__organization',
      linkSelector: 'a.opportunity-content',
      mainLink: 'https://www.taprootplus.org',
    }
  ]

  const results = []

  await Promise.all(websites.map(website => scrapePage(website, results)))

  return results
}

module.exports = { startScraping }
