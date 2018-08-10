import React, {Component} from 'react';
import {
    Container,
    Row,
    Col,
    CardGroup,
    Card,
    CardBody,
    Button,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText
} from 'reactstrap';
import T from 'i18n-react';
import URI from "urijs"

class Login extends Component {

    constructor(props) {
        super(props);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.state = {
            invalidUserName: false,
            invalidPassword: false,
        }
    }

    handleKeyPress(event){
        if (event.charCode == 13) {
            this.onLoginClick()
        }
    }

    validatePassword(passwordValue){
        return passwordValue != '';
    }

    validateUserName(usernameValue){
        return usernameValue != '';
    }

    onLoginClick() {
        let validUsername = this.validateUserName(this.username.value);
        let validPassword = this.validatePassword(this.password.value);
        this.setState({...this.state, invalidUserName: !validUsername , invalidPassword: !validPassword});
        if(!validUsername || !validPassword) return;
        let url = URI(window.location.href);
        let query = url.search(true);
        let backUrl = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : '/auth';
        this.props.doLogin(this.username.value, this.password.value, this.props.history, backUrl);
    }

    render() {

        return (
            <div className="app flex-row align-items-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col sm="8" md="8" lg="5">
                            <CardGroup>
                                <Card className="p-4">
                                    <CardBody>
                                        <h1>{T.translate("Login")}</h1>
                                        <p className="text-muted">{T.translate("Sign In to your account")}</p>
                                        <InputGroup className="mb-3">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-user"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input onKeyPress={this.handleKeyPress}  type="text" placeholder={T.translate("Username")} invalid={this.state.invalidUserName}  innerRef={(input) => {
                                                this.username = input;
                                            }}/>
                                        </InputGroup>
                                        <InputGroup className="mb-4">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-lock"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input onKeyPress={this.handleKeyPress} type="password" placeholder={T.translate("Password")} invalid={this.state.invalidPassword} innerRef={(input) => {
                                                this.password = input;
                                            }}/>
                                        </InputGroup>
                                        <Row>
                                            <Col xs="6">
                                                <Button color="primary" className="px-4"
                                                        onClick={(e) => this.onLoginClick(e)}>{T.translate("Login")}</Button>
                                            </Col>
                                            <Col xs="6" className="text-right">

                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </CardGroup>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Login;
