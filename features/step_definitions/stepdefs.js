const assert = require('assert');
const { Given, When, Then, BeforeAll, AfterAll } = require('cucumber');

const puppeteer = require('puppeteer');
const firebase = require('firebase');

let browser;
const test_ref = '__graphit-test__';
const node_selector = '.Graphit-Node';

const type = async (string, page) => {
  const focusedField = await page.$(':focus');
  await focusedField.type(string, {delay: 50});
}

const keypress = async (key, page) => {
  await page.keyboard.press(key);
}

const delay = async (s, page) => {
  await page.waitFor(1000 * s);
}

const contents = page => {
  return page.$$eval(node_selector, nodes => nodes.map(n => n.innerText));
}

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

Given('que não há informação gravada na base de dados', async function () {
  await firebase.database().ref(test_ref).remove();
});

Given('a seguinte lista de livros', async function (dataTable) {
  this.tabelaLivros = dataTable.hashes();
});

When('acessar página {string}', {timeout: 1000 * 30}, async function (url) {
  this.page = await browser.newPage();
  await this.page.goto(url);
});

When('aguardar {int} segundo(s)', {timeout: 1000 * 30}, async function (n) {
  await delay(n, this.page);
});

When('clicar sobre o primeiro campo', async function () {
  this.primeiroCampo = await this.page.$(node_selector);
  await this.primeiroCampo.click();
});

When('digitar {string}', async function (string) {
  await type(string, this.page);
});

When('fechar a página', async function () {
  await this.page.close();
});

const assertSome = (innerTexts, test) => {
  assert.ok(innerTexts.some(innerText => innerText === test), 
            `Tst: ${test} Nodos: ${innerTexts}`);
}

Then('deve existir um campo com o texto {string}', async function (string) {
  const innerTexts = await contents(this.page);
  assertSome(innerTexts, string);
});

When('teclar "Enter"', async function() {
  await keypress('Enter', this.page);
});

When('digitar os livros teclando {string} com delay de {int} segundo(s):', {timeout: 1000 * 30}, 
  async function (string, int) {
    for (const row of this.tabelaLivros) {
      await keypress('Enter', this.page);
      await delay(int, this.page);
      await type(row['livro'], this.page);
      await delay(int, this.page);
    }
  }
);

Then('deve existir um campo para cada livro da lista', async function () {
  const innerTexts = await contents(this.page);
  for (const row of this.tabelaLivros) {
    assertSome(innerTexts, row['livro']);
  }
});

Then('cada livro deve estar com {int} identação', async function (int) {
  const boxes = await this.page.$$eval(node_selector, (nodes, livros) => {
    let livros_elems = nodes.filter(node => livros.some(node.innerText));
    return livros_elems.map(elem => elem.getBoundingClientRect());
  }, this.tabelaLivros.map((val) => val.livro));

  console.log(boxes);
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

const bounds = (page, textos) => {
  return page.$$eval(node_selector, (nodes, textos) => {
    const bs = {};
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      if (textos.some(texto => texto === node.innerText)) {
        let {x, y, bottom, top} = node.getBoundingClientRect();
        bs[node.innerText] = {
          x, y, bottom, top
        };
      }
    }
    return bs;
  }, textos);
}

Then('o primeiro livro deve estar abaixo de {string}', async function (string) {
  const primeiroLivro = this.tabelaLivros[0]['livro'];
  const bs = await bounds(this.page, [primeiroLivro, string]);

  assert(bs[primeiroLivro].top >= bs[string].bottom, 
    `${primeiroLivro}.top: ${bs[primeiroLivro].top}, 
     ${string}.bottom: ${bs[string].bottom}`);
});

Then('cada livro deve estar abaixo de seu antecessor', async function () {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});