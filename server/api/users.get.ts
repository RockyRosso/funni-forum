//-- Variables

import {
    badRequestError,
    internalServerError,
} from '../serverUtils/resonseGenerator';
import User from '../serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { page } = getQuery(event);

    if (!page) return badRequestError(event);
    if (typeof page !== 'string') return badRequestError(event);

    const users = User.fetchUserList(page);

    if (!users) return internalServerError(event);

    return users;
});
