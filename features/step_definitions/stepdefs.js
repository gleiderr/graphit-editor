const assert = require('assert');
const { Given, When, Then, BeforeAll } = require('cucumber');
const puppeteer = require('puppeteer');

let acessível;
BeforeAll({timeout: 60 * 1000}, async function () {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
  });
  const page = await browser.newPage();
  const response = await page.goto('http://example.com/');

  acessível = response.ok();
})

Given('que o site do graphit está acessível.', {timeout: 30 * 1000}, async function () {
  assert.ok(acessível, `Site não acessível ${acessível}`);
});

Given('que não há nenhuma informação gravada', function () {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

When('eu clicar sobre o primeiro campo', function () {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

When('digitar {string}', function (string) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

Then('{string} deve ser efetivamente gravado na base de dados', function (string) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

Then('aresta para esse texto deve conter etiqueta {string}', function (string) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});