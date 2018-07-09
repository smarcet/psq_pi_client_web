import React, {Component} from 'react';
import {
    ListGroup,
    ListGroupItem,
    ListGroupItemHeading,
    ListGroupItemText,
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap';

import T from 'i18n-react';
import 'sweetalert2/dist/sweetalert2.css';
import { connect } from 'react-redux'
import {getAvailableExercises} from "../actions/exercises-actions";

class AvailableExercisesList extends Component
{
    constructor(props) {
        super(props);
        this.state = {
            optionsToggle : {}
        };
        this.isOpen = this.isOpen.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    componentWillMount () {
        this.props.getAvailableExercises(1, 9999999);

    }

    isOpen(exercise){
        let {optionsToggle} = this.state;
        if(!optionsToggle.hasOwnProperty(exercise.id)) return false;
        return optionsToggle[exercise.id];
    }

    toggle(exercise){
        let {optionsToggle} = this.state;
        let isOpen = false;
        if(optionsToggle.hasOwnProperty(exercise.id)){
            isOpen = !optionsToggle[exercise.id];
        }
        optionsToggle[exercise.id] = isOpen;
        this.setState({...this.state, optionsToggle});
    }

    render(){
        let {availableExercises} = this.props;
        return(
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" lg="12">
                        <Card>
                            <CardHeader>
                                <i className="fa fa-align-justify"></i> {T.translate("Select an Exercise")}
                            </CardHeader>
                            <CardBody>
                                {availableExercises.length == 0 &&
                                    <p>{T.translate("List is empty.")}</p>
                                }
                                {availableExercises.length > 0 &&
                                <ListGroup>
                                    {
                                        availableExercises.map((exercise) =>
                                            <ListGroupItem key={exercise.id}>
                                                <Row>
                                                    <Col xs="10" lg="10">
                                                        <ListGroupItemHeading>{exercise.title}</ListGroupItemHeading>
                                                        <ListGroupItemText>
                                                            {exercise.abstract}
                                                        </ListGroupItemText>
                                                    </Col>
                                                    <Col xs="2" lg="2">
                                                        <ButtonDropdown className="btn-right"
                                                                        isOpen={this.isOpen(exercise)}
                                                                        toggle={(e) => this.toggle(exercise)}>
                                                            <DropdownToggle className="exercise-option">
                                                                <i className="fa fa-align-justify"></i>
                                                            </DropdownToggle>
                                                            <DropdownMenu>
                                                                <DropdownItem tag="a"
                                                                              href={`/auth/exercises/${exercise.id}/execute`}>{T.translate("Execute")}</DropdownItem>
                                                                <DropdownItem tag="a"
                                                                              href={`/auth/exercises/${exercise.id}/info`}>{T.translate("More info...")}</DropdownItem>
                                                            </DropdownMenu>
                                                        </ButtonDropdown>
                                                    </Col>
                                                </Row>
                                            </ListGroupItem>
                                        )
                                    }
                                </ListGroup>
                                }
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

const mapStateToProps = ({ exercisesListState }) => ({
    availableExercises : exercisesListState.items,
});

export default connect (
    mapStateToProps,
    {
        getAvailableExercises,
    }
)(AvailableExercisesList);