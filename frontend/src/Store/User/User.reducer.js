import {
    UPDATE_USER_INFO
} from './User.action';

const updateInfo = (action) => {
    return action;
};

const initialState = {
    user: { }
};

const UserReducer = (state = initialState, action) => {
    const { type } = action;

    switch (type) {
    case UPDATE_USER_INFO:
        return {
            ...state,
            ...updateInfo(action)
        };

    default:
        return state;
    }
};

export default UserReducer;
