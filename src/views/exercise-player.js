import React, {Component} from 'react';
import {
    Row,
    Col,
    Alert,
    Button
} from 'reactstrap';
import swal from "sweetalert2";
import T from 'i18n-react';
import 'sweetalert2/dist/sweetalert2.css';
import {connect} from 'react-redux'
import {
    STREAM_STATUS_OK, STREAM_STATUS_ERROR, STREAM_STATUS_LOADED, STREAM_STATUS_LOADING,
    STREAM_STATUS_INITIAL
} from '../models/stream';
import {EXERCISE_INITIAL_STATUS, EXERCISE_RUNNING_STATUS, EXERCISE_STARTING_STATUS, EXERCISE_TIMEOUT_STATUS} from "../models/exercise";
import {
    getExerciseById, startExerciseRecordingJob, stopExerciseRecordingJob, addExerciseSecond, setExerciseStatus,
    setStreamStatus, checkBackgroundProcessStreaming, checkBackgroundProcessCapture,
    abortExercise, pingRecordingJob, generateShareExamUrl
} from '../actions/exercises-actions';
import {
    BACKGROUND_PROCESS_CAPTURE_ERROR_STATE,
    BACKGROUND_PROCESS_STREAMING_ERROR_STATE
} from "../models/background_processes";
import {CopyToClipboard} from 'react-copy-to-clipboard';

class ExercisePlayer extends Component {

    constructor(props) {
        super(props);
        this.startExercise = this.startExercise.bind(this);
        this.state = {
            interval: 0,
            readySeconds: 5,
            readyInterval: 0,
            backgroundInterval: 0,
            visibleShareUrlAlert : false,
        }

        this.runTimer = this.runTimer.bind(this);
        this.startExercise = this.startExercise.bind(this);
        this.stopExercise = this.stopExercise.bind(this);
        this.renderTimerReady = this.renderTimerReady.bind(this);
        this.runReadyTimer = this.runReadyTimer.bind(this);
        this.onStreamLoadError = this.onStreamLoadError.bind(this);
        this.onStreamLoad = this.onStreamLoad.bind(this);
        this.onClickShare = this.onClickShare.bind(this);
        this.onDismissShareExercise = this.onDismissShareExercise.bind(this);
        this.abortExercise = this.abortExercise.bind(this);
        this.runBackgroundJobs = this.runBackgroundJobs.bind(this);
        this.stopIntervals = this.stopIntervals.bind(this);
        this.playBeepSound = this.playBeepSound.bind(this);
    }

    onDismissShareExercise() {
        this.setState({ visibleShareUrlAlert: false });
    }

    onStreamLoadError() {
        console.log("Stream Error!");
        let player = document.getElementById("stream_player_placeholder")
        player.src = "/img/stream_error.jpg"
        this.props.setStreamStatus(STREAM_STATUS_ERROR);
    }

    onStreamLoad() {
        let {streamStatus} = this.props;
        let nextStatus = streamStatus == STREAM_STATUS_LOADING ? STREAM_STATUS_LOADED : null;
        if(nextStatus) {
            this.props.setStreamStatus(nextStatus);
            console.log("Stream loaded!");
        }
    }

    componentWillMount() {
        let exerciseId = this.props.match.params.exercise_id;
        // get exercise ...
        console.log(`getting exercise ${exerciseId} ...`);
        this.props.getExerciseById(exerciseId).then(() => {
            console.log(`exercise ${exerciseId} loaded!`);

            let streamUrl = process.env['LOCAL_STREAM_URL'];
            let player = document.getElementById("stream_player")
            let now = new Date();
            player.src = `${streamUrl}?_=${now.getTime()}`;
            this.props.setStreamStatus(STREAM_STATUS_LOADING);
        });
    }

    componentDidMount() {
        let {currentExercise, exerciseStatus, streamStatus} = this.props;
        if (currentExercise === null) return;
        if (exerciseStatus == EXERCISE_RUNNING_STATUS) {
            this.startRunningTimer()
        }
    }

    onClickShare(){
        this.props.generateShareExamUrl(this.props.currentExercise).then(() => {
            this._showShareUrlDialog();
        });
    }

    _showShareUrlDialog(){
        this.setState({ visibleShareUrlAlert: true });
    }

    renderTimerReady() {
        let {readySeconds} = this.state;
        if (readySeconds == 0) {
            return T.translate("GO!!");
        }
        return readySeconds;
    }

    playBeepSound() {
        var snd = new  Audio("data:audio/mpeg;base64,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");
        snd.play();
    }

    startExercise() {
        this.props.startExerciseRecordingJob(this.props.currentExercise).then(() => {
            let readyInterval = window.setInterval(this.runReadyTimer, 1000);
            this.setState({...this.state, readyInterval, readySeconds: 5});
            this.props.setExerciseStatus(EXERCISE_STARTING_STATUS);
        });
    }

    stopIntervals(){
        let {interval, backgroundInterval} = this.state;
        window.clearInterval(interval);
        window.clearInterval(backgroundInterval);
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

                this.stopIntervals();

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
    }

    runBackgroundJobs(){
        this.props.checkBackgroundProcessStreaming();
        this.props.checkBackgroundProcessCapture();
        this.props.pingRecordingJob();
    }

    runReadyTimer() {
        let {readySeconds, readyInterval, interval, backgroundInterval } = this.state;
        readySeconds = readySeconds - 1;
        if (readySeconds < 0) {
            window.clearInterval(readyInterval);
            readyInterval = 0;
            interval = window.setInterval(this.runTimer, 1000);
            backgroundInterval =  window.setInterval(this.runBackgroundJobs, 5000);
            this.props.setExerciseStatus(EXERCISE_RUNNING_STATUS);
        }
        this.setState({...this.state, readySeconds, readyInterval, interval, backgroundInterval});
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

    abortExercise(){
        swal({
            title: T.translate('Are you sure?'),
            text: T.translate('You will abort the exercise'),
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: T.translate('Yes, abort it!'),
            cancelButtonText: T.translate('No, keep doing it')
        }).then((result) => {
            if (result.value) {
                // call to local api to stop recording it and upload file

                this.stopIntervals();

                this.props.abortExercise(this.props.currentExercise, this.props.currentRecordingJob).then(
                    () =>  this.props.history.push("/auth/exercises")
                );
            }
        })
    }

    componentDidUpdate(prevProps, prevState){
        if (this.props.exerciseStatus !== prevProps.exerciseStatus) {
            if(this.props.exerciseStatus == EXERCISE_TIMEOUT_STATUS){
                // timeout, abort it
                this.stopIntervals();

                this.props.abortExercise(this.props.currentExercise, this.props.currentRecordingJob).then(
                    () =>  this.props.history.push("/auth/exercises")
                );
            }
            if(this.props.exerciseStatus == EXERCISE_RUNNING_STATUS){
                this.playBeepSound();
            }
        }

        if (this.props.backgroundProcessStreamingStatus !== prevProps.backgroundProcessStreamingStatus) {
            if(this.props.backgroundProcessStreamingStatus == BACKGROUND_PROCESS_STREAMING_ERROR_STATE){
                swal({
                    title: T.translate('Streaming process error'),
                    text: T.translate('Do you want to continue exercise? streaming process is down right now'),
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: T.translate('Yes, continue'),
                    cancelButtonText: T.translate('No, stop it')
                }).then((result) => {
                    if (!result.value) {
                        // abort exercise
                        this.stopIntervals();
                        this.props.abortExercise(this.props.currentExercise, this.props.currentRecordingJob).then(
                            () =>  this.props.history.push("/auth/exercises")
                        );
                        return;
                    }
                })
            }
        }
        if (this.props.backgroundProcessCaptureStatus !== prevProps.backgroundProcessCaptureStatus) {
            if(this.props.backgroundProcessCaptureStatus == BACKGROUND_PROCESS_CAPTURE_ERROR_STATE){

                swal({
                    title: T.translate('Video capture process error'),
                    text: T.translate('Video capture process is erroring right now, canceling exercise, try again later'),
                    type: 'error'
                });

                this.stopIntervals();

                this.props.abortExercise(this.props.currentExercise, this.props.currentRecordingJob).then(
                    () =>  this.props.history.push("/auth/exercises")
                );

            }
        }
    }

    render() {
        let {
            currentExercise,
            exerciseStatus,
            streamStatus,
            backgroundProcessCaptureStatus
        } = this.props;

        if(currentExercise == null) return null;

        if(exerciseStatus == EXERCISE_TIMEOUT_STATUS){
            swal({
                title: T.translate('Exercise Maximum Length reached!'),
                text: T.translate('Exercise will be aborted because you reached the maximum allowed length'),
                type: 'error'
            });
            return null;
        }

        if(backgroundProcessCaptureStatus == BACKGROUND_PROCESS_CAPTURE_ERROR_STATE){
            return null;
        }

        if (currentExercise == null) return null;
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" lg="12">
                        {   exerciseStatus != EXERCISE_RUNNING_STATUS &&
                            <h2>{T.translate("Exercise {exercise_name}", {exercise_name: currentExercise.title})}</h2>
                        }
                        <hr className="player-divider"></hr>
                        <Button color="warning" className="share-button"
                                onClick={this.onClickShare}
                                outline><i className="fa fa-share-alt"></i>&nbsp;{T.translate("Share It")}
                        </Button>
                        { exerciseStatus == EXERCISE_RUNNING_STATUS &&
                        <Button className="abort-button" color="danger" onClick={this.abortExercise} outline>
                            <i className="fa fa-trash"></i>&nbsp;{T.translate("Abort It")}
                        </Button>
                        }
                        <Alert color="info" isOpen={this.state.visibleShareUrlAlert} toggle={this.onDismissShareExercise}>
                            <p>
                                {T.translate("Exam Share Stream URL")}
                            </p>
                            <p className="paragraph-link">
                                <a target="_blank" href={this.props.currentExamShareUrl}>{this.props.currentExamShareUrl}</a>
                            </p>
                            <p>
                                <CopyToClipboard text={this.props.currentExamShareUrl}>
                                    <Button className="copy-clipboard-button"><i className="fa fa-copy"></i>&nbsp;{T.translate("Copy to Clipboard")}</Button>
                                </CopyToClipboard>
                            </p>
                        </Alert>
                        <div className="img-wrapper">
                            {streamStatus != STREAM_STATUS_LOADED &&
                            <img className={`rounded img-fluid mx-auto d-block`}
                                 src="/img/video_thumbnail_generic.png"
                                 id="stream_player_placeholder"
                                 name="stream_player_placeholder"
                            />
                            }
                            <img className={`rounded img-fluid mx-auto d-block img-player`}
                                 id="stream_player"
                                 name="stream_player"
                                 onError={this.onStreamLoadError}
                                 onLoad={this.onStreamLoad}
                            />
                            {streamStatus == STREAM_STATUS_LOADED && exerciseStatus == EXERCISE_INITIAL_STATUS &&
                            <div className="img-overlay1">
                                <button className="btn btn-lg btn-success btn-player"
                                        onClick={this.startExercise}>
                                    <i className="fa fa-play-circle"></i>
                                </button>
                            </div>
                            }
                            {exerciseStatus == EXERCISE_STARTING_STATUS &&
                            <div className="img-overlay3">
                                <span className="exercise-timer-ready" id="timer-ready" name="timer-ready">{this.renderTimerReady()}</span>
                            </div>
                            }
                            {exerciseStatus == EXERCISE_RUNNING_STATUS &&
                            <div className="img-overlay2">
                                <button className="btn btn-md btn-danger btn-player btn-recording"
                                        onClick={this.stopExercise}>
                                    <i className="fa fa-stop-circle"></i>
                                </button>
                                {this.renderTimer()}
                                <span className="device-serial">{this.props.currentDevice.serial}</span>
                            </div>
                            }
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = ({exercisePlayerState, loggedUserState}) => ({
    currentExercise: exercisePlayerState.currentExercise,
    currentRecordingJob: exercisePlayerState.currentRecordingJob,
    timer: exercisePlayerState.timer,
    exerciseStatus: exercisePlayerState.exerciseStatus,
    streamStatus: exercisePlayerState.streamStatus,
    backgroundProcessStreamingStatus: exercisePlayerState.backgroundProcessStreamingStatus,
    backgroundProcessCaptureStatus: exercisePlayerState.backgroundProcessCaptureStatus,
    currentExamShareUrl: exercisePlayerState.currentExamShareUrl,
    currentDevice: loggedUserState.currentDevice
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
        pingRecordingJob,
        generateShareExamUrl,
    }
)(ExercisePlayer);