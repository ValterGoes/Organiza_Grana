const LAST_BACKUP_KEY = 'organiza-grana-last-backup';
const BACKUP_INTERVAL_DAYS = 7;

/**
 * Exporta todos os dados do localStorage como arquivo JSON.
 */
export function exportBackup() {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key !== LAST_BACKUP_KEY) {
      data[key] = localStorage.getItem(key)!;
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `organiza-grana-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

/**
 * Verifica se é hora de fazer backup automático (a cada 7 dias).
 * Retorna true se o backup foi disparado.
 */
export function autoBackupIfNeeded(): boolean {
  const last = localStorage.getItem(LAST_BACKUP_KEY);
  if (!last) {
    // Primeiro uso, marcar a data e não fazer backup ainda
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
    return false;
  }

  const daysSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince >= BACKUP_INTERVAL_DAYS) {
    exportBackup();
    return true;
  }
  return false;
}

/**
 * Importa dados de um arquivo JSON de backup para o localStorage.
 * Retorna true se a importação foi bem-sucedida.
 */
export function importBackup(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (typeof data !== 'object' || data === null) {
          resolve(false);
          return;
        }
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            localStorage.setItem(key, value);
          }
        }
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
}
