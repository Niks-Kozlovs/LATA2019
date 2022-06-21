export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';

const updateInfo = (user) => ({
    type: UPDATE_USER_INFO,
    user
});

export {
    updateInfo
};
