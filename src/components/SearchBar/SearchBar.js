import React, {Component} from 'react';
import {
    Row,
    Col,
    Input,
    Button,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";
import './SearchBar.scss';

class SearchBar extends Component {

    constructor(props) {
        super(props);
        this.skipToggle = false;
        this.state = {
            isOpenDropDown: false,
            currentSelectedItem: null,
        };
        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.onSelectedItem = this.onSelectedItem.bind(this);
        this.onChangeSearchInput = this.onChangeSearchInput.bind(this);
        this.onClickPrimaryAction = this.onClickPrimaryAction.bind(this);
    }

    toggleDropDown() {
        if(this.skipToggle){
            this.skipToggle = false;
            return;
        }
        if(this.props.currentItems != null || this.props.currentItems.length == 0){

            return;
        }
        this.setState({ ...this.state,
            isOpenDropDown: !this.state.isOpenDropDown
        });
    }

    onClickPrimaryAction(event){
        event.preventDefault();
        if(this.state.currentSelectedItem == null){
            swal(
                T.translate("Error"),
                T.translate("Must select first an item!"),
                "error"
            );
            return;
        }
        this.props.onClickPrimaryAction(this.state.currentSelectedItem);
        this.setState({ ...this.state,
            currentSelectedItem: null,
            isOpenDropDown: false,
        });
        let input = document.getElementById(`search_term_${this.props.searchId}`);
        if(input == null) return;
        input.value = '';
    }

    onSelectedItem(item){
        let input =  document.getElementById(`search_term_${this.props.searchId}`);
        if(input == null) return;
        input.value = this.props.getDisplayName(item);
        this.skipToggle = true;
        this.setState({ ...this.state,
            currentSelectedItem: item,
            isOpenDropDown: false,
        });
    }

    onChangeSearchInput(event){

        let { value } = event.target;
        let isOpenDropDown = false;
        this.props.handleChangeSearchTerm(value);
        if(this.props.currentItems != null && this.props.currentItems.length > 0){
            isOpenDropDown = true;
        }
        this.setState({ ...this.state,
            currentSelectedDevice: null,
            isOpenDropDown: isOpenDropDown,
        });
    }

    render(){
        let { currentItems,
            getDisplayName,
            searchPlaceHolder,
            primaryActionClass,
            primaryActionName,
            useSecondaryAction,
            secondaryActionClass,
            secondaryActionName,
            onClickSecondaryAction,
            searchId } = this.props;
        return(
            <Row className="search-container">
                <Col xs="12" md="4">
                    <ButtonDropdown className="dropdown-add" isOpen={this.state.isOpenDropDown} toggle={() => {
                        this.toggleDropDown();}}>
                        <DropdownToggle>
                            <Input type="text" onChange={this.onChangeSearchInput} id={`search_term_${searchId}`} name={`search_term_${searchId}`} placeholder={searchPlaceHolder}/>
                        </DropdownToggle>
                        <DropdownMenu right>
                            { currentItems.map((item, i) => {

                                return (
                                    <DropdownItem key={item.id} onClick={ () => this.onSelectedItem(item)}>{getDisplayName(item)}</DropdownItem>
                                );
                            })}
                        </DropdownMenu>
                    </ButtonDropdown>
                </Col>
                <Col xs="12" md="3">
                    <Button onClick={this.onClickPrimaryAction} color="primary" className={primaryActionClass}><i className="fa fa-link"></i>{'\u00A0'} {primaryActionName}</Button>
                </Col>
                <Col xs="12" sm="4" lg="3">
                    {   useSecondaryAction &&
                        <Button onClick={onClickSecondaryAction} className={secondaryActionClass} color="primary">
                            <i className="fa fa-plus-circle"></i>{'\u00A0'} {secondaryActionName}
                        </Button>
                    }
                </Col>
            </Row>
        );
    }
}

export default SearchBar;