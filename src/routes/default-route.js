
import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import Login from '../views/Login';
import DeviceVerification from '../views/device-verification';

class DefaultRoute extends React.Component {

    render() {
        const { isLoggedUser, doLogin, currentDevice, doVerification, ...rest } = this.props;
        return (
            <Route {...rest} render={props => {
                if(isLoggedUser)
                    return (<Redirect
                        exact
                        to={{
                            pathname: '/auth',
                            state: { from: props.location }
                        }}
                    />)
                if(currentDevice == null || !currentDevice.is_verified){
                    return (<DeviceVerification {...props} currentDevice={currentDevice} doVerification={doVerification}/>);
                }
                return (<Login {...props} doLogin={doLogin}/>);
            }} />
        )
    }
}


export default DefaultRoute;