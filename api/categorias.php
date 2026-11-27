<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

require_method('GET', 'POST', 'PUT', 'DELETE');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = db()->query(
        'SELECT c.id, c.nome, c.cor, c.ativo, COUNT(m.id) AS total_movimentos
         FROM categorias c
         LEFT JOIN movimentos m ON m.categoria_id = c.id
         GROUP BY c.id, c.nome, c.cor, c.ativo
         ORDER BY c.nome'
    );
    json_out($stmt->fetchAll());
}

$input = json_input();

if ($method === 'POST' || $method === 'PUT') {
    $id = isset($input['id']) ? (int) $input['id'] : 0;
    $nome = trim((string) ($input['nome'] ?? ''));
    $cor = trim((string) ($input['cor'] ?? '#71717a'));
    $ativo = isset($input['ativo']) ? (int) (bool) $input['ativo'] : 1;

    if ($nome === '') {
        json_out(['erro' => 'O nome da categoria é obrigatório.'], 422);
    }

    if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $cor)) {
        json_out(['erro' => 'A cor deve estar no formato #RRGGBB.'], 422);
    }

    try {
        if ($method === 'POST') {
            $stmt = db()->prepare('INSERT INTO categorias (nome, cor, ativo) VALUES (:nome, :cor, :ativo)');
            $stmt->execute([':nome' => $nome, ':cor' => $cor, ':ativo' => $ativo]);
            $id = (int) db()->lastInsertId();
        } else {
            if ($id <= 0) {
                json_out(['erro' => 'ID inválido.'], 422);
            }
            $stmt = db()->prepare('UPDATE categorias SET nome = :nome, cor = :cor, ativo = :ativo WHERE id = :id');
            $stmt->execute([':nome' => $nome, ':cor' => $cor, ':ativo' => $ativo, ':id' => $id]);
        }
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            json_out(['erro' => 'Já existe uma categoria com esse nome.'], 409);
        }
        throw $e;
    }

    $stmt = db()->prepare('SELECT id, nome, cor, ativo FROM categorias WHERE id = :id');
    $stmt->execute([':id' => $id]);
    json_out($stmt->fetch(), $method === 'POST' ? 201 : 200);
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        json_out(['erro' => 'ID inválido.'], 422);
    }

    $stmt = db()->prepare('DELETE FROM categorias WHERE id = :id');
    $stmt->execute([':id' => $id]);
    json_out(['ok' => true]);
}
