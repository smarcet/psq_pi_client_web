import React, {Component} from 'react';
import T from 'i18n-react';

class DeviceVerification extends Component
{
    componentDidMount(){
        this.props.doVerification();
    }

    render(){
        let {currentDevice} = this.props;
        if(currentDevice == null){
            return (
                <div className="animated fadeIn device-registration-container">
                    <p>{T.translate("Performing Device Registration")}</p>
                    <p>{T.translate("lease Wait...")}</p>
                </div>
            );
        }
        return (
            <div className="animated fadeIn device-registration-container">
                <p>{T.translate("Device Registered")}</p>
                <p>{T.translate("SERIAL")}&nbsp;<b>{currentDevice.serial}</b></p>
                <p>{T.translate("MAC ADDRESS")}&nbsp;<b>{currentDevice.mac_address}</b></p>
                <p>{T.translate("Waiting for Admin Verification ...")}</p>
            </div>
        )
    }
}

export default DeviceVerification;