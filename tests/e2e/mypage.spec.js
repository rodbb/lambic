const { expect } = require('chai')

describe('mypage test', function () {
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

  describe('first dislpay content' , function () {
    it('title', async function () {
      expect(await page.title()).to.eql('Lambic')
    })
  
    it('userName', async function () {
      const userName = await page.$eval('#userName', item => item.textContent)
      expect(userName.toString()).to.eql('ゲストユーザ')
    })
  })

  describe('change login userName' , function () {
    it('login userName', async function () {
      await page.evaluate(function () {
        // HACK: 
        document.getElementsByTagName('a')[0].__vue__.$store.state.user = {"id":"rC2s0n3TwD1fvIWSdGlN","name":"aaa","photoURL":"https://firebasestorage.googleapis.com/v0/b/rodbb-lambic.appspot.com/o/iine.png?alt=media","isAdmin":true}
      })

      const userName = await page.$eval('#userName', item => item.textContent)
      expect(userName.toString()).to.eql('aaa')
    })

    it('change userName', async function () {
      await page.click('.e2e-left-menu button')
      await page.click('.e2e-go-mypage')
      
      const headline = await page.$eval('.headline', item => item.textContent)
      expect(headline.toString()).to.eql('アカウント情報')

      await page.clear('input[data-e2e-label="userName"]')
      await page.type('input[data-e2e-label="userName"]', 'new name')
      await page.click('.e2e-submit-button')

      userName = await page.$eval('#userName', item => item.textContent)
      expect(userName.toString()).to.eql('new name')
    })
  })
})
