import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import {Container} from 'reactstrap';
import Logout from '../components/logout';
import AvailableExercisesList from './available-exercises-list';
import ExercisePlayer from './exercise-player';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from '../components/Breadcrumb';

class MainLayout extends Component {
    render() {
        let { currentUser } = this.props;
        console.log(this.props.match.params);
        return (
            <div className="app">
                <Header currentUser={currentUser}/>
                <div className="app-body">
                    <main className="main">
                        <Breadcrumb/>
                        <Container fluid>
                            <Switch>
                                <Route exact path="/auth/exercises/:exercise_id/execute" component={ExercisePlayer}/>
                                <Route exact path="/auth/exercises/:exercise_id/info" component={ExercisePlayer}/>
                                <Route exact path="/auth/exercises" component={AvailableExercisesList}/>
                                <Route exact path="/auth/logout" component={Logout}/>
                                <Route path="/auth" render={props => {

                                    return (<Redirect
                                        exact
                                        to={{
                                            pathname: '/auth/exercises',
                                            state: {from: props.location}
                                        }}
                                    />)

                                }}/>
                            </Switch>
                        </Container>
                    </main>
                </div>
                <Footer/>
            </div>
        );
    }
}

export default MainLayout;