import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'debut.db';
let database: SQLite.SQLiteDatabase | null = null;

async function ensureDatabasePath() {
  const databaseDirectory = new FileSystem.Directory(FileSystem.Paths.document, 'SQLite');
  if (!databaseDirectory.exists) {
    databaseDirectory.create({ intermediates: true, idempotent: true });
  }

  const databaseFile = new FileSystem.File(databaseDirectory, DATABASE_NAME);
  if (!databaseFile.exists) {
    const asset = Asset.fromModule(require('../../assets/debut.db'));
    await asset.downloadAsync();
    if (!asset.localUri) {
      throw new Error('Database asset not found.');
    }
    const sourceFile = new FileSystem.File(asset.localUri);
    sourceFile.copy(databaseFile);
  }
}

async function seedDatabase(db: SQLite.SQLiteDatabase) {
  db.runSync(`
    CREATE TABLE IF NOT EXISTS usuario (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT UNIQUE,
      senha_hash TEXT,
      perfil TEXT CHECK(perfil IN ('familiar','cerimonialista'))
    )
  `);

  const existe = db.getFirstSync(
    'SELECT id_usuario FROM usuario WHERE email = ?',
    ['carlos@teste.com']
  );

  if (!existe) {
    db.runSync(
      'INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
      ['Carlos', 'carlos@teste.com', '123456', 'familiar']
    );
    console.log('[DB] Usuário de teste criado!');
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    await ensureDatabasePath();
    database = SQLite.openDatabaseSync(DATABASE_NAME);
    await seedDatabase(database);
  }
  return database;
}