import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'debut_v4.db';
let database: SQLite.SQLiteDatabase | null = null;

async function criarTabelas(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS usuario (
      id_usuario          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome                TEXT,
      email               TEXT UNIQUE,
      senha_hash          TEXT,
      perfil              TEXT CHECK(perfil IN ('familiar', 'cerimonialista')),
      cpf                 TEXT UNIQUE,
      data_nascimento     DATE,
      endereco_logradouro TEXT,
      endereco_numero     TEXT,
      endereco_bairro     TEXT,
      endereco_cidade     TEXT,
      endereco_estado     TEXT,
      endereco_cep        TEXT
    );
    CREATE TABLE IF NOT EXISTS evento (
      id_evento   INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario  INTEGER,
      nome        TEXT,
      data_evento DATE,
      orcamento   REAL,
      status      TEXT CHECK(status IN ('ativo','encerrado')),
      FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
    );
    CREATE TABLE IF NOT EXISTS fornecedor (
      id_fornecedor       INTEGER PRIMARY KEY AUTOINCREMENT,
      id_evento           INTEGER,
      nome                TEXT,
      tipo_servico        TEXT,
      valor               REAL,
      cnpj                TEXT,
      telefone            TEXT,
      email               TEXT,
      endereco_logradouro TEXT,
      endereco_numero     TEXT,
      endereco_bairro     TEXT,
      endereco_cidade     TEXT,
      endereco_estado     TEXT,
      endereco_cep        TEXT,
      FOREIGN KEY(id_evento) REFERENCES evento(id_evento)
    );
    CREATE TABLE IF NOT EXISTS pagamento (
      id_pagamento  INTEGER PRIMARY KEY AUTOINCREMENT,
      id_fornecedor INTEGER,
      valor         REAL,
      vencimento    DATE,
      status        TEXT CHECK(status IN ('pendente','pago')),
      FOREIGN KEY(id_fornecedor) REFERENCES fornecedor(id_fornecedor)
    );
    CREATE TABLE IF NOT EXISTS tarefa (
      id_tarefa INTEGER PRIMARY KEY AUTOINCREMENT,
      id_evento INTEGER,
      descricao TEXT,
      status    TEXT CHECK(status IN ('pendente','concluida')),
      FOREIGN KEY(id_evento) REFERENCES evento(id_evento)
    );
    CREATE TABLE IF NOT EXISTS compromisso (
      id_compromisso   INTEGER PRIMARY KEY AUTOINCREMENT,
      id_evento        INTEGER,
      descricao        TEXT,
      data_compromisso DATE,
      FOREIGN KEY(id_evento) REFERENCES evento(id_evento)
    );
  `);
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await criarTabelas(database);
  }
  return database;
}