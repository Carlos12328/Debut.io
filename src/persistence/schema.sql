CREATE TABLE usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE,
    senha TEXT,
    perfil TEXT CHECK
(perfil IN
('familiar','cerimonialista'))
);

CREATE TABLE evento (
    id_evento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER,
    nome TEXT,
    data_evento DATE,
    orcamento REAL,
    status TEXT CHECK
(status IN
('ativo','encerrado')),
    FOREIGN KEY
(id_usuario) REFERENCES usuario
(id_usuario)
);

CREATE TABLE fornecedor (
    id_fornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
    id_evento INTEGER,
    nome TEXT,
    tipo_servico TEXT,
    valor REAL,
    FOREIGN KEY
(id_evento) REFERENCES evento
(id_evento)
);

CREATE TABLE pagamento (
    id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_fornecedor INTEGER,
    valor REAL,
    vencimento DATE,
    status TEXT CHECK
(status IN
('pendente','pago')),
    FOREIGN KEY
(id_fornecedor) REFERENCES fornecedor
(id_fornecedor)
);

CREATE TABLE tarefa (
    id_tarefa INTEGER PRIMARY KEY AUTOINCREMENT,
    id_evento INTEGER,
    descricao TEXT,
    status TEXT CHECK
(status IN
('pendente','concluida')),
    FOREIGN KEY
(id_evento) REFERENCES evento
(id_evento)
);

CREATE TABLE compromisso (
    id_compromisso INTEGER PRIMARY KEY AUTOINCREMENT,
    id_evento INTEGER,
    descricao TEXT,
    data_compromisso DATE,
    FOREIGN KEY
(id_evento) REFERENCES evento
(id_evento)
);