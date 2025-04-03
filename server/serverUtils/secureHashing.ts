//-- Variables

import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

//--

//-- Functions

export function generateHash(toHash: string, storedSalt?: string) {
    let salt = storedSalt;

    if (!salt) {
        salt = randomBytes(16).toString('hex');
    }

    const hash = scryptSync(toHash, salt, 64).toString('hex');

    return { salt, hash };
}

export function hashMatch(hashA: string, hashB: string) {
    const hashA_Buffer = Buffer.from(hashA, 'hex');
    const hashB_Buffer = Buffer.from(hashB, 'hex');

    return timingSafeEqual(hashA_Buffer, hashB_Buffer);
}

//--
