//-- Variables

import { type H3Event, type EventHandlerRequest } from 'h3';

const ipRegexes = {
    // Thanks to 'request-ip': https://github.com/pbojinov/request-ip
    ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
    ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
};

//--

//-- Functions

function validIp(ip: string | null) {
    return (
        (ip !== null && ipRegexes.ipv4.test(ip)) ||
        (ip !== null && ipRegexes.ipv6.test(ip))
    );
}

export function getIp(request: H3Event<EventHandlerRequest>) {
    const headers = request.headers;

    if (!headers) return;

    // Modified from 'request-ip' library: https://github.com/pbojinov/request-ip

    if (validIp(request.headers.get('cf-connecting-ip'))) {
        return request.headers.get('cf-connecting-ip');
    }

    if (validIp(request.headers.get('true-client-ip'))) {
        return request.headers.get('true-client-ip');
    }

    if (validIp(request.headers.get('x-real-ip'))) {
        return request.headers.get('x-real-ip');
    }

    if (validIp(request.headers.get('x-forwarded'))) {
        return request.headers.get('x-forwarded');
    }

    if (validIp(request.headers.get('forwarded-for'))) {
        return request.headers.get('forwarded-for');
    }
}

//--
