<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

require_method('GET');

$ano = isset($_GET['ano']) ? (int) $_GET['ano'] : (int) date('Y');
$mes = isset($_GET['mes']) ? (int) $_GET['mes'] : (int) date('n');

if ($mes < 1 || $mes > 12 || $ano < 1900 || $ano > 2200) {
    json_out(['erro' => 'Ano ou mês inválido.'], 422);
}

$diasNoMes = (int) date('t', strtotime(sprintf('%04d-%02d-01', $ano, $mes)));

$stmt = db()->prepare(
    "SELECT
        COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS entradas,
        COALESCE(SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END), 0) AS saidas
     FROM movimentos
     WHERE YEAR(data) = :ano AND MONTH(data) = :mes"
);
$stmt->execute([':ano' => $ano, ':mes' => $mes]);
$totais = $stmt->fetch();

$stmt = db()->prepare(
    "SELECT DAY(data) AS dia, SUM(valor) AS total
     FROM movimentos
     WHERE tipo = 'saida' AND YEAR(data) = :ano AND MONTH(data) = :mes
     GROUP BY DAY(data)"
);
$stmt->execute([':ano' => $ano, ':mes' => $mes]);

$porDia = array_fill(1, $diasNoMes, 0.0);
foreach ($stmt->fetchAll() as $linha) {
    $porDia[(int) $linha['dia']] = (float) $linha['total'];
}

$soma = array_sum($porDia);
$media = $diasNoMes > 0 ? $soma / $diasNoMes : 0.0;
$variancia = 0.0;
foreach ($porDia as $valor) {
    $variancia += ($valor - $media) ** 2;
}
$desvio = $diasNoMes > 0 ? sqrt($variancia / $diasNoMes) : 0.0;

$stmt = db()->prepare(
    "SELECT c.id, COALESCE(c.nome, 'Sem categoria') AS nome,
            COALESCE(c.cor, '#71717a') AS cor,
            SUM(m.valor) AS total
     FROM movimentos m
     LEFT JOIN categorias c ON c.id = m.categoria_id
     WHERE m.tipo = 'saida' AND YEAR(m.data) = :ano AND MONTH(m.data) = :mes
     GROUP BY c.id, c.nome, c.cor
     ORDER BY total DESC"
);
$stmt->execute([':ano' => $ano, ':mes' => $mes]);
$porCategoria = $stmt->fetchAll();

$stmt = db()->prepare(
    "SELECT MONTH(data) AS mes,
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) AS entradas,
            SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) AS saidas
     FROM movimentos
     WHERE YEAR(data) = :ano
     GROUP BY MONTH(data)
     ORDER BY MONTH(data)"
);
$stmt->execute([':ano' => $ano]);

$evolucao = [];
for ($m = 1; $m <= 12; $m++) {
    $evolucao[$m] = ['mes' => $m, 'entradas' => 0.0, 'saidas' => 0.0];
}
foreach ($stmt->fetchAll() as $linha) {
    $evolucao[(int) $linha['mes']] = [
        'mes' => (int) $linha['mes'],
        'entradas' => (float) $linha['entradas'],
        'saidas' => (float) $linha['saidas'],
    ];
}

json_out([
    'ano' => $ano,
    'mes' => $mes,
    'dias_no_mes' => $diasNoMes,
    'entradas' => (float) $totais['entradas'],
    'saidas' => (float) $totais['saidas'],
    'saldo' => (float) $totais['entradas'] - (float) $totais['saidas'],
    'media_diaria' => round($media, 2),
    'desvio_padrao' => round($desvio, 2),
    'por_categoria' => $porCategoria,
    'evolucao' => array_values($evolucao),
]);
