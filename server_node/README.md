# API de tradução — Node.js

Servidor Express que recebe texto em inglês e retorna sua tradução para português. Traduz a descrição gerada pela [interface React](../image-to-text-app/README.md) antes da síntese de voz no [servidor Python](../server_python/README.md).

[Voltar à visão geral do projeto](../README.md).

## Implementação

A classe `Translator` cria uma pipeline `translation` do Transformers.js com `Xenova/nllb-200-distilled-600M` e `dtype: "q8"`. Os idiomas estão fixos em `eng_Latn` (origem) e `por_Latn` (destino).

O modelo é carregado sob demanda e a pipeline fica em uma propriedade estática para reutilização. A primeira requisição pode demorar devido ao download e à inicialização. A inferência ocorre no processo Node.js.

## Execução local

Requisitos: Node.js e npm compatíveis com as dependências, internet para o download inicial e recursos disponíveis para o modelo. O Dockerfile usa Node.js `24.20.0` como referência de ambiente.

A partir da raiz do repositório:

```bash
cd server_node
npm ci
node index.js
```

O servidor escuta em `http://localhost:3000`. A porta está definida em `index.js`; não existe script `npm start` nem leitura da variável `PORT` na implementação atual.

## API

### POST /translate

Envie `Content-Type: application/json` com o campo `text`:

```json
{"text": "A cat sitting on a sofa."}
```

A resposta é o array retornado pela pipeline. Exemplo ilustrativo, cujo texto pode variar:

```json
[{"translation_text": "Um gato sentado em um sofá."}]
```

Exemplo em PowerShell:

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/translate' -Method Post -ContentType 'application/json' -Body '{"text":"A cat sitting on a sofa."}'
```

Não há rota de interface ou verificação de saúde em `GET /`. Para testar o serviço, utilize `POST /translate`.

## Docker

Com Docker e Compose instalados, execute dentro de `server_node`:

```bash
docker compose up --build
```

O Compose publica a porta `3000`. O Dockerfile instala dependências com `npm ci --omit=dev` e inicia `node index.js`. O modelo é carregado na primeira tradução, não durante o build. Não há volume configurado para persistir seu cache entre recriações do contêiner.

## Organização

| Arquivo | Função |
| --- | --- |
| [index.js](index.js) | Express, JSON, CORS, porta e endpoint |
| [models/api.js](models/api.js) | Encaminhamento do texto para a classe de tradução |
| [models/Translator.js](models/Translator.js) | Carregamento e execução do modelo |
| [package.json](package.json) | Dependências e metadados do pacote CommonJS |
| [Dockerfile](Dockerfile) e [compose.yaml](compose.yaml) | Execução em contêiner |

## Integração e limitações

- O CORS permite apenas `http://localhost:5173`. Para outra origem, ajuste `index.js`.
- Não há validação do conteúdo de `text` nem formato próprio de resposta de erro.
- Os textos de entrada e saída são registrados no console.
- Os idiomas não podem ser escolhidos pela requisição.
- O servidor não chama o serviço de áudio: o frontend coordena esse fluxo.
- Não há testes implementados. `npm test` é um placeholder e termina com erro.
