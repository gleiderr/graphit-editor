# language: pt
Funcionalidade: Redação de nodos bíblicos e seus comentários
    Eu como estudante da Bíblia Sagrada desejo escrever textos bíblicos, relacioná-los a seus respectivos versículos, livros e capítulos. Além de escrever comentários reutilizáveis que estejam relacionados à Bíblia, versículos, livros, capítulos ou outros comentários. Isso porque durante a leitura tenho várias revelações e entendimentos que se não forem registrados podem ser esquecidos.

    Background: Background name
        #Dado que é aceito um delay de 1 segundo após "acesso a página"
        #E que é aceito um delay de 1 segundo após "terminar de digitar" 

    Esquema do Cenário: Inclusão de texto "<Versão da Bíblia>"
        Dado que não há informação gravada na base de dados
        Quando acessar página 'localhost:3000'
        E aguardar 1 segundo
        E clicar sobre o primeiro campo
        E digitar "<Versão da Bíblia>"
        E aguardar 1 segundo
        E fechar a página
        E acessar página 'localhost:3000'
        E aguardar 1 segundo
        Então deve existir um campo com o texto "<Versão da Bíblia>"

        Exemplos:
        | Versão da Bíblia |
        | Bíblia Sagrada   |
        | Bíblia King James|

    Cenário: Inclusão de texto "Evangelho de João" em "Bíblia Sagrada"
        Dado que não há informação gravada na base de dados
        Quando acessar página 'localhost:3000'
        E aguardar 1 segundo
        E clicar sobre o primeiro campo
        E digitar "Bíblia Sagrada"
        E aguardar 1 segundo
        E teclar "Enter"
        E digitar "Evangelho de João"
        E aguardar 1 segundo
        Então deve existir um campo com o texto "Bíblia Sagrada"
        E deve existir um campo com o texto "Evangelho de João"

    #Cenário: Inclusão de texto 'Capítulo 1' contido em 'Evangelho de João'

    #Cenário: Inclusão de texto 'No princípio era o Verbo, o Verbo estava com Deus...' contido no 'Evangelho de João'
    #    Então aresta para esse texto deve conter etiqueta "Versículo 1"