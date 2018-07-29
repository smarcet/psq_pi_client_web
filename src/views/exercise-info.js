import React, {Component} from 'react';
import {
    Row,
    Col,
    Card,
    CardHeader,
    CardBody
} from 'reactstrap';
import swal from "sweetalert2";
import T from 'i18n-react';
import 'sweetalert2/dist/sweetalert2.css';
import {connect} from 'react-redux'
import {
    getExerciseById
} from "../actions/exercises-actions";

class ExerciseInfo extends Component {

    componentWillMount() {
        let exerciseId = this.props.match.params.exercise_id;
        this.props.getExerciseById(exerciseId);
    }

    niceDuration(seconds){
        let remainingSeconds = seconds % 60;
        let strRemainingSeconds = remainingSeconds < 10 ? '0'+remainingSeconds: remainingSeconds;
        return `${Math.floor(seconds / 60)}:${strRemainingSeconds}`
    }

    render(){
        let {currentExercise} = this.props;
        if(currentExercise == null) return null;
        return(
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" md="12">
                        <Card>
                            <CardHeader>
                                <strong>{currentExercise.title}</strong>&nbsp;({this.niceDuration(currentExercise.max_duration)} {T.translate("minutes")})
                            </CardHeader>
                            <CardBody>
                                <h2>{T.translate("Abstract")}</h2>
                                <hr/>
                                <p>
                                    {currentExercise.abstract}
                                </p>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = ({exercisePlayerState}) => ({
    currentExercise: exercisePlayerState.currentExercise,
});

export default connect(
    mapStateToProps,
    {
        getExerciseById,
    }
)(ExerciseInfo);