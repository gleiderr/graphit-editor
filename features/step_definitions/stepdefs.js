const assert = require('assert');
const { Given, When, Then, BeforeAll, AfterAll } = require('cucumber');

const puppeteer = require('puppeteer');
const firebase = require('firebase');
const { Graphit } = require('graphit');
const { Graphit_Firebase } = require('graphit-firebase');

let acessível;
let browser;
let g;
const test_ref = '__graphit-test__';

BeforeAll({timeout: 60 * 1000}, async function () {
  //Acesso à página
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 0,
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

  //Configurando conexão da base de dados com graphit
  const db = new Graphit_Firebase(firebase.database(), test_ref);
  g = new Graphit(db);
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

When('clicar sobre o primeiro campo', async function () {
  this.primeiroCampo = await this.page.$('#_0');
  await this.primeiroCampo.click();
});

When('digitar {string}', async function (string) {
  await this.primeiroCampo.type(string);
});

When('fechar a página', async function () {
  await this.page.close();
});

Then('o conteúdo do primeiro campo deve ser {string}', async function (string) {
  this.primeiroCampo = await this.page.$('#_0');
  const innerText = await this.page.$eval('#_0', el => el.innerText);
  assert.equal(innerText, string);
});