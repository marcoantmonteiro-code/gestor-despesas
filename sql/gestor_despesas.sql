CREATE DATABASE IF NOT EXISTS gestor_despesas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestor_despesas;

CREATE TABLE IF NOT EXISTS categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  cor CHAR(7) NOT NULL DEFAULT '#71717a',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_categorias_nome UNIQUE (nome),
  CONSTRAINT chk_categorias_cor CHECK (cor REGEXP '^#[0-9A-Fa-f]{6}$')
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movimentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  tipo ENUM('entrada', 'saida') NOT NULL,
  categoria_id INT UNSIGNED NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_movimentos_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT chk_movimentos_valor CHECK (valor > 0),
  INDEX idx_movimentos_data (data),
  INDEX idx_movimentos_tipo (tipo),
  INDEX idx_movimentos_categoria (categoria_id),
  INDEX idx_movimentos_data_tipo (data, tipo)
) ENGINE=InnoDB;

INSERT INTO categorias (nome, cor) VALUES
  ('Alimentação', '#f59e0b'),
  ('Transporte', '#3b82f6'),
  ('Casa', '#8b5cf6'),
  ('Saúde', '#ef4444'),
  ('Lazer', '#ec4899'),
  ('Educação', '#14b8a6'),
  ('Salário', '#10b981'),
  ('Outros', '#71717a')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
