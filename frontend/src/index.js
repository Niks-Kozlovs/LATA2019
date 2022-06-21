import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

require('dotenv').config();

// Disable react dev tools in production
if (
    process.env.NODE_ENV === 'production'
    && window.__REACT_DEVTOOLS_GLOBAL_HOOK__
) window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function () {}; // eslint-disable-line func-names

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.register();
