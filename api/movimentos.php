<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

require_method('GET', 'POST', 'PUT', 'DELETE');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $where = [];
    $params = [];

    if (!empty($_GET['ano'])) {
        $where[] = 'YEAR(m.data) = :ano';
        $params[':ano'] = (int) $_GET['ano'];
    }
    if (!empty($_GET['mes'])) {
        $where[] = 'MONTH(m.data) = :mes';
        $params[':mes'] = (int) $_GET['mes'];
    }
    if (!empty($_GET['tipo']) && in_array($_GET['tipo'], ['entrada', 'saida'], true)) {
        $where[] = 'm.tipo = :tipo';
        $params[':tipo'] = $_GET['tipo'];
    }
    if (!empty($_GET['categoria_id'])) {
        $where[] = 'm.categoria_id = :categoria_id';
        $params[':categoria_id'] = (int) $_GET['categoria_id'];
    }
    if (!empty($_GET['q'])) {
        $where[] = 'm.descricao LIKE :q';
        $params[':q'] = '%' . trim((string) $_GET['q']) . '%';
    }

    $sql = 'SELECT m.id, m.descricao, m.valor, m.data, m.tipo, m.categoria_id,
                   c.nome AS categoria_nome, c.cor AS categoria_cor
            FROM movimentos m
            LEFT JOIN categorias c ON c.id = m.categoria_id';

    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }

    $sql .= ' ORDER BY m.data DESC, m.id DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    json_out($stmt->fetchAll());
}

$input = json_input();

if ($method === 'POST' || $method === 'PUT') {
    $id = isset($input['id']) ? (int) $input['id'] : 0;
    $descricao = trim((string) ($input['descricao'] ?? ''));
    $valor = (float) ($input['valor'] ?? 0);
    $data = trim((string) ($input['data'] ?? ''));
    $tipo = (string) ($input['tipo'] ?? '');
    $categoriaId = !empty($input['categoria_id']) ? (int) $input['categoria_id'] : null;

    if ($descricao === '') {
        json_out(['erro' => 'A descrição é obrigatória.'], 422);
    }
    if ($valor <= 0) {
        json_out(['erro' => 'O valor deve ser maior do que zero.'], 422);
    }
    if (!in_array($tipo, ['entrada', 'saida'], true)) {
        json_out(['erro' => 'O tipo deve ser entrada ou saída.'], 422);
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
        json_out(['erro' => 'A data deve estar no formato AAAA-MM-DD.'], 422);
    }

    $params = [
        ':descricao' => $descricao,
        ':valor' => $valor,
        ':data' => $data,
        ':tipo' => $tipo,
        ':categoria_id' => $categoriaId,
    ];

    if ($method === 'POST') {
        $stmt = db()->prepare(
            'INSERT INTO movimentos (descricao, valor, data, tipo, categoria_id)
             VALUES (:descricao, :valor, :data, :tipo, :categoria_id)'
        );
        $stmt->execute($params);
        $id = (int) db()->lastInsertId();
    } else {
        if ($id <= 0) {
            json_out(['erro' => 'ID inválido.'], 422);
        }
        $params[':id'] = $id;
        $stmt = db()->prepare(
            'UPDATE movimentos
             SET descricao = :descricao, valor = :valor, data = :data,
                 tipo = :tipo, categoria_id = :categoria_id
             WHERE id = :id'
        );
        $stmt->execute($params);
    }

    $stmt = db()->prepare(
        'SELECT m.*, c.nome AS categoria_nome, c.cor AS categoria_cor
         FROM movimentos m
         LEFT JOIN categorias c ON c.id = m.categoria_id
         WHERE m.id = :id'
    );
    $stmt->execute([':id' => $id]);
    json_out($stmt->fetch(), $method === 'POST' ? 201 : 200);
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        json_out(['erro' => 'ID inválido.'], 422);
    }

    $stmt = db()->prepare('DELETE FROM movimentos WHERE id = :id');
    $stmt->execute([':id' => $id]);
    json_out(['ok' => true]);
}
