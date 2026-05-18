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

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    await ensureDatabasePath();
    database = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return database;
}
