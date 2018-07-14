import React, {Component} from 'react';

export const STREAM_STATUS_OK = 'STREAM_STATUS_OK';
export const STREAM_STATUS_ERROR = 'STREAM_STATUS_ERROR';
const STATUS_CHECKER_INTERVAL_MS = 1000;

export class StreamStatusChecker extends Component
{
    constructor(props){
        super(props);
        this.state = {
        }
        this.onStreamLoad = this.onStreamLoad.bind(this);
        this.onStreamError = this.onStreamError.bind(this);
        this.streamStatusChecker = this.streamStatusChecker.bind(this);
    }

    componentDidMount(){
        this.setStatusChecker();
    }

    componentWillUnmount(){
     }

    setStatusChecker(interval = STATUS_CHECKER_INTERVAL_MS){
        console.log('StreamStatusChecker.setStatusChecker')
        window.setTimeout(this.streamStatusChecker, interval);
    }

    streamStatusChecker(){
        console.log("StreamStatusChecker.streamStatusChecker")
        let {streamUrl} = this.props
        let img = document.getElementById("stream-status-checker-img");
        let now = new Date();
        img.src = `${streamUrl}?_=${now.getTime()}`;
    }

    onStreamLoad(event){
        console.log('StreamStatusChecker.onStreamLoad');
        this.props.onStreamStateChange(STREAM_STATUS_OK);
        this.setStatusChecker();
    }

    onStreamError(event){
        console.log('StreamStatusChecker.onStreamError');
        this.props.onStreamStateChange(STREAM_STATUS_ERROR);
        this.setStatusChecker(STATUS_CHECKER_INTERVAL_MS * 2);
    }

    render () {
        let {streamUrl} = this.props;
        return (
            <img className="d-none"
                 id="stream-status-checker-img"
                 name="stream-status-checker-img"
                 src={streamUrl}
                 onLoad={this.onStreamLoad} onError={this.onStreamError}
            />
        )
    }
}