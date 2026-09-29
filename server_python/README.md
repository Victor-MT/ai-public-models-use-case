# API de síntese de voz — Python

Servidor Flask que converte texto em áudio com `suno/bark-small`, salva o resultado em WAV e disponibiliza uma URL para reprodução. No projeto completo, recebe a descrição traduzida pela [API Node.js](../server_node/README.md), encaminhada pela [interface React](../image-to-text-app/README.md).

[Voltar à visão geral do projeto](../README.md).

## Implementação

O serviço carrega `AutoProcessor` e `BarkModel` por meio de Transformers. O processamento usa a voz `v2/pt_speaker_8`; a taxa de amostragem vem de `model.generation_config.sample_rate`.

O áudio é convertido em um array NumPy e salvo com `scipy.io.wavfile.write`. Cada arquivo recebe um UUID no nome: `audio/<uuid>.wav`.

A implementação cria uma instância de `TextToAudio` por requisição e carrega novamente o processador e o modelo. O cache de download pode reutilizar arquivos, mas o código não mantém uma instância do modelo em memória entre requisições. Não há seleção explícita de GPU.

## Execução local

Requisitos: Python **3.14 ou superior**, conforme `pyproject.toml`, e **uv**. A versão indicada em `.python-version` é `3.14`. O ambiente precisa de internet para o download inicial e recursos disponíveis para executar o modelo. O `uv.lock` inclui PyTorch como dependência transitiva.

A partir da raiz do repositório:

```bash
cd server_python
uv sync --locked
uv run python -c "from pathlib import Path; Path('audio').mkdir(exist_ok=True)"
uv run server-python --host=0.0.0.0 --port=5000
```

A criação de `audio/` é necessária porque a função de gravação não cria o diretório. Execute dentro de `server_python`: a entrada usa `main.py`, e a gravação usa um caminho relativo ao diretório de trabalho.

O comando `server-python` está definido em `pyproject.toml` e chama a CLI do Flask. Uma alternativa equivalente é:

```bash
uv run flask --app main.py run --host=0.0.0.0 --port=5000
```

O serviço estará disponível em `http://localhost:5000`. A execução usa o servidor de desenvolvimento do Flask.

## API

### GET /

Retorna o texto `Hello`. Confirma que o servidor está acessível, mas não testa o carregamento do modelo.

### POST /text_to_audio

Envie `Content-Type: application/json` com o campo `text`:

```json
{"text": "Um gato sentado em um sofá."}
```

A resposta contém uma URL relativa para o arquivo gerado:

```json
[{"url": "/audio/123e4567-e89b-12d3-a456-426614174000.wav"}]
```

O UUID acima é ilustrativo. O endpoint retorna o endereço do áudio, não os bytes do arquivo.

Exemplo em PowerShell, gerando e baixando um WAV para o diretório atual:

```powershell
$payload = @{ text = 'Uma imagem de um gato.' } | ConvertTo-Json
$result = Invoke-RestMethod -Uri 'http://localhost:5000/text_to_audio' -Method Post -ContentType 'application/json' -Body $payload
Invoke-WebRequest -Uri ('http://localhost:5000' + $result[0].url) -OutFile 'exemplo.wav'
```

### GET /audio/<nome-do-arquivo>

Entrega um arquivo da pasta `audio/` usando `send_from_directory`. Para reprodução, concatene `http://localhost:5000` com a URL recebida no POST.

## Docker

Dentro de `server_python`, crie a pasta de saída antes de construir a imagem e inicie o Compose:

```bash
python -c "from pathlib import Path; Path('audio').mkdir(exist_ok=True)"
docker compose up --build
```

O Dockerfile usa Python `3.14.3`, copia o uv e inicia `uv run server-python --host=0.0.0.0`. O Compose publica a porta `5000`. O uv prepara as dependências na inicialização; o modelo é carregado ao receber uma solicitação de áudio.

O Compose não define volumes para `audio/` ou para o cache do modelo. Os arquivos gerados dentro do contêiner não são sincronizados com a pasta local e podem ser perdidos quando ele for removido. A pasta local criada antes do build é incluída pelo `COPY . .`.

## Organização

| Arquivo | Função |
| --- | --- |
| [main.py](main.py) | Rotas Flask |
| [models/api.py](models/api.py) | Instancia o conversor e solicita a geração |
| [models/text_to_audio.py](models/text_to_audio.py) | Carrega Bark, configura a voz e executa a síntese |
| [utils/__init__.py](utils/__init__.py) | Converte e grava o WAV |
| [src/server_python/__init__.py](src/server_python/__init__.py) | Implementa o comando `server-python` |
| [pyproject.toml](pyproject.toml) e [uv.lock](uv.lock) | Configuração do pacote e dependências |
| [Dockerfile](Dockerfile) e [compose.yaml](compose.yaml) | Execução em contêiner |

## Limitações atuais

- O endpoint acessa `request.json['text']` diretamente, sem validação ou tratamento próprio de falhas de geração.
- O CORS está habilitado no endpoint de geração com `@cross_origin()`.
- O carregamento do modelo a cada requisição aumenta o custo e a latência.
- A voz está fixa no código e não pode ser escolhida pela API.
- Não há limpeza automática dos arquivos ou volume persistente no Compose.
- Não há testes automatizados configurados para este componente.
