const assert = require('assert');
const { Given, When, Then, BeforeAll, AfterAll } = require('cucumber');

const puppeteer = require('puppeteer');
const firebase = require('firebase');

let browser;
const test_ref = '__graphit-test__';

BeforeAll({timeout: 60 * 1000}, async function () {
  //Acesso à página
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 25,
  });
  
  //Acesso ao firebase
  const config = {
    apiKey: "AIzaSyDw44kycEYrMUc3RJ_WQ1Oe5ztZqx_S_is",
    authDomain: "graphit-js.firebaseapp.com",
    databaseURL: "https://graphit-js.firebaseio.com",
    projectId: "graphit-js",
    storageBucket: "graphit-js.appspot.com",
    messagingSenderId: "694181552879"
  };
  firebase.initializeApp(config);
})

AfterAll(async function() {
  await browser.close();
  console.log('Fim!');
});

Given('que não há informação gravada na base de dados', function () {
  firebase.database().ref(test_ref).remove();
});

When('acessar página {string}', {timeout: 1000 * 30}, async function (url) {
  this.page = await browser.newPage();
  await this.page.goto(url);
});

When('aguardar {int} segundo(s)', {timeout: 1000 * 30}, async function (n) {
  await this.page.waitFor(1000 * n);
});

When('clicar sobre o primeiro campo', async function () {
  this.primeiroCampo = await this.page.$('.Graphit-Node');
  await this.primeiroCampo.click();
});

When('digitar {string}', async function (string) {
  const focusedField = await this.page.$(':focus');
  await focusedField.type(string, {delay: 30});
});

When('fechar a página', async function () {
  await this.page.close();
});

Then('deve existir um campo com o texto {string}', async function (string) {
  const innerTexts = await this.page.$$eval('.Graphit-Node', ns => ns.map(n => n.innerText));
  assert.ok(innerTexts.some(innerText => innerText === string), `Nodos existentes: ${innerTexts}`);
});

When('teclar "Enter"', async function() {
  await this.page.keyboard.press('Enter');
});