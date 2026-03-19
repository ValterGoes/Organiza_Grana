import {
  generateSalt,
  deriveKey,
  encrypt,
  decrypt,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from './crypto';

const SALT_KEY = 'gerenciador-vencimentos-salt';
const LEGACY_BILLS_KEY = 'gerenciador-vencimentos-bills';

let cryptoKey: CryptoKey | null = null;

export function isInitialized(): boolean {
  return cryptoKey !== null;
}

export async function init(pin: string): Promise<void> {
  let saltBase64 = localStorage.getItem(SALT_KEY);
  let salt: Uint8Array;

  if (saltBase64) {
    salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
  } else {
    salt = generateSalt();
    localStorage.setItem(SALT_KEY, arrayBufferToBase64(salt.buffer));
  }

  cryptoKey = await deriveKey(pin, salt);
}

export async function save(key: string, data: unknown): Promise<void> {
  if (!cryptoKey) throw new Error('Storage not initialized');

  const json = JSON.stringify(data);
  const { iv, ciphertext } = await encrypt(json, cryptoKey);

  localStorage.setItem(key, JSON.stringify({ iv, ciphertext }));
}

export async function load(key: string): Promise<unknown | null> {
  if (!cryptoKey) throw new Error('Storage not initialized');

  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const { iv, ciphertext } = JSON.parse(raw);
    if (!iv || !ciphertext) return null;

    const json = await decrypt(iv, ciphertext, cryptoKey);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function clear(): void {
  cryptoKey = null;
}

export function hasExistingData(): boolean {
  return localStorage.getItem(SALT_KEY) !== null;
}

/**
 * Migra dados plaintext existentes para formato criptografado.
 * Chamado uma única vez durante o setup do PIN.
 */
export async function migrateFromPlaintext(): Promise<void> {
  if (!cryptoKey) throw new Error('Storage not initialized');

  const plaintext = localStorage.getItem(LEGACY_BILLS_KEY);
  if (!plaintext) return;

  try {
    const data = JSON.parse(plaintext);
    if (Array.isArray(data) && data.length > 0) {
      await save(LEGACY_BILLS_KEY, data);
    }
  } catch {
    // Se não for JSON válido, ignora
  }
}
