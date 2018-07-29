import React, {Component} from 'react';
import {
    Row,
    Col,
} from 'reactstrap';
import swal from "sweetalert2";
import T from 'i18n-react';
import 'sweetalert2/dist/sweetalert2.css';
import {connect} from 'react-redux'
import {STREAM_STATUS_OK, STREAM_STATUS_ERROR} from '../models/stream';
import {EXERCISE_INITIAL_STATUS, EXERCISE_RUNNING_STATUS, EXERCISE_STARTING_STATUS} from "../models/exercise";
import {
    getExerciseById, startExerciseRecordingJob, stopExerciseRecordingJob, addExerciseSecond, setExerciseStatus,
    setStreamStatus, checkBackgroundProcessStreaming, checkBackgroundProcessCapture,
    abortExercise
} from '../actions/exercises-actions';
import {
    BACKGROUND_PROCESS_CAPTURE_ERROR_STATE,
    BACKGROUND_PROCESS_STREAMING_ERROR_STATE
} from "../models/background_processes";


class ExercisePlayer extends Component {

    constructor(props) {
        super(props);
        this.startExercise = this.startExercise.bind(this);
        this.state = {
            interval: 0,
            readySeconds: 5,
            readyInterval: 0,
        }
        this.displayingStreamingError = false;
        this.ignoreStreamError = false;
        this.displayingCaptureError = false;
        this.runTimer = this.runTimer.bind(this);
        this.startExercise = this.startExercise.bind(this);
        this.stopExercise = this.stopExercise.bind(this);
        this.renderTimerReady = this.renderTimerReady.bind(this);
        this.runReadyTimer = this.runReadyTimer.bind(this);
        this.onStreamLoadError = this.onStreamLoadError.bind(this);
        this.onStreamLoad = this.onStreamLoad.bind(this);
    }

    onStreamLoadError() {
        console.log('onStreamLoadError');
        let player = document.getElementById("stream_player")
        player.src = "/img/stream_error.jpg"
        this.props.setStreamStatus(STREAM_STATUS_ERROR);
    }

    onStreamLoad() {

    }

    componentWillMount() {
        let exerciseId = this.props.match.params.exercise_id;
        // get exercise ...
        console.log(`getting exercise ${exerciseId} ...`);
        this.props.getExerciseById(exerciseId).then(() => {
            let streamUrl = process.env['LOCAL_STREAM_URL'];
            let player = document.getElementById("stream_player")
            let now = new Date();
            player.src = `${streamUrl}?_=${now.getTime()}`;
        });
    }

    componentDidMount() {
        let {currentExercise, exerciseStatus, streamStatus} = this.props;
        if (currentExercise === null) return;
        if (exerciseStatus == EXERCISE_RUNNING_STATUS) {
            this.startRunningTimer()
        }
    }

    renderTimerReady() {
        let {readySeconds} = this.state;
        if (readySeconds == 0)
            return T.translate("GO!!");
        return readySeconds;
    }

    startExercise() {
        this.props.startExerciseRecordingJob(this.props.currentExercise).then(() => {
            let readyInterval = window.setInterval(this.runReadyTimer, 1000);
            this.setState({...this.state, readyInterval, readySeconds: 5});
            this.props.setExerciseStatus(EXERCISE_STARTING_STATUS);
        });
    }

    stopExercise() {
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
                    this.setState({...this.state, interval: null});
                    this.props.setExerciseStatus(EXERCISE_INITIAL_STATUS);
                    this.props.history.push("/auth/exercises");
                });

            }
        })
    }

    runTimer() {
        this.props.addExerciseSecond();
        this.props.checkBackgroundProcessStreaming();
        this.props.checkBackgroundProcessCapture();
    }

    runReadyTimer() {
        let {readySeconds, readyInterval, interval} = this.state;
        readySeconds = readySeconds - 1;
        if (readySeconds < 0) {
            window.clearInterval(readyInterval);
            readyInterval = 0;
            interval = window.setInterval(this.runTimer, 1000);
            this.props.setExerciseStatus(EXERCISE_RUNNING_STATUS);
        }
        this.setState({...this.state, readySeconds, readyInterval, interval});
    }

    startRunningTimer() {
        let interval = window.setInterval(this.runTimer, 1000);
        this.props.setExerciseStatus(EXERCISE_RUNNING_STATUS);
        this.setState({...this.state, interval});
    }

    renderTimer() {
        let {timer, currentExercise } = this.props;
        let className = 'exercise-timer ';
        if(timer >= ( currentExercise.max_duration - 30) ) {
            className += ' exercise-timer-danger';
        }
        let leftSeconds = timer % 60;
        let minutes = Math.floor(timer / 60);
        if (leftSeconds < 10) {
            leftSeconds = `0${leftSeconds}`;
        }
        if (minutes < 10) {
            minutes = `0${minutes}`;
        }
        return  (<span className={className} id="timer"
                      name="timer">{minutes+':'+leftSeconds}</span>);
    }

    render() {
        let {
            timer,
            currentExercise,
            exerciseStatus,
            streamStatus,
            backgroundProcessStreamingStatus,
            backgroundProcessCaptureStatus
        } = this.props;

        if(currentExercise == null) return null;

        if(timer >= currentExercise.max_duration){
            swal({
                title: T.translate('Exercise Max. Length reached!'),
                text: T.translate('Exercise will be aborted because you reached the max. allowed length'),
                type: 'error'
            });

            this.props.abortExercise(this.props.currentExercise, this.props.currentRecordingJob).then(
                () =>  this.props.history.push("/auth/exercises")
            );
            return null;
        }
        if(backgroundProcessStreamingStatus == BACKGROUND_PROCESS_STREAMING_ERROR_STATE && ! this.displayingStreamingError && !this.ignoreStreamError){
            this.displayingStreamingError = true;
            swal({
                title: T.translate('Streaming process error'),
                text: T.translate('Do you want to continue exercise? streaming process is down right now.'),
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: T.translate('Yes, continue.'),
                cancelButtonText: T.translate('No, stop it.')
            }).then((result) => {
                if (!result.value) {
                    // abort exercise
                    this.props.abortExercise(this.props.currentExercise, this.props.currentRecordingJob).then(
                        () =>  this.props.history.push("/auth/exercises")
                    );
                    return;
                }
                this.ignoreStreamError = true;
            })
        }

        if(backgroundProcessCaptureStatus == BACKGROUND_PROCESS_CAPTURE_ERROR_STATE && !this.displayingCaptureError){
            this.displayingCaptureError = true;
            swal({
                title: T.translate('Video capture process error'),
                text: T.translate('Video capture process is erroring right now, canceling exercise, try again later'),
                type: 'error'
            });

            this.props.abortExercise(this.props.currentExercise, this.props.currentRecordingJob).then(
                () =>  this.props.history.push("/auth/exercises")
            );
            return null;
        }
        if (currentExercise == null) return null;
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" lg="12">
                        <h2>{T.translate("Exercise {exercise_name}", {exercise_name: currentExercise.title})}</h2>
                        <div className="img-wrapper">
                            <img className="rounded img-fluid mx-auto d-block"
                                 src="/img/video_thumbnail_generic.png"
                                 id="stream_player"
                                 name="stream_player"
                                 onError={this.onStreamLoadError}
                                 onLoad={this.onStreamLoad}
                            />
                            {streamStatus == STREAM_STATUS_OK && exerciseStatus == EXERCISE_INITIAL_STATUS &&
                            <div className="img-overlay1">
                                <button className="btn btn-lg btn-success btn-player"
                                        onClick={this.startExercise}>
                                    <i className="fa fa-play-circle"></i>
                                </button>
                            </div>
                            }
                            {exerciseStatus == EXERCISE_STARTING_STATUS &&
                            <div className="img-overlay3">
                                                <span className="exercise-timer-ready" id="timer-ready"
                                                      name="timer-ready">{this.renderTimerReady()}</span>
                            </div>
                            }
                            {exerciseStatus == EXERCISE_RUNNING_STATUS &&
                            <div className="img-overlay2">
                                <button className="btn btn-md btn-danger btn-player btn-recording"
                                        onClick={this.stopExercise}>
                                    <i className="fa fa-stop-circle"></i>
                                </button>
                                {this.renderTimer()}
                            </div>
                            }
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = ({exercisePlayerState}) => ({
    currentExercise: exercisePlayerState.currentExercise,
    currentRecordingJob: exercisePlayerState.currentRecordingJob,
    timer: exercisePlayerState.timer,
    exerciseStatus: exercisePlayerState.exerciseStatus,
    streamStatus: exercisePlayerState.streamStatus,
    backgroundProcessStreamingStatus: exercisePlayerState.backgroundProcessStreamingStatus,
    backgroundProcessCaptureStatus: exercisePlayerState.backgroundProcessCaptureStatus,
});

export default connect(
    mapStateToProps,
    {
        getExerciseById,
        startExerciseRecordingJob,
        stopExerciseRecordingJob,
        addExerciseSecond,
        setExerciseStatus,
        setStreamStatus,
        checkBackgroundProcessStreaming,
        checkBackgroundProcessCapture,
        abortExercise,
    }
)(ExercisePlayer);