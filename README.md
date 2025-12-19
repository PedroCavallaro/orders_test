
# 📘 Outbox + Processamento Idempotente
Pra simplificar deixei tudo em um unico projeto, mas minha idéia é que consumer, worker e api seriam serviços diferentes
tanto que o consumer e o worker não seguem a estrutura do nest, apenas a api que segue

Stack:
* Nest na api
* Typescript puro no worker/consumer (re-utilizei apenas o logger do nest, pra não precisar recriar)
* Kysely como query builder
* Queue in-memory como broker

## 🚀 Como Rodar o Projeto

### Passos para execução

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd <nome-do-projeto>

# Subir os serviços
docker compose up -d
```

Se preferir rodar a aplicação fora do docker pra validar os testes ou só testar, é só comentar o serviço app no docker compose e rodar:

```
cp .env.example  .env

# Subir os serviços
docker compose up -d

# Rodar os testes
npm run test:int ou npm run test:e2e

# Rodar o projeto
npm run start:dev
```
---

## 🗄️ Modelagem de Dados

Toda a modelagem de dados está dentro do arquivo init.sql

---

## 🧠 Respostas Técnicas

1. **Atomicidade:** Onde no código está garantida a atomicidade entre atualizar `orders` e inserir o evento na outbox?
   * A atomicidade está garantida dentro da transaction que atualiza a order a cria o outbox_event, isso está no arquivo 

2. **Publicação duplicada:** Como seu worker evita publicar o mesmo evento duas vezes? (Ou: se publicar 2x, por que isso não quebra o sistema?)
  * Eventos duplicados não qebram o sistema, pois o consumer é idempotente e tem tratativas para eventos duplicados
  * Ele evita publicação concorrente atráves do `FOR UPDATE SKIP LOCKED`, mas o evento pode ser publicado novamente caso o `published` não seja alterado

3. **Idempotência:** Como você implementou a idempotência no consumer? Qual é a chave idempotente usada?
  * Salvo a chave do evento em processed_event como PK, dessa forma eu garanto que o evento vai ser processado apenas uma vez
  * A chave consiste em `${orderId}-${eventType}`, como o orderId não muda e a ordem só pode ser paga uma vez optei por essa chave

4. **Ordem de operações:** Em que ordem você marca o evento como "publicado" e envia ao broker? Por que escolheu essa ordem?
  * Primeiro publico e depois atualizo no banco
  * Escolhi essa ordem pois eu quero garantir que as mensagens vão chegar pelo menos uma vez no broker, e se atualizasse o banco antes de pulicar eu perderia essa mensagem

5. **Cenários de falha:** Qual o comportamento do sistema quando:

   - DB confirma a transação, mas o broker falha
      * Os eventos vão continuar na tabela `outbox_events` até o broker voltar

   - Broker publica, mas o worker cai antes de marcar como publicado
      * A mensagem volta pro broker, assim outro worker pode pegar e marcar como publicado

   - Consumer processa, mas cai antes de confirmar
      * A mensagem continua no broker, e o consumer possui uma tratativa para lidar com eventos duplicados
      * o ack só ocorre depois de todas as operações serem concluídas 

6. **Trade-offs:** Que simplificações você fez por ser um teste com um prazo reduzido? O que faria diferente em produção?
    * Testes: Os testes foram bem simplificados, criei testes e2e pra api e integração para os commands, em produção gostaria de adicionar mais desses testes, e adcionar testes unitários
    * Cenários de falha: Adicionar DQLs para as mensagens que falharam, crie uma implementação simples, mas em produção implementaria algo mais interessante
    * Abordar mais casos de incosistência: A api ficou bem simples e não lida com muitos casos, apenas checar se a order existe e se ela já foi paga, mais em um ambiente real imagino que teriamos mais validações
    * Arquitetura do projeto: Como a simplicidade foi requisitada, optei por uma solução simples mas que funciona. em produção optaria por uma solução onde as regras de negócio e as camadas da aplicação ficassem bem escritas
    * Forma que buscamos os eventos: Atualmente é while true que checa por eventos, isso não é ideal pois gera consultas desnecessárias, acho que seria interessante utilizar algum tipo de CDC
    * Retry: O retry ficou bem simples, apenas tenta executar o fluxo de publicação/atualização, mas isso pode gerar eventos duplicados, em produção eu buscaria deixar essa solução mais completa e com menos duplicações
---

## 🔨 Como testar e quebrar

### Passos para teste
Além do endpoint requisitado, adicionei um endpoint de seed e um para ver as orders

POST pay
```bash
curl --request POST \
  --url http://localhost:3000/orders/:id/pay \
  --header 'User-Agent: insomnia/11.0.0'
```

POST seed
```bash
curl --request POST \
  --url http://localhost:3000/orders/seed \
  --header 'User-Agent: insomnia/11.0.0'
```
GET orders
```
curl --request GET \
  --url http://localhost:3000/orders \
  --header 'User-Agent: insomnia/11.0.0'
```
### Passos para simular falhas no projeto

Dixei um endpoint `POST` que recebe configurações e simula falhas, só enviar o payload:

```bash 
{
  "successOnAttempt": 3,
  "breakBroker": true,
  "breakWorker": true,
  "breakConsumer": true,
  "duplicateEvents": true
}
```
Curl de exemplo
```
curl --request POST \
  --url http://localhost:3000/ \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/11.0.0' \
  --data '{
  "successOnAttempt": 3,
  "breakBroker": true,
  "breakWorker": true,
  "breakConsumer": true,
  "duplicateEvents": true
}
'
```
Pra voltar ao normal é só mandar um obejeto vazio.

---

## 📂 Estrutura de Pastas

```text

consumer/
├── commands/ <-- commands que vão processar e lidar com regras do outbox_event 
common/ <-- recursos compartilhados
├── db/ <--configuração de banco
├── queue/ <-- broker
worker/
├── commands/ <-- commands que vão lidar com a publicação e falha na publicação
src/ <-- api
├── entities/ <-- entitdades da aplicação e enums que vão ser utilizados por toda a aplicação
├── modules/ <-- modulos da api
└── main.ts <-- entrypoint do projeto
```
---


