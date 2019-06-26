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

Given('a base {string} em teste', async function (string) {
  const innerText = await this.page.$eval('#graphit_ref', el => el.innerText);
  assert.equal(innerText, string);
});

Given('que não há informação gravada na base de dados', async function () {
  await firebase.database().ref(test_ref).remove();
});

Given('a seguinte lista de livros', async function (dataTable) {
  this.tabelaLivros = dataTable.hashes();
});

Given('a seguinte lista de capítulos do Evangelho de João', async function (dataTable) {
  this.capítulosJoão = dataTable.hashes();
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

When('digitar {string}', {timeout: 1000 * 30}, async function (string) {
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

When('teclar "Ctrl" + "Enter"', async function () {
  await this.page.keyboard.down('Control');
    await keypress('Enter', this.page);
  await this.page.keyboard.up('Control');
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

Then('cada livro deve estar com {int}px de identação', async function (int) {
  const livros = this.tabelaLivros.map((val) => val.livro);
  const boxes = await bounds(this.page, livros);

  for (let i = 0; i < livros.length; i++) {
    let box_livro_cur = boxes[livros[i]];
    assert(box_livro_cur.x === int, `Expect: ${int}, '${livros[i]}'.x: ${box_livro_cur.x}`);
  }
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
    `'${primeiroLivro}'.top: ${bs[primeiroLivro].top}, 
     '${string}'.bottom: ${bs[string].bottom}`);
});

Then('cada livro deve estar abaixo de seu antecessor', async function () {
  const livros = this.tabelaLivros.map((val) => val.livro);
  const boxes = await bounds(this.page, livros);

  for (let i = 1; i < livros.length; i++) {
    let box_livro_cur = boxes[livros[i]];
    let box_livro_ant = boxes[livros[i-1]];
    
    assert(box_livro_cur.top >= box_livro_ant.bottom, 
      `'${livros[i]}'.top: ${box_livro_cur.top}, 
       '${livros[i-1]}'.bottom: ${box_livro_ant.bottom}`);
  }
});

Then('{string} deve estar com {int}px de identação', async function (string, int) {
  const bs = await bounds(this.page, [string]);
  assert(bs[string].x === int, `'${string}.x: ${bs[string].x}, expected: ${int}`);
});