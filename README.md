# Daily Diet API

API simples para cadastro de usuarios e refeicoes, com controle de sessao via
cookie.

## Tecnologias

- Node.js
- Fastify
- Knex
- SQLite
- Zod
- Vitest

## Requisitos

- Node.js 18+
- npm

## Como rodar

1) Instalar dependencias:

```
npm install
```

2) Rodar as migrations:

```
npm run knex -- migrate:latest
```

3) Iniciar o servidor:

```
npm run dev
```

Servidor em `http://localhost:3000`.

## Testes

```
npm run test
```

## Autenticacao

Ao criar um usuario, um cookie `sessionId` e definido e deve ser enviado nas
rotas de dieta.

## Endpoints

### Usuarios

**POST `/users`**

Cria um usuario e define o cookie `sessionId`.

Body:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

Resposta: `201`.

**GET `/users`**

Lista todos os usuarios.

Resposta: `200`.

**GET `/users/:id`**

Busca um usuario por id (UUID).

Resposta: `200` ou `404`.

### Dieta (requer `sessionId`)

**POST `/diet`**

Cria uma refeicao.

Body:

```json
{
  "nome": "Pizza",
  "descricao": "Pizza de calabresa",
  "data": "2026-02-01T12:00:00.000Z",
  "is_diet": true
}
```

Resposta: `201`.

**GET `/diet`**

Lista todas as refeicoes do usuario logado.

Resposta: `200`.

**PUT `/diet/:id`**

Atualiza uma refeicao por id.

Body:

```json
{
  "nome": "Arroz com feijao",
  "descricao": "Feijao fradinho com arroz",
  "data": "2026-02-01T12:00:00.000Z",
  "is_diet": false
}
```

Resposta: `204`.
