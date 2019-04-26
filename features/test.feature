# language: pt
Funcionalidade: fasd
    Eu como estudante da Bíblia Sagrada desejo escrever textos bíblicos, relacioná-los a seus respectivos versículos, livros e capítulos. Além de escrever comentários reutilizáveis que estejam relacionados à Bíblia, versículos, livros, capítulos ou outros comentários. Isso porque durante a leitura tenho várias revelações e entendimentos que se não forem registrados podem ser esquecidos.

    Contexto:
        Dado que o site do graphit está acessível.

    Cenário: Inclusão de texto 'Bíblia Sagrada'
        Dado que não há nenhuma informação gravada
        Quando eu clicar sobre o primeiro campo
        E digitar "Bíblia Sagrada"
        Então "Bíblia Sagrada" deve ser efetivamente gravado na base de dados

    Cenário: Inclusão de texto 'qualquer'
        Dado que não há nada

    Cenário: Inclusão de texto 'Evangelho de João' contido em 'Bíblia Sagrada'

    Cenário: Inclusão de texto 'Capítulo 1' contido em 'Evangelho de João'

    Cenário: Inclusão de texto 'No princípio era o Verbo, o Verbo estava com Deus...' contido no 'Evangelho de João'
        Então aresta para esse texto deve conter etiqueta "Versículo 1"