//-- Variables

import { type CookieSerializeOptions } from 'cookie-es';

//--

//-- Functions

export function defaultCookieConfig(): CookieSerializeOptions {
    const years = 2 * 3.154e10; // This equals 2 years
    const cookieExpireTime = Date.now() + years;
    const expires = new Date(cookieExpireTime);

    return {
        expires,
        httpOnly: true,
        secure: true,
    };
}

//--
