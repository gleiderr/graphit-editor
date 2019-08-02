# language: pt
Funcionalidade: Redação de nodos bíblicos e seus comentários
    Eu como estudante da Bíblia Sagrada desejo escrever textos bíblicos, relacioná-los a seus respectivos versículos, livros e capítulos. Além de escrever comentários reutilizáveis que estejam relacionados à Bíblia, versículos, livros, capítulos ou outros comentários. Isso porque durante a leitura tenho várias revelações e entendimentos que se não forem registrados podem ser esquecidos.

    Contexto:
        Dado conectado à base de testes
        E base de testes vazia
        E foco no primeiro nodo

    Cenário: Registro e recuperação de nodo
        Quando digitar "Bíblia Sagrada"
        E atualizar página
        Então conteúdo da página deve ser igual a
        """
        Bíblia Sagrada
        """

    Esquema do Cenário: Criação de novo nodo
        Quando digitar "Bíblia Sagrada"
        E teclar "<Comando>"
        E teclar "Tab"
        E digitar "Livro:"
        E teclar "Tab"
        E digitar "Gênesis"
        Então conteúdo da página deve ser igual a
        """
        Bíblia Sagrada
        	Livro: Gênesis
        """
        Exemplos:
        | Comando      |
        | Enter        |
        | Ctrl + Enter |

    Cenário: Criação de sub-nodos
        Quando digitar "Bíblia Sagrada"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Gênesis"
        E teclar "Ctrl + Enter"
        E teclar "Tab"
        E digitar "Capítulo: "
        E teclar "Tab"
        E digitar "1"
        Então conteúdo da página deve ser igual a
        """
        Bíblia Sagrada
        	Gênesis
        		Capítulo: 1
        """

    @arraste
    Cenário: Arraste de nodo
        Quando digitar "Bíblia Sagrada"
        E teclar "Enter"
        E teclar "Tab"
        E digitar "Livro:"
        E teclar "Tab"
        E digitar "Gênesis"
        E arrastar o segundo nodo sobre o primeiro
        Então conteúdo da página deve ser igual a
        """
        Bíblia Sagrada
        	Livro: Gênesis
        	Gênesis
        """

    Cenário: Movimentação para cima de arestas de adjacência
        Quando digitar "Bíblia Sagrada"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Gênesis"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Êxodo"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Levítico"
        E teclar "Alt" + "ArrowUp"
        Então conteúdo da página deve ser igual a
        """
        Bíblia Sagrada
        	Gênesis
        		Capítulo: 1
        """

    #Cenário: Edição nodo raíz
    #    Dado o texto "Nodo raíz"
    #    Quando abrir instancia 0 do GraphitApp
    #    E digitar texto
    #    E abrir instancia 1 do GraphitApp
    #    Então não deve existir aresta
    #    E conteúdo deve ser igual a
    #    """
    #        Nodo raíz
    #    """

    #Cenário: Inserção de aresta direta e indireta

    #Contexto: Acesso base de teste limpa
    #    Dado acessar página 'localhost:3000'
    #    E aguardar 1 segundo
    #    E a base "__graphit-test__" em teste
    #    #E aguardar 3 segundos
    #    #E fechar a página
    #    #Dado que não há informação gravada na base de dados
#
    #Cenário: Inclusão de título de livros em "Bíblia Sagrada"
    #    Dado as instruções
    #        | pré      | Texto                       | pós          |
    #        | digitar  | Bíblia Sagrada              | Enter        |
    #        | digitar  | Gênesis                     | Enter        |
    #        | digitar  | Evangelho de João           | Ctrl + Enter |
    #        | digitar  | No princípio era o Verbo... | Ctrl + Enter |
    #        | digitar  | Comentário                  |              |
    #        | arrastar | Comentário                  | Gênesis      |
    #        | digitar  | _Teste                       | Ctrl + Enter |
    #        | digitar  | Adendo                      |              |
    #    Quando acessar página 'localhost:3000'
    #    E aguardar 4 segundos
    #    E clicar sobre o primeiro campo
    #    E executar as instruções
    #    E aguardar 2 segundos
    #    E fechar a página
    #    E acessar página 'localhost:3000'
    #    E aguardar 4 segundos
    #    Então o conteúdo da página deve ser
    #        """
    #        Bíblia Sagrada
    #        	Gênesis
    #        		Comentário_Teste
    #        			Adendo
    #        	Evangelho de João
    #        		No princípio era o Verbo...
    #        			Comentário_Teste
    #        				Adendo
    #        """
    #        
    #Cenário: Inclusão de texto 'No princípio era o Verbo, o Verbo estava com Deus...' contido no 'Evangelho de João' e aresta para esse texto contendo etiqueta "Versículo 1"