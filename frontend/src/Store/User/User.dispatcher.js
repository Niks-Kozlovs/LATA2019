import {
    updateInfo
} from 'Store/User';

class UserDispatcher {
    updateUserInfo(dispatch, { login }) {
        dispatch(updateInfo(login));
    }
}

export default new UserDispatcher();
