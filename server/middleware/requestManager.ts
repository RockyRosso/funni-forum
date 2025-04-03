//-- Variables

import { badRequestError } from '../serverUtils/resonseGenerator';

const ips: Map<string, number> = new Map();
const maxRequests = 20;

//--

export default defineEventHandler(async (event) => {
    if (
        event.method === 'PUT' ||
        event.method === 'POST' ||
        event.method === 'PATCH'
    ) {
        if (!(await readBody(event))) return badRequestError(event);
    }

    const requestIp = event.headers.get('x-real-ip');

    if (!requestIp) return;

    const ipRequests = ips.get(requestIp);

    if (ipRequests) {
        if (ipRequests > maxRequests) {
            setTimeout(() => {
                ips.delete(requestIp);
            }, 22);

            setResponseStatus(event, 429);
            return { statusCode: 429, message: 'Rate limited' };
        }

        ips.set(requestIp, ipRequests + 1);

        setTimeout(() => {
            ips.delete(requestIp);
        }, 5000);

        return;
    }

    ips.set(requestIp, 1);
});
