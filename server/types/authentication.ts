export type authResult = {
    sessionId: string;
    id: string;
    action: string;
};

export type oAuthResult = {
    error: string;
    result: authResult;
};
