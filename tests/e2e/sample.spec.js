const { expect } = require('chai')

describe('sample test', function () {
  let page

  before (async function () {
    page = await browser.newPage()

    page.on('console', msg => {
      console.log('console: ', msg)
    })

    await page.goto('https://rodbb-lambic-test.firebaseapp.com')
    await page.waitForSelector('.application--wrap')
  })

  after (async function () {
    await page.close()
  })

  describe('check content on first dislpay' , function () {
    it('check title', async function () {
      expect(await page.title()).to.eql('Lambic')
    })
  
    it('check userName', async function () {
      var userName = await page.$eval('#userName', item => {
          return item.textContent
      })
      expect(await userName.toString()).to.eql('ゲストユーザ')
    })
  })
})
