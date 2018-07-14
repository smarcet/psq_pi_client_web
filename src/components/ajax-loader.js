import 'font-awesome/css/font-awesome.css';
import React from 'react';

export const AjaxLoader =  ({
                                show,
                                relative,
                                color,
                                size,
                                children,
                            }) => {

    let styles = {
        display : show ? 'block': 'none',
        width:'100%',
        height:'100%',
        position: relative ? 'absolute' : 'fixed',
        zIndex:10000000,
        margin:'auto',
        cursor: 'wait',
        backgroundColor: 'rgba(0,0,0,0.2)',
        top: 0,
        left: 0
    };

    let styleSpinner = {
        fontSize: size + 'px',
        color: 'black',
    };

    let styleSpinnerContainer = {
        width: '250px',
        height:'75px',
        textAlign: 'center',
        position: relative ? 'relative' : 'fixed',
        top: relative ? '50%' : '0',
        left: relative ? '' : '0',
        right:'0',
        bottom:'0',
        margin:'auto',
        zIndex:10,
        color:'#ffffff'
    };

    let styleBackground = {
        background: color,
        opacity:'0.8',
        width:'100%',
        height:'100%',
        position:'absolute',
        top:0
    };

    return (
        <div className="ajax-loader-container" style={styles}>
            <div style={styleSpinnerContainer}>
                <i className="fa fa-spinner fa-spin" style={styleSpinner}></i>
                <div>
                    {children}
                </div>
            </div>
            <div style={styleBackground} className="loader-background"></div>
        </div>
    );
};