//-- Variables

import { type H3Event, type EventHandlerRequest } from 'h3';

//--

//-- Functions

export function badRequestError(event: H3Event<EventHandlerRequest>) {
    setResponseStatus(event, 400);
    return;
}

export function unauthorizedError(event: H3Event<EventHandlerRequest>) {
    setResponseStatus(event, 403);
    return;
}

export function notFoundError(event: H3Event<EventHandlerRequest>) {
    setResponseStatus(event, 404);
    return;
}

export function notAcceptableError(event: H3Event<EventHandlerRequest>) {
    setResponseStatus(event, 406);
    return;
}

export function conflictError(event: H3Event<EventHandlerRequest>) {
    setResponseStatus(event, 409);
    return;
}

export function rateLimitError(event: H3Event<EventHandlerRequest>) {
    setResponseStatus(event, 429);
    return;
}

export function internalServerError(event: H3Event<EventHandlerRequest>) {
    setResponseStatus(event, 500);
    return;
}

//--
