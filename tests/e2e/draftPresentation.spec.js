const { expect } = require('chai')

describe('draft presentation test', function () {
  let page

  before (async function () {
    page = await browser.newPage()

    page.clear = async (selector)=>{
      const elem = await page.$(selector)
      await elem.click()
      await elem.focus()
      await elem.click({clickCount: 3})
      await elem.press('Backspace')
    }

    page.on('console', msg => {
      console.log('console: ', msg)
    })

    await page.goto('https://rodbb-lambic-test.firebaseapp.com')
    await page.waitForSelector('.application--wrap')
  })

  after (async function () {
    await page.close()
  })

  describe('new presentation', function () {
    it('no exist', async function () {
      await page.click('.title')

      const noDataText = await page.$eval('.e2e-nodata-text', item => item.textContent)
      expect(noDataText.toString().trim()).to.eql('まだ発表はありません。')
    })

    it('create', async function () {
      await page.evaluate(function () {
        document.getElementsByTagName('a')[0].__vue__.$store.state.user = {"id":"rC2s0n3TwD1fvIWSdGlN","name":"aaa","photoURL":"https://firebasestorage.googleapis.com/v0/b/rodbb-lambic-test.appspot.com/o/iine.png?alt=media","isAdmin":true}
      })

      await page.click('.e2e-submit-button')
      await page.waitForSelector('.headline')
      const draftPageHeadline = await page.$eval('.headline', item => item.textContent)
      expect(draftPageHeadline.toString()).to.eql('発表登録')

      await page.type('input[data-e2e-label="タイトル"]', 'new presentation title')
      await page.type('textarea[data-e2e-label="内容"]', 'new presentation description')
      await page.evaluate(function () {
        scrollTo(0, document.querySelector('input[aria-label="はい"]').getBoundingClientRect().top)
      })
      await page.click('input[aria-label="はい"]')
      await (await page.$x('//span[contains(text(), "公開")]'))[0].click()

      page.once('dialog', async dialog => {
        dialog.accept() // OK
      })
      await page.click('.e2e-submit-button')

      await page.waitForSelector('.headline')
      const viewPageHeadline = await page.$eval('.headline', item => item.textContent)
      expect(viewPageHeadline.toString()).to.eql('ddd')
      const presentationTitle = await page.$eval('.e2e-list-title .title', item => item.textContent.trim())
      expect(presentationTitle.toString()).to.eql('new presentation title')
    })
  })

  describe('update presentation', function () {
    it('a data exist', async function () {
      const presentationTitle = await page.$eval('.e2e-list-title .title', item => item.textContent.trim())
      expect(presentationTitle.toString().trim()).to.eql('new presentation title')
    })

    it('update', async function () {
      await (await page.$x('//*[contains(text(), "new presentation title")]'))[0].click()

      await page.waitForSelector('.headline')
      await (await page.$x('//*[contains(@class, "e2e-menu-button")]'))[0].click()
      await (await page.$x('//*[contains(text(), "編集する")]'))[0].click()

     await page.waitForSelector('.headline')
      const draftPageHeadline = await page.$eval('.headline', item => item.textContent)
      expect(draftPageHeadline.toString()).to.eql('発表登録')

      await page.clear('input[data-e2e-label="タイトル"]')
      await page.type('input[data-e2e-label="タイトル"]', 'updated presentation title')
      await page.clear('textarea[data-e2e-label="内容"]')
      await page.type('textarea[data-e2e-label="内容"]', 'updated presentation description')
      await page.evaluate(function () {
        scrollTo(0, document.querySelector('input[aria-label="いいえ"]').getBoundingClientRect().top)
      })
      await page.click('input[aria-label="いいえ"]')
      await (await page.$x('//span[contains(text(), "公開")]'))[0].click()

      page.once('dialog', async dialog => {
        dialog.accept() // OK
      })
      await page.click('.e2e-submit-button')

      await page.waitForSelector('.headline')
      const viewPageHeadline = await page.$eval('.headline', item => item.textContent)
      expect(viewPageHeadline.toString()).to.eql('updated presentation title')
    })
  })

  describe('delete presentation', function () {
    it('delete', async function () {
      await (await page.$x('//*[contains(@class, "e2e-menu-button")]'))[0].click()
      page.once('dialog', async dialog => {
        dialog.accept() // OK
      })
      await (await page.$x('//*[contains(text(), "削除する")]'))[0].click()

      await page.waitForSelector('.e2e-nodata-text')
      const noDataText = await page.$eval('.e2e-nodata-text', item => item.textContent)
      expect(noDataText.toString().trim()).to.eql('まだ発表はありません。')
    })
  })
})
