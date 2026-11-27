# Gestor de Despesas

Aplicação de gestão de despesas com HTML, Tailwind CSS, JavaScript, PHP e MySQL.

## Instalação no XAMPP

1. Copia a pasta `gestor-despesas` para `C:\xampp\htdocs\`.
2. Abre o painel do XAMPP e liga o **Apache** e o **MySQL**.
3. Abre `http://localhost/phpmyadmin`.
4. Importa o ficheiro `sql/gestor_despesas.sql`.
5. Confirma as credenciais em `api/config.php`:
   - Host: `localhost`
   - Base de dados: `gestor_despesas`
   - Utilizador: `root`
   - Password: vazia (predefinição do XAMPP)
6. Abre `http://localhost/gestor-despesas/`.

## Funcionalidades

- Dashboard com entradas, saídas, saldo, média diária e desvio padrão.
- Filtro por mês e ano.
- Gráfico de gastos por categoria.
- Evolução mensal de entradas e saídas.
- CRUD de movimentos.
- CRUD de categorias.
- Categorias partilhadas entre entradas e saídas.
- Ao apagar uma categoria, os movimentos ficam sem categoria.

## Estrutura

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

## Notas

- O Tailwind e o Chart.js são carregados por CDN.
- O PHP usa PDO com prepared statements.
- Para publicar na internet, altera as credenciais e não uses o utilizador `root` sem password.
