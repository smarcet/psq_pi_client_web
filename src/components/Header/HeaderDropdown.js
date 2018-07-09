import React, {Component} from 'react';
import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Dropdown
} from 'reactstrap';
import { NavLink } from 'react-router-dom'
import {STUDENT, SUPERVISOR, TEACHER} from "../../constants";
import T from "i18n-react/dist/i18n-react";

class HeaderDropdown extends Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  getUserDetail(){
      let { currentUser } = this.props;
      let detail = '';
      if(currentUser.first_name != '' && currentUser.last_name != '' )
          detail = `${currentUser.first_name }, ${currentUser.last_name}`;
      else
          detail = currentUser.email;

      switch (currentUser.role){
          case SUPERVISOR:
            detail += ` (${T.translate("Supervisor")})`;
          break;
          case TEACHER:
              detail += ` (${T.translate("Teacher")})`;
              break;
          case STUDENT:
              detail += ` (${T.translate("Student")})`;
              break;
      }
      return detail;
  }

  getRoutePartByUser(){
      let { currentUser } = this.props;
      switch (currentUser.role){
          case SUPERVISOR:
              return 'super-admin';
              break;
          case TEACHER:
              return 'admin';
              break;
          case STUDENT:
              return 'user';
              break;
      }
  }

  dropAccnt() {
      let userType = this.getRoutePartByUser();
      let settingsRoute = `/auth/${userType}/settings`;
      return (
      <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle nav>
            <span className="header-dropdown-user-info">Welcome {this.getUserDetail()}</span>
            <img src={this.props.currentUser.pic_url != '' ? this.props.currentUser.pic_url : '/img/generic-avatar-icon.png'} className="img-avatar" alt={this.props.currentUser.email}/>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem><i className="fa fa-lock"></i><NavLink to='/auth/logout'>Logout</NavLink></DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  render() {
    const {...attributes} = this.props;
    return (
      this.dropAccnt()
    );
  }
}

export default HeaderDropdown;
