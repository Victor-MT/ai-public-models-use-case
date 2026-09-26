# Caption Generator — explorando modelos públicos da Hugging Face

Uma aplicação simples que recebe a URL de uma imagem e gera uma descrição do seu conteúdo usando inteligência artificial. Construída com **React, Vite e Transformers.js**, ela executa o modelo diretamente no navegador.

O projeto foi desenvolvido como exercício de aprendizado: explorar a Hugging Face, entender como reutilizar modelos públicos e integrar uma tarefa de IA a uma interface web. A interface é pequena de propósito; o principal aprendizado está na escolha do modelo e no caminho entre uma imagem e o texto gerado.

## O que a aplicação faz

1. Recebe a URL de uma imagem.
2. Exibe a imagem na página.
3. Ao clicar em **Generate**, carrega o modelo e gera uma legenda descritiva.
4. Apresenta o texto abaixo da imagem.

Essa tarefa é chamada de **image captioning**: produzir uma descrição textual de uma imagem. O código usa a pipeline `image-to-text`, sem realizar treinamento ou ajuste do modelo.

## Conhecendo a Hugging Face

A Hugging Face reúne ferramentas e uma comunidade voltadas a machine learning. Seu **Hub** permite descobrir e compartilhar modelos, conjuntos de dados e demonstrações de aplicações, os **Spaces**. Essa estrutura facilita aprender com projetos da comunidade e experimentar modelos já disponíveis. Veja a [documentação do Hub](https://huggingface.co/docs/hub/index).

Neste projeto, o ponto central é reutilizar um **modelo pré-treinado**. Seus pesos são os parâmetros aprendidos durante o treinamento; a aplicação carrega esses arquivos para executar a tarefa em novas imagens. Essa execução é chamada de **inferência**.

Ao explorar um modelo, é importante ler sua **model card**, a documentação publicada na página do repositório. A tarefa atendida, os exemplos, as limitações, a licença e os formatos disponíveis ajudam a avaliar se ele serve para uma aplicação. Modelos públicos podem ter condições de uso e requisitos técnicos diferentes.

## O modelo utilizado e sua origem

A aplicação carrega **um modelo**, `Xenova/vit-gpt2-image-captioning`. Dois repositórios ajudam a entender sua origem:

| Repositório | Papel no projeto |
| --- | --- |
| [Xenova/vit-gpt2-image-captioning](https://huggingface.co/Xenova/vit-gpt2-image-captioning) | Versão carregada pelo código, com pesos ONNX compatíveis com Transformers.js. |
| [nlpconnect/vit-gpt2-image-captioning](https://huggingface.co/nlpconnect/vit-gpt2-image-captioning) | Modelo de origem da adaptação usada no navegador. |

A arquitetura combina **ViT (Vision Transformer)**, responsável por processar a imagem, e **GPT-2**, responsável por gerar a sequência de texto a partir da representação visual. A [página do modelo original](https://huggingface.co/nlpconnect/vit-gpt2-image-captioning) apresenta sua implementação e exemplos de descrições em inglês.

O **ONNX** é um formato de representação de modelos. A versão disponibilizada por Xenova contém os pesos nesse formato para compatibilidade com Transformers.js, conforme a [documentação do modelo utilizado](https://huggingface.co/Xenova/vit-gpt2-image-captioning). Isso mostra que escolher um modelo também envolve verificar o formato e o ambiente em que ele será executado.

## Transformers.js: da imagem ao texto no navegador

O [Transformers.js](https://huggingface.co/docs/transformers.js/index) permite executar modelos em JavaScript. Sua função `pipeline` reúne etapas como preparação da entrada, execução do modelo e processamento da saída.

O trecho abaixo resume a integração implementada em [ImageCaptioner.js](image-to-text-app/src/models/ImageCaptioner.js):

```js
import { pipeline } from "@huggingface/transformers";

const captioner = await pipeline(
  "image-to-text",
  "Xenova/vit-gpt2-image-captioning",
  { dtype: "q8" }
);

const result = await captioner(imgSrc, { do_sample: true });
const caption = result[0].generated_text;
```

- **`image-to-text`** define a tarefa.
- **O identificador do repositório** indica qual modelo carregar.
- **`dtype: "q8"`** seleciona pesos quantizados em 8 bits. A quantização reduz a precisão numérica para diminuir o tamanho dos pesos e o uso de memória, podendo afetar a qualidade. Essa opção é explicada na [documentação do Transformers.js](https://huggingface.co/docs/transformers.js/index).
- **`do_sample: true`** habilita amostragem na geração, permitindo variações entre descrições da mesma imagem.
- **`generated_text`** contém o texto exibido pela interface.

Depois de carregada, a pipeline fica guardada em uma propriedade estática da classe para reutilização nas próximas gerações. A primeira execução pode demorar mais porque precisa baixar os arquivos do modelo.

A implementação não exige token da Hugging Face e não usa um servidor próprio para gerar as legendas. A inferência acontece no navegador; a rede ainda é necessária para buscar os arquivos do modelo e a imagem informada.

## Aprendizados explorados

- **Reutilização de modelos:** adicionar uma capacidade de IA à aplicação a partir de pesos já treinados.
- **Treinamento e inferência:** compreender que o projeto executa um modelo existente sobre novas entradas.
- **Compatibilidade:** considerar tarefa, formato dos pesos e biblioteca ao escolher um modelo público.
- **Configuração da geração:** entender o papel da quantização e da amostragem.
- **Integração com React:** lidar com operações assíncronas, indicar que a legenda está sendo gerada e atualizar a interface com o resultado.

## Como executar

Tenha Node.js e npm instalados, em versões compatíveis com as dependências do projeto. A partir da raiz do repositório:

```bash
cd image-to-text-app
npm ci
npm run dev
```

Abra o endereço indicado pelo Vite, cole uma URL direta de imagem e clique em **Generate**. Aguarde o carregamento inicial do modelo.

Outros comandos disponíveis dentro de `image-to-text-app`:

| Comando | Função |
| --- | --- |
| `npm run build` | Gera a versão de produção. |
| `npm run preview` | Serve localmente o resultado do build. |
| `npm run lint` | Executa a análise estática com ESLint. |

## Organização do código

```text
image-to-text-app/
├── src/
│   ├── models/
│   │   ├── ImageCaptioner.js  # Carregamento e execução do modelo
│   │   └── api.js             # Função utilizada pela interface
│   ├── App.jsx                # URL, imagem e legenda
│   ├── App.css                # Estilos da aplicação
│   └── main.jsx               # Inicialização do React
└── package.json
```

Apesar do nome, `api.js` é uma função local que chama `ImageCaptioner`, sem representar uma API HTTP.

## Limitações e próximos passos

Este é um experimento de aprendizado. As descrições podem ser imprecisas e não há tradução das respostas para português. O desempenho depende da conexão durante o download e dos recursos do dispositivo durante a inferência.

A entrada aceita URLs, sem upload de arquivos. Restrições de **CORS** no servidor da imagem podem impedir seu processamento, mesmo quando ela aparece na página. A interface ainda não trata URLs inválidas, falhas de download ou cliques simultâneos durante a geração.

Possíveis próximos passos incluem progresso de download, tratamento de erros, upload local e comparação com outros modelos compatíveis com a tarefa e com Transformers.js.
