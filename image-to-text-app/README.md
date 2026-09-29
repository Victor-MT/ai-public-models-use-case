# Caption Generator — interface web

Aplicação React que recebe a URL de uma imagem, gera uma descrição em inglês no navegador, solicita sua tradução para português e reproduz a narração gerada pelo backend Python.

[Voltar à visão geral do projeto](../README.md).

## Fluxo da interface

Ao clicar em **Generate**, a aplicação limpa o resultado anterior e executa as etapas em sequência:

1. `generateCaption` executa `Xenova/vit-gpt2-image-captioning` no navegador e lê `generated_text`.
2. `translateCaption` envia esse texto ao [servidor Node.js](../server_node/README.md) e lê `translation_text`.
3. `convertToAudio` envia a tradução ao [servidor Python](../server_python/README.md) e recebe a URL relativa do WAV.
4. A interface monta a URL completa do áudio e tenta reproduzi-lo. O player também oferece controles manuais.

A descrição usa a pipeline `image-to-text` do Transformers.js, com `dtype: "q8"` e `do_sample: true`. A pipeline fica armazenada na classe `ImageCaptioner` após o carregamento. A amostragem permite que a descrição varie entre execuções.

## Execução local

Requisitos: Node.js e npm compatíveis com as dependências. O Vite instalado declara suporte a Node.js `^20.19.0 || >=22.12.0`; considere também os requisitos das demais dependências. Para o fluxo completo, inicie os dois servidores conforme seus READMEs.

A partir da raiz do repositório:

```bash
cd image-to-text-app
npm ci
npm run dev -- --port 5173 --strictPort
```

Abra `http://localhost:5173`, cole uma URL direta de imagem e clique em **Generate**. A porta fixa evita que o Vite escolha outra origem, incompatível com o CORS atual do Node.js.

A primeira geração pode demorar porque o navegador precisa baixar o modelo. A descrição é executada localmente, mas o botão sempre tenta continuar para tradução e áudio, e falhas nessas etapas não são tratadas na interface.

## Comandos disponíveis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite |
| `npm run build` | Gera a aplicação em `dist/` |
| `npm run preview` | Serve o build localmente para inspeção |
| `npm run lint` | Executa ESLint |

Para inspecionar o build mantendo a origem aceita pelo backend, pare o servidor de desenvolvimento e execute:

```bash
npm run build
npm run preview -- --port 5173 --strictPort
```

## Integração com as APIs

| Operação | Requisição | Campo utilizado na resposta |
| --- | --- | --- |
| Traduzir | `POST http://localhost:3000/translate` com `{"text":"descrição em inglês"}` | `[0].translation_text` |
| Gerar áudio | `POST http://localhost:5000/text_to_audio` com `{"text":"descrição em português"}` | `[0].url` |
| Reproduzir áudio | `GET http://localhost:5000/audio/<uuid>.wav` | Arquivo WAV |

As duas chamadas POST enviam JSON. Os endpoints estão fixos em [src/models/api.js](src/models/api.js), e a base da URL de áudio está fixa em [src/App.jsx](src/App.jsx). Para mudar host ou porta, ajuste esses arquivos e a origem permitida no Node.js. Não há configuração por variáveis de ambiente implementada.

## Organização

| Arquivo ou pasta | Função |
| --- | --- |
| [src/App.jsx](src/App.jsx) | Campo de URL, estados, chamadas e player de áudio |
| [src/models/ImageCaptioner.js](src/models/ImageCaptioner.js) | Carregamento e execução do modelo de imagem para texto |
| [src/models/api.js](src/models/api.js) | Função local de descrição e chamadas HTTP |
| [src/main.jsx](src/main.jsx) | Inicialização do React |
| [src/App.css](src/App.css) e [src/index.css](src/index.css) | Estilos |
| [docs/](docs/) | Imagens de documentação e experimentação |
| [vite.config.js](vite.config.js) | Vite com o plugin React |

## Limitações atuais

- A entrada aceita URL, sem upload de arquivos locais.
- Restrições de CORS podem impedir o processamento de uma imagem, mesmo quando ela aparece na página.
- Não há validação de URL, tratamento de erro das chamadas ou bloqueio do botão durante a geração.
- Há mensagens de status para descrição e tradução, mas não uma barra de progresso de download ou status específico de síntese de voz.
- A reprodução automática pode ser bloqueada pelo navegador; nesse caso, use os controles do player.
- A qualidade e o tempo de geração dependem do modelo, da imagem e dos recursos do dispositivo.
- Não há script de testes automatizados no pacote.
