import React, {Component} from 'react';
import { connect } from 'react-redux'
import { doLogout} from '../actions/auth-actions'

class Logout extends Component {

    componentDidMount(){
        this.props.doLogout();
    }

    render(){
        return null;
    }
}

const mapStateToProps = ({ loggedUserState }) => ({

});

export default connect(mapStateToProps, {
    doLogout
})(Logout);