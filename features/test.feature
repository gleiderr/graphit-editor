# language: pt
Funcionalidade: Redação de nodos bíblicos e seus comentários
    Eu como estudante da Bíblia Sagrada desejo escrever textos bíblicos, relacioná-los a seus respectivos versículos, livros e capítulos. Além de escrever comentários reutilizáveis que estejam relacionados à Bíblia, versículos, livros, capítulos ou outros comentários. Isso porque durante a leitura tenho várias revelações e entendimentos que se não forem registrados podem ser esquecidos.

    Contexto: Acesso base de teste limpa
        Dado acessar página 'localhost:3000'
        E aguardar 1 segundo
        E a base "__graphit-test__" em teste
        E fechar a página
        #Dado que não há informação gravada na base de dados

    Cenário: Inclusão de título de livros em "Bíblia Sagrada"
        Dado a seguinte lista de livros
            |livro              |
            |Evangelho de Mateus|
            |Evangelho de Marcos|
            |Evangelho de João  |
        E a seguinte lista de capítulos do Evangelho de João
            |Capítulo  |
            |Capítulo 1|
            |Capítulo 2|
            |Capítulo 3|
            |Capítulo 4|
        Quando acessar página 'localhost:3000'
        E aguardar 2 segundos
        E clicar sobre o primeiro campo
        E digitar "Bíblia Sagrada"
        E aguardar 2 segundos
        E digitar os livros teclando "Enter" com delay de 1 segundo:
        E aguardar 2 segundos
        E teclar "Ctrl" + "Enter"
        E aguardar 1 segundo
        E digitar "Capítulo 1"
        E aguardar 2 segundos
        E teclar "Ctrl" + "Enter"
        E aguardar 1 segundo
        E digitar "No princípio era o Verbo..."
        #E aguardar 1 segundo
        #E teclar "Ctrl" + "Enter"
        #E digitar "Comentário..."
        #E arrastar comentário para primeiro livro
        E aguardar 2 segundos
        E fechar a página
        E acessar página 'localhost:3000'
        E aguardar 4 segundos
        Então o conteúdo da página deve ser
            """
            Bíblia Sagrada
            	Evangelho de Mateus
            	Evangelho de Marcos
            	Evangelho de João
            		Capítulo 1
            			No princípio era o Verbo...
            """
        #Então deve existir um campo com o texto "Bíblia Sagrada"
        #E deve existir um campo para cada livro da lista
        #E o primeiro livro deve estar abaixo de "Bíblia Sagrada"
        #E cada livro deve estar abaixo de seu antecessor
        #E cada livro deve estar com 10px de identação
        #E "Capítulo 1" deve estar com 20px de identação
        #E "No princípio era o Verbo..." deve estar com 30px de identação

    #Cenário: Exibição de nodo liberado para edição (verde, amarelo, vermelho)
    #Cenário: 
    #Cenário: Inclusão de texto 'Capítulo 1' contido em 'Evangelho de João'

    #Cenário: Inclusão de texto 'No princípio era o Verbo, o Verbo estava com Deus...' contido no 'Evangelho de João' e aresta para esse texto contendo etiqueta "Versículo 1"