import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'

function initialize(): void {
    document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady(): void {
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);
    start()
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
}

function start() {
    ReactDOM.render(<App/>, document.getElementById('root'))
}

// If on desktop
if (((window as any).cordova) === undefined) {
    start()
} else {
    initialize()
}