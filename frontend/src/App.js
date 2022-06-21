import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import HomePage from 'Routes/HomePage';
import './style/main.scss';
import { Provider } from 'react-redux';
import store from 'Store';

function App() {
    return (
        <Provider store={ store }>
            <Router>
                <Switch>
                    <Route exact path="/" component={ HomePage } />
                </Switch>
            </Router>
        </Provider>
    );
}

export default App;
