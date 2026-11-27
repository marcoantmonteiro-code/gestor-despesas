# 💰 Gestor de Despesas

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

Aplicação web para gerir despesas pessoais, com dashboard mensal, gráficos, categorias e histórico de movimentos.

O projeto foi desenvolvido para praticar desenvolvimento web full stack com **HTML, Tailwind CSS, JavaScript, PHP e MySQL**, sem frameworks de frontend.

---

## 📌 Sobre o projeto

O **Gestor de Despesas** permite registar entradas e saídas, organizar os gastos por categoria e acompanhar a evolução financeira ao longo do ano.

A dashboard mostra os valores do mês selecionado e permite navegar por meses e anos anteriores. Todos os dados ficam guardados numa base de dados MySQL, através de uma API em PHP.

### O que podes fazer

- Registar entradas e saídas.
- Editar e apagar movimentos de meses anteriores.
- Criar, editar e apagar categorias.
- Consultar o total de entradas, saídas e saldo.
- Ver a média diária e o desvio padrão dos gastos.
- Analisar os gastos por categoria.
- Comparar a evolução mensal de entradas e saídas.
- Filtrar movimentos por descrição e tipo.

---

## 🖥️ Dashboard

A interface foi construída com uma base de cinzas e cores com significado:

- **Verde** para entradas.
- **Vermelho** para saídas.
- **Índigo** para ações principais.
- **Âmbar** para categorias e avisos.

> Adiciona aqui um screenshot da dashboard para o README ficar mais completo.

---

## 🚀 Tecnologias

| Tecnologia | Utilização |
|---|---|
| HTML5 | Estrutura da aplicação |
| Tailwind CSS | Estilo e layout responsivo |
| JavaScript | Lógica do frontend, filtros e gráficos |
| Chart.js | Gráficos de categorias e evolução mensal |
| PHP | API e ligação à base de dados |
| MySQL / MariaDB | Armazenamento dos dados |
| XAMPP | Ambiente local com Apache, PHP e MySQL |

---

## ⚙️ Funcionalidades

### Dashboard

- Seleção de mês e ano.
- Cartões com entradas, saídas, saldo, média diária e desvio padrão.
- Gráfico circular com os gastos por categoria.
- Gráfico de barras com a evolução mensal.
- Tabela de movimentos recentes.

### Movimentos

- Criar movimento com descrição, valor, data, tipo e categoria.
- Editar movimentos existentes.
- Apagar movimentos.
- Pesquisar por descrição.
- Filtrar por entrada ou saída.

### Categorias

- Criar categorias com nome e cor.
- Editar nome e cor.
- Apagar categorias.
- Categorias partilhadas entre entradas e saídas.
- Ao apagar uma categoria, os movimentos ficam sem categoria, preservando o histórico.

---

## 🗄️ Base de dados

O projeto usa duas tabelas principais:

### `categorias`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | INT UNSIGNED | Chave primária |
| `nome` | VARCHAR(50) | Nome único da categoria |
| `cor` | CHAR(7) | Cor em hexadecimal |
| `ativo` | TINYINT(1) | Estado da categoria |
| `criado_em` | TIMESTAMP | Data de criação |
| `atualizado_em` | TIMESTAMP | Última atualização |

### `movimentos`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | INT UNSIGNED | Chave primária |
| `descricao` | VARCHAR(255) | Descrição do movimento |
| `valor` | DECIMAL(10,2) | Valor em euros |
| `data` | DATE | Data do movimento |
| `tipo` | ENUM | `entrada` ou `saida` |
| `categoria_id` | INT UNSIGNED | Chave estrangeira para categorias |
| `criado_em` | TIMESTAMP | Data de criação |
| `atualizado_em` | TIMESTAMP | Última atualização |

A chave estrangeira usa `ON DELETE SET NULL`, para que apagar uma categoria não apague os movimentos associados.

---

## 📂 Estrutura do projeto

```text
gestor-despesas/
├── index.html
├── assets/
│   ├── app.js
│   └── style.css
├── api/
│   ├── config.php
│   ├── categorias.php
│   ├── movimentos.php
│   └── resumo.php
├── sql/
│   └── gestor_despesas.sql
└── README.md
```

---

## 🛠️ Instalação local

### 1. Clonar o repositório

```bash
git clone https://github.com/marcoantmonteiro-code/gestor-despesas.git
```

### 2. Copiar para o XAMPP

Coloca a pasta do projeto dentro de:

```text
C:\xampp\htdocs\gestor-despesas
```

### 3. Ligar o Apache e o MySQL

Abre o painel do XAMPP e inicia os serviços **Apache** e **MySQL**.

### 4. Criar a base de dados

Abre o phpMyAdmin:

```text
http://localhost/phpmyadmin
```

Importa o ficheiro:

```text
sql/gestor_despesas.sql
```

### 5. Configurar a ligação

Edita `api/config.php`:

```php
const DB_HOST = 'localhost';
const DB_NAME = 'gestor_despesas';
const DB_USER = 'root';
const DB_PASS = '';
```

Estes são os valores predefinidos do XAMPP. Se tiveres password no MySQL, altera `DB_PASS`.

### 6. Abrir o site

```text
http://localhost/gestor-despesas/
```



### Categorias

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/categorias.php` | Lista categorias |
| POST | `/api/categorias.php` | Cria uma categoria |
| PUT | `/api/categorias.php` | Atualiza uma categoria |
| DELETE | `/api/categorias.php?id=1` | Apaga uma categoria |

### Resumo

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/resumo.php?ano=2026&mes=11` | Totais, média, desvio padrão e gráficos |

---

## 🔒 Segurança

- Ligação à base de dados com **PDO**.
- **Prepared statements** em todas as consultas.
- Validação dos dados no backend.
- `htmlspecialchars` no frontend através de função de escape.
- `ON DELETE SET NULL` para preservar o histórico.
- Credenciais de exemplo para ambiente local.

Para publicar online, não uses o utilizador `root` sem password. Cria um utilizador próprio com permissões limitadas.

---



## 👤 Autor

**Marco Monteiro**

- GitHub: [@marcoantmonteiro-code](https://github.com/marcoantmonteiro-code)


---

## 📄 Licença

Este projeto está disponível para fins educativos. Podes usar, estudar e adaptar o código.

---

<p align="center">
  Feito com HTML, Tailwind CSS, JavaScript, PHP e MySQL.
</p>
