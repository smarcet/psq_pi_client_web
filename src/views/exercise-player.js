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
import { connect } from 'react-redux'
import { StreamStatusChecker, STREAM_STATUS_OK, STREAM_STATUS_ERROR}  from '../components/stream-status-checker';
import { getExerciseById, startExerciseRecordingJob, stopExerciseRecordingJob } from '../actions/exercises-actions';

const EXERCISE_INITIAL_STATUS = 0;
const EXERCISE_STARTING_STATUS = 1;
const EXERCISE_RUNNING_STATUS = 2;

class ExercisePlayer extends Component {

    constructor(props){
        super(props);
        this.startExercise = this.startExercise.bind(this);
        this.state = {
            exerciseStatus : EXERCISE_INITIAL_STATUS,
            seconds:0,
            interval: 0,
            readySeconds : 5,
            readyInterval: 0,
            streamStatus: null
        }
        this.runTimer = this.runTimer.bind(this);
        this.startExercise = this.startExercise.bind(this);
        this.stopExercise = this.stopExercise.bind(this);
        this.renderTimerReady = this.renderTimerReady.bind(this);
        this.runReadyTimer = this.runReadyTimer.bind(this);
    }

    componentWillMount () {
        let  exerciseId = this.props.match.params.exercise_id;
        // get exercise ...
        console.log(`getting exercise ${exerciseId} ...`);
        this.props.getExerciseById(exerciseId).then(() => {
            let streamUrl  = process.env['LOCAL_STREAM_URL'];
            let player = document.getElementById("stream_player")
            let now = new Date();
            player.src = `${streamUrl}?_=${now.getTime()}`;
            this.setState({...this.state, STREAM_STATUS_OK});
        });
    }

    renderTimerReady(){
        let {readySeconds} = this.state;
        if(readySeconds == 0)
            return T.translate("GO!!");
        return readySeconds;
    }

    startExercise(){
       this.props.startExerciseRecordingJob(this.props.currentExercise).then(() => {
           let readyInterval =  window.setInterval(this.runReadyTimer, 1000);
           this.setState({...this.state, exerciseStatus: EXERCISE_STARTING_STATUS, readyInterval, readySeconds: 5});
       });
    }

    stopExercise(){
        swal({
            title: T.translate('Are you sure?'),
            text: T.translate('You will submit the exercise'),
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: T.translate('Yes, submit it!'),
            cancelButtonText: T.translate('No, keep doing it')
        }).then((result) => {
            if (result.value) {
                // call to local api to stop recording it and upload file

                let {interval} = this.state;
                window.clearInterval(interval);
                this.props.stopExerciseRecordingJob(this.props.currentExercise, this.props.currentRecordingJob).then(() => {
                    swal({
                        title: T.translate('Success!!!'),
                        text: T.translate('Your exam was successfully submitted'),
                        type: 'success'
                    });
                    this.setState({...this.state, exerciseStatus: EXERCISE_INITIAL_STATUS, seconds:0, interval: null});
                    this.props.history.push("/auth/exercises");
                });

            }
        })
    }

    runTimer(){
        this.setState({...this.state, seconds : this.state.seconds + 1});
    }

    runReadyTimer(){
        let {readySeconds, readyInterval, interval, seconds, exerciseStatus} = this.state;
        readySeconds = readySeconds - 1;
        if(readySeconds < 0){
            window.clearInterval(readyInterval);
            readyInterval = 0;
            interval =  window.setInterval(this.runTimer, 1000);
            seconds = 0;
            exerciseStatus = EXERCISE_RUNNING_STATUS;
        }
        this.setState({...this.state, readySeconds, readyInterval, interval, seconds, exerciseStatus});
    }

    renderTimer(){
        let {seconds} = this.state;
        let leftSeconds = seconds % 60;
        let minutes = Math.floor(seconds / 60 );
        if(leftSeconds < 10){
            leftSeconds = `0${leftSeconds}`;
        }
        if(minutes < 10){
            minutes = `0${minutes}`;
        }
        return `${minutes}:${leftSeconds}`;
    }

    render(){
        let streamUrl  = process.env['LOCAL_STREAM_URL'];
        let {exerciseStatus, streamStatus} = this.state;
        let { currentExercise } = this.props;
        if(currentExercise == null) return null;
        return(
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" lg="12">
                        <Card>
                            <CardHeader>
                                <i className="fa fa-align-justify"></i> {T.translate("Exercise {exercise_name}", {exercise_name : currentExercise.title})}
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xs="12" lg="12">
                                <div className="img-wrapper">
                                    <img className="rounded img-fluid mx-auto d-block"
                                         src="/img/video_thumbnail_generic.png"
                                         id="stream_player"
                                         name="stream_player"
                                    />
                                    {streamStatus == STREAM_STATUS_OK && exerciseStatus == EXERCISE_INITIAL_STATUS &&
                                    <div className="img-overlay1">
                                        <button className="btn btn-md btn-success btn-player" onClick={this.startExercise}>
                                            <i className="fa fa-play-circle"></i>
                                        </button>
                                    </div>
                                    }
                                    {exerciseStatus == EXERCISE_STARTING_STATUS  &&
                                    <div className="img-overlay3">
                                        <span className="exercise-timer-ready" id="timer-ready" name="timer-ready">{this.renderTimerReady()}</span>
                                    </div>
                                    }
                                    {exerciseStatus == EXERCISE_RUNNING_STATUS  &&
                                    <div className="img-overlay2">
                                        <span className="exercise-timer" id="timer" name="timer">{this.renderTimer()}</span>
                                    </div>
                                    }
                                </div>
                                    </Col>
                                </Row>
                                {exerciseStatus == EXERCISE_RUNNING_STATUS  &&
                                <Row>
                                    <Col xs="12" lg="12" className="text-center">
                                        <button className="btn btn-md btn-danger btn-player" onClick={this.stopExercise}>
                                            <i className="fa fa-stop-circle"></i>
                                        </button>
                                    </Col>
                                </Row>
                                }
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = ({ exerciseStateState }) => ({
    currentExercise: exerciseStateState.currentExercise,
    currentRecordingJob: exerciseStateState.currentRecordingJob
});

export default connect (
    mapStateToProps,
    {
        getExerciseById,
        startExerciseRecordingJob,
        stopExerciseRecordingJob,
    }
)(ExercisePlayer);