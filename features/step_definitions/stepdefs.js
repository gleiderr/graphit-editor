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
      await page.waitFor(500);
      break;
    case 'Ctrl + Enter':
      await page.keyboard.down('Control');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Control');
      await page.waitFor(500);
      break;
    default:
      return 'pending';
  }
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

const type = async (string, page) => {
  const focusedField = await page.$(':focus');
  await focusedField.type(string, {delay: 50});
}

const delay = async (s, page) => {
  await page.waitFor(1000 * s);
}

const contents = page => {
  return page.$$eval(node_selector, nodes => nodes.map(n => n.innerText));
}

Given( 'as instruções', {timeout: 1000 * 30}, async function(dataTable) {
  this.textosComandos = dataTable.hashes();
})



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

When('executar as instruções', {timeout: 1000 * 30}, async function () {
  for (let linha of this.textosComandos) {
    switch (linha['pré']) {
      case 'digitar':
        await this.page.waitFor(200);
        await this.page.keyboard.press('End');
        await this.page.type(':focus', linha['Texto']); //armazena elemento do pptr
        break;
      case 'arrastar':
        // somente verifica no pós comando
        break;
      default:
        throw new Error(`Comando não implementado: ${linha['pré']}`)
    }

    switch (linha['pós']) {
      case 'Enter':
        await keypress('Enter', this.page);
        break;
      case 'Ctrl + Enter':
        await this.page.keyboard.down('Control');
          await keypress('Enter', this.page);
        await this.page.keyboard.up('Control');
        break;
      case '':
        break; //nope
      default:
        if (linha['pré'] === 'arrastar') {
          //Desenvolvido arraste falso devido à incapacidade atual do puppeteer
          //https://stackoverflow.com/questions/54561552/react-dragdrop-using-python-selenim-puppeteer
          //https://stackoverflow.com/questions/55848831/how-to-simulate-drag-drop-action-in-pupeteer
          //https://github.com/GoogleChrome/puppeteer/issues/1265
          //Mouse: https://github.com/GoogleChrome/puppeteer/blob/master/lib/Input.js
          //https://chromedevtools.github.io/devtools-protocol/tot/Input
          const nodes = await this.page.$$(node_selector);
          const aux = {};
          for (const node of nodes) {
            const inner = await this.page.evaluate(el => el.innerText, node);
            if ( inner === linha['Texto'] || inner === linha['pós']) {
              aux[inner] = node;
            }
          }
          
          //await aux[linha['Texto']].hover();
          //await mouse.down();
          await aux[linha['Texto']].click();
          await this.page.keyboard.down('Control');
            await keypress('KeyC', this.page);
          await this.page.keyboard.up('Control');
          
          //await aux[linha['pós']].hover();
          //await mouse.up();
          await aux[linha['pós']].click();
          await this.page.keyboard.down('Control');
            await keypress('KeyV', this.page);
          await this.page.keyboard.up('Control');
        }
    }
  }
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