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
        E digitar "Livro: "
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
        E digitar "Êxodo"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Levítico"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Gênesis"
        E teclar "Alt" + "ArrowUp"
        E teclar "Alt" + "ArrowUp"
        Então conteúdo da página deve ser igual a
        """
        Bíblia Sagrada
        	Gênesis
        	Êxodo
        	Levítico
        """

    Cenário: Movimentação para baixo de arestas de adjacência
        Quando digitar "Bíblia Sagrada"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Levítico"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Gênesis"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Êxodo"
        E teclar "Shift" + "Tab"
        E teclar "Shift" + "Tab"
        E teclar "Shift" + "Tab"
        E teclar "Shift" + "Tab"
        E teclar "Alt" + "ArrowDown"
        E teclar "Alt" + "ArrowDown"
        Então conteúdo da página deve ser igual a
        """
        Bíblia Sagrada
        	Gênesis
        	Êxodo
        	Levítico
        """
    
    Cenário: Exclusão de aresta de adjacência
        Quando digitar "Bíblia Sagrada"
        E teclar "Enter"
        E teclar "Tab"
        E teclar "Tab"
        E digitar "Gênesis"
        E teclar "Alt" + "Delete"
        Então conteúdo da página deve ser igual a
        """
        Bíblia Sagrada
        """