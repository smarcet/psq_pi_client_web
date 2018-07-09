import React from 'react';
import ReactDOM from 'react-dom';
import App  from './app';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'simple-line-icons/css/simple-line-icons.css';
import './scss/style.scss';
import { Provider } from 'react-redux'
import store, {persistor} from './store';
import { PersistGate } from 'redux-persist/es/integration/react'
import './i18n';

const onBeforeLift = () => {
    console.log("reading state ...")
}

ReactDOM.render
(
    <Provider store={store}>
        <PersistGate
            onBeforeLift={onBeforeLift}
            persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>,
    document.querySelector('#root')
);