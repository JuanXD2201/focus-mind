
const SESSION_STORAGE_KEY = 'enc_key';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64ToBuffer(b64: string) {
    return new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array) {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))));
}

// Derives a key from a password and salt (email) using PBKDF2.
export async function generateKey(email: string, pass: string): Promise<string> {
    const salt = encoder.encode(email);
    const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(pass),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    
    const exportedKey = await window.crypto.subtle.exportKey('raw', derivedKey);
    return bufferToBase64(exportedKey);
}

// Encrypts data using AES-GCM.
export async function encrypt(text: string, b64Key: string): Promise<string> {
    const key = await window.crypto.subtle.importKey(
        'raw',
        base64ToBuffer(b64Key),
        'AES-GCM',
        true,
        ['encrypt']
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // IV for AES-GCM
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encoder.encode(text)
    );

    // Store IV with the encrypted data. It's not secret.
    return `${bufferToBase64(iv)}:${bufferToBase64(encryptedData)}`;
}

// Decrypts data using AES-GCM.
export async function decrypt(ciphertext: string, b64Key: string): Promise<string> {
    try {
        const [b64Iv, b64Encrypted] = ciphertext.split(':');
        if (!b64Iv || !b64Encrypted) {
            throw new Error("Invalid ciphertext format.");
        }

        const key = await window.crypto.subtle.importKey(
            'raw',
            base64ToBuffer(b64Key),
            'AES-GCM',
            true,
            ['decrypt']
        );
        const iv = base64ToBuffer(b64Iv);
        const encryptedData = base64ToBuffer(b64Encrypted);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedData
        );
        
        const plaintext = decoder.decode(decrypted);
        if (!plaintext) {
            throw new Error("Decryption failed: resulting plaintext is empty.");
        }
        return plaintext;

    } catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Could not decrypt data. The key may be incorrect or the data corrupted.");
    }
}


// --- Session Storage Helpers ---

export function setSessionKey(key: string) {
    if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, key);
    }
}

export function getSessionKey(): string | null {
     if (typeof window !== 'undefined') {
        return window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    }
    return null;
}

export function clearSessionKey() {
     if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
}