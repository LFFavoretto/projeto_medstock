-- Criação de tabelas
CREATE TABLE unidade_saude (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(150) NOT NULL,
logradouro VARCHAR(100) NOT NULL,
bairro VARCHAR(80) NOT NULL,
numero INT NOT NULL);

CREATE TABLE insumos (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
marca VARCHAR(80) NOT NULL
);

CREATE TABLE usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
id_unidade_saude INT NOT NULL,
nome VARCHAR(100) NOT NULL,
email VARCHAR(150) NOT NULL UNIQUE,
senha_hash VARCHAR(255) NOT NULL,
tipo_usuario ENUM('administrador', 'operador') NOT NULL,
FOREIGN KEY(id_unidade_saude) REFERENCES unidade_saude(id)
);

CREATE TABLE estoque (
id INT AUTO_INCREMENT PRIMARY KEY,
id_unidade_saude INT NOT NULL,
id_insumos INT NOT NULL,
id_usuarios INT NOT NULL,
tipo_movimentacao ENUM('entrada', 'saida') NOT NULL,
data_movimentacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
quantidade INT NOT NULL,
lote VARCHAR(20) NOT NULL,
data_validade DATE NOT NULL,
observacoes TEXT,
FOREIGN KEY(id_unidade_saude) REFERENCES unidade_saude(id),
FOREIGN KEY(id_insumos) REFERENCES insumos(id),
FOREIGN KEY(id_usuarios) REFERENCES usuarios(id)
);

-- Atualização da tabela usuarios
ALTER TABLE usuarios ADD ativo BOOLEAN DEFAULT TRUE;

-- Renomeando a tabela insumos para produtos
RENAME TABLE insumos TO produtos;

-- Atualização da chave estrangeira na tabela estoque
ALTER TABLE estoque
CHANGE id_insumos id_produtos INT NOT NULL;

-- Atualição das informações na tabela produtos
ALTER TABLE produtos
ADD tipo ENUM('insumo', 'medicamento') NOT NULL,
ADD fornecedor VARCHAR(100),
ADD dosagem VARCHAR(50),
ADD controlado BOOLEAN DEFAULT FALSE,
ADD setor VARCHAR(100),
ADD ativo BOOLEAN DEFAULT TRUE;

ALTER TABLE produtos
ADD categoria_insumo VARCHAR(100);