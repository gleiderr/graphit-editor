# language: pt
Funcionalidade: Redação de nodos bíblicos e seus comentários
    Eu como estudante da Bíblia Sagrada desejo escrever textos bíblicos, relacioná-los a seus respectivos versículos, livros e capítulos. Além de escrever comentários reutilizáveis que estejam relacionados à Bíblia, versículos, livros, capítulos ou outros comentários. Isso porque durante a leitura tenho várias revelações e entendimentos que se não forem registrados podem ser esquecidos.

    Contexto: Acesso base de teste limpa
        Dado acessar página 'localhost:3000'
        E aguardar 1 segundo
        E a base "__graphit-test__" em teste
        #E aguardar 3 segundos
        #E fechar a página
        #Dado que não há informação gravada na base de dados

    Cenário: Inclusão de título de livros em "Bíblia Sagrada"
        Dado as instruções
            | pré      | Texto                       | pós          |
            | digitar  | Bíblia Sagrada              | Enter        |
            | digitar  | Gênesis                     | Enter        |
            | digitar  | Evangelho de João           | Ctrl + Enter |
            | digitar  | No princípio era o Verbo... | Ctrl + Enter |
            | digitar  | Comentário                  |              |
            | arrastar | Comentário                  | Gênesis      |
            | digitar  | _Teste                       | Ctrl + Enter |
            | digitar  | Adendo                      |              |
        Quando acessar página 'localhost:3000'
        E aguardar 4 segundos
        E clicar sobre o primeiro campo
        E executar as instruções
        E aguardar 2 segundos
        E fechar a página
        E acessar página 'localhost:3000'
        E aguardar 4 segundos
        Então o conteúdo da página deve ser
            """
            Bíblia Sagrada
            	Gênesis
            		Comentário_Teste
            			Adendo
            	Evangelho de João
            		No princípio era o Verbo...
            			Comentário_Teste
            				Adendo
            """
            
    #Cenário: Inclusão de texto 'No princípio era o Verbo, o Verbo estava com Deus...' contido no 'Evangelho de João' e aresta para esse texto contendo etiqueta "Versículo 1"