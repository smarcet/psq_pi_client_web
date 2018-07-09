import React, {Component} from 'react';

class DeviceVerification extends Component
{
    componentDidMount(){
        this.props.doVerification();
    }

    render(){
        let {currentDevice} = this.props;
        if(currentDevice == null){
            return (
                <div>
                    <p>Performing Device Registration</p>
                    <p>Please Wait</p>
                </div>
            );
        }
        return (
            <div>
                <p>Device Registered</p>
                <p>SERIAL <b>{currentDevice.serial}</b></p>
                <p>MAC ADDRESS <b>{currentDevice.mac_address}</b></p>
                <p>Waiting for Admin Verification ...</p>
            </div>
        )
    }
}

export default DeviceVerification;