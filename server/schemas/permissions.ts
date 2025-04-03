export default [
    {
        id: 1,

        name: 'MEMBER'
    },

    {
        id: 2,

        name: 'MODERATOR',

        actions: {
            set: [
                'MODERATE_USER',
                'DELETE_POST',
                'MODIFY_POST',
                'MODIFY_USER'
            ]
        }
    },

    {
        id: 3,

        name: 'ADMIN',

        actions: {
            set: [
                'ADMINISTRATOR'
            ]
        }
    }
]