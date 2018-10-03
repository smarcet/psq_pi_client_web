import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import AuthorizedRoute from './routes/autorized-route';
import DefaultRoute from './routes/default-route';

import { connect } from 'react-redux'
import { onUserAuth, doLogin, doVerification } from './actions/auth-actions'
import Page404 from './views/Page404';
import Page500 from "./views/Page500";
import MainLayout from "./views/main-layout";

class App extends React.PureComponent {
    render() {
        return (
            <BrowserRouter>
                    <Switch>
                        <AuthorizedRoute isLoggedUser={this.props.isLoggedUser}
                                         path='/auth'
                                         currentUser={this.props.currentUser}
                                         loading={this.props.loading}
                                         exerciseStatus={this.props.exerciseStatus}
                                         component={MainLayout} />
                        <Route path="/404" component={Page404} />
                        <Route path="/500" component={Page500} />
                        <DefaultRoute
                            isLoggedUser={this.props.isLoggedUser}
                            doLogin={this.props.doLogin}
                            currentDevice={this.props.currentDevice}
                            doVerification={this.props.doVerification}
                        />
                    </Switch>
            </BrowserRouter>
        );
    }
};

const mapStateToProps = ({ loggedUserState, baseState, exercisePlayerState }) => ({
    isLoggedUser: loggedUserState.isLoggedUser,
    currentUser: loggedUserState.currentUser,
    currentDevice: loggedUserState.currentDevice,
    loading: baseState.loading,
    exerciseStatus: exercisePlayerState.exerciseStatus,
    streamStatus: exercisePlayerState.streamStatus,
});

export default connect(mapStateToProps, {
    onUserAuth,
    doLogin,
    doVerification,
})(App)

