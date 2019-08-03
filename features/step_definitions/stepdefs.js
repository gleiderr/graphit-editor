const assert = require('assert');
const { Given, When, Then, BeforeAll, AfterAll } = require('cucumber');
const puppeteer = require('puppeteer');

let page, browser;
BeforeAll({timeout: 60 * 1000}, async function () {
  //Acesso à página
  browser = await puppeteer.launch({
    headless: false,
    //slowMo: 25,
  });
  [page] = await browser.pages();
  await page.goto('localhost:3000', {waitUntil: 'networkidle2'});
})

AfterAll(async function() {
  await browser.close();
  console.log('Fim!');
});

Given('conectado à base de testes', async function () {
  const test_ref = '__graphit-test__';
  const db_ref = await page.evaluate(() => document.db_ref);
  assert.equal(db_ref, test_ref);
});

Given('base de testes vazia', async function () {
  await page.evaluate(async () => await document.clearTestRef());
  await page.reload({waitUntil: 'networkidle2'});
  await page.waitFor(500);
});

Given('foco no primeiro nodo', async function () {
  await page.focus('.Graphit-Node');
});

When('digitar {string}', {timeout: 1000 * 30}, async function (string) {
  await page.keyboard.type(string);
  await page.waitFor(500);
});

When('atualizar página', async function () {
  await page.reload({waitUntil: 'networkidle2'});
  await page.waitFor(600);
});

When('teclar {string}', async function(key) {
  switch (key) {
    case 'Enter': case 'Tab':
      await page.keyboard.press(key);
      await page.waitFor(600);
      break;
    case 'Ctrl + Enter':
      await page.keyboard.down('Control');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Control');
      await page.waitFor(600);
      break;
    default:
      return 'pending';
  }
});

When('teclar {string} + {string}', async function (mod, key) {
  await page.keyboard.down(mod);
  await page.keyboard.press(key);
  await page.keyboard.up(mod);
  await page.waitFor(600);
});

When('arrastar o segundo nodo sobre o primeiro', async function () {
  const [primeiro, segundo] = await page.$$('.Row');  
  await segundo.hover();
  await page.mouse.down();
  await primeiro.hover();
  await page.mouse.up();
  await page.waitFor(2000);
});

Then('conteúdo da página deve ser igual a', async function (docString) {
  const innerText = await page.$eval('#root', 
    el => el.innerText.replace(/\xa0/g, ' ') //subustituindo &nbsp por espaço em branco (\xa0 === &nbsp;)
  );
  assert.equal(docString, innerText);
});