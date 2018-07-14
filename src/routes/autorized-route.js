import React from "react";
import { Redirect, Route} from 'react-router-dom'

class AuthorizedRoute extends React.Component {

    componentWillMount() {
    }

    render() {
        const { component: Component, isLoggedUser, currentUser, loading, ...rest } = this.props;
        return (
            <Route {...rest} render={ props => {

                let { location } = this.props;
                let backUrl = location.pathname;
                if(location.search != null && location.search != null){
                    backUrl += location.search
                }
                if(location.hash != null && location.hash != null){
                    backUrl += location.hash
                }

                return isLoggedUser
                    ? <Component {...props} currentUser={currentUser} loading={loading}/>
                    : <Redirect
                        to={{
                            pathname: `/?BackUrl=${encodeURIComponent(backUrl)}`,
                            state: { from: location }
                        }}
                    />
            }} />
        )
    }
}

export default AuthorizedRoute;
