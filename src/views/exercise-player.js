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
        this.onClickShare = this.onClickShare.bind(this);
        this.onDismissShareExercise = this.onDismissShareExercise.bind(this);
        this.abortExercise = this.abortExercise.bind(this);
        this.runBackgroundJobs = this.runBackgroundJobs.bind(this);
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

                let {interval, backgroundInterval} = this.state;
                window.clearInterval(interval);
                window.clearInterval(backgroundInterval);

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


                let {interval, backgroundInterval} = this.state;
                window.clearInterval(interval);
                window.clearInterval(backgroundInterval);

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
            backgroundProcessStreamingStatus,
            backgroundProcessCaptureStatus
        } = this.props;

        if(currentExercise == null) return null;

        if(exerciseStatus == EXERCISE_TIMEOUT_STATUS){
            swal({
                title: T.translate('Exercise Max. Length reached!'),
                text: T.translate('Exercise will be aborted because you reached the max. allowed length'),
                type: 'error'
            });
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

                    let {interval, backgroundInterval} = this.state;
                    window.clearInterval(interval);
                    window.clearInterval(backgroundInterval);

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

            let {interval, backgroundInterval} = this.state;
            window.clearInterval(interval);
            window.clearInterval(backgroundInterval);

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