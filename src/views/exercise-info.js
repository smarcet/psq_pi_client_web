import React, {Component} from 'react';
import {
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap';
import swal from "sweetalert2";
import classnames from 'classnames';
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

    constructor(props) {
        super(props);
        this.toggleTab = this.toggleTab.bind(this);
        this.state = {
            activeTab: '1',
        };
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                ...this.state,
                activeTab: tab
            });
        }
    }

    render(){
        let {currentExercise} = this.props;
        if(currentExercise == null) return null;
        let {allowed_tutorials} = currentExercise;
        return(
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" md="12" className="mb-4">
                        <Nav tabs>
                            <NavItem>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '1'})}
                                    onClick={() => { this.toggleTab('1');}}>
                                    <i className="fa fa-info-circle"></i>
                                    <span className={this.state.activeTab === '1' ? "" : "d-none"}> {T.translate("Exercise Info")} </span>{'\u00A0'}
                                </NavLink>
                            </NavItem>
                            { allowed_tutorials.length > 0  &&
                                <NavItem>
                                    <NavLink
                                        className={classnames({active: this.state.activeTab === '2'})}
                                        onClick={() => { this.toggleTab('2');}}>
                                        <i className="fa fa-video-camera"></i>
                                        <span className={this.state.activeTab === '2' ? "" : "d-none"}> {T.translate("Tutorials")} </span>{'\u00A0'}
                                    </NavLink>
                                </NavItem>
                             }
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="1">
                                <Row>
                                    <Col  xs="12" md="12" >
                                        <Row>
                                            <Col xs="12" md="12" >
                                                <h1>{currentExercise.title}</h1>
                                                <hr/>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col  xs="12" md="12" >
                                                <p>
                                                    {currentExercise.abstract}
                                                </p>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </TabPane>
                            { allowed_tutorials.length > 0 &&
                            <TabPane tabId="2">
                                {
                                    allowed_tutorials.map((tutorial, idx) => {
                                        let {videos} = tutorial;
                                        return (
                                            <Row key={idx}>
                                                <Col xs="12" md="12">
                                                    <Row>
                                                        <Col xs="12" md="12">
                                                            <h1>{tutorial.title}</h1>
                                                            <hr/>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs="12" md="12">
                                                            <p>
                                                                {tutorial.abstract}
                                                            </p>
                                                        </Col>
                                                    </Row>
                                                    {videos.length > 0 &&
                                                    <Row>
                                                        <Col xs="12" md="12">
                                                            <video className="rounded img-fluid mx-auto d-block"
                                                                   controls>
                                                                {videos.map((video, idx) =>
                                                                    <source src={video.video_url} key={idx}
                                                                            type={video.type}></source>
                                                                )}
                                                            </video>
                                                        </Col>
                                                    </Row>
                                                    }
                                                </Col>
                                            </Row>
                                        )
                                    })
                                }
                            </TabPane>
                            }
                        </TabContent>
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