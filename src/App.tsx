import { Animated, Button, ProgressBar, View } from '@sproutch/ui'
import { DownloadState } from 'cordova-plugin-mapbox'
import React, { useCallback, useRef, useState } from 'react'
import { actionContainer, button, progressBar } from './App.style'
import AppBar from './components/AppBar'
import BottomSheet from './components/BottomSheet'
import Map from './components/Map'

type BottomSheetID =
| "mapActions"
| "featureActions"
| "offlineActions"
| "cameraActions"
| "utils"

export default function() {
  const [container, setContainer] = useState<HTMLDivElement>()
  const [overlayElements, setOverlayElements] = useState<Animated.View[]>([])
  const [bottomSheetID, setBottomSheetID] = useState<BottomSheetID | undefined>()
  const [isMapDisplayed, setIsMapDisplayed] = useState<boolean>(false)
  const [download, setDownloadState] = useState<{ state: DownloadState, isPaused: boolean} | undefined>()
  const downloadProgress = 100.0 * download?.state.completedResourceCount / download?.state.requiredResourceCount
  const map = useRef<Map>()
  const setRef = useCallback((view: HTMLDivElement) => setContainer(view), [])

  function toggleBottomSheet(
    id: BottomSheetID | undefined,
  ) {
    //if (bottomSheetID === undefined) {
      setBottomSheetID(id)
    //} else {
      //setBottomSheetID(undefined)
    //}
  }

  function updateOverlayElements(isOpen: boolean, view: Animated.View) {
    if (isOpen) {
      setOverlayElements([view])
    } else {
      setOverlayElements([])
    }
  }

  return (
    <View style={{flex: 1}}>
      <AppBar
        title="Cordova Mapbox demo"
      />
      <View style={{
        flexDirection:"row",
        flexWrap:"wrap"
      }}>
        <Button style={{root: button}} onPress={() => toggleBottomSheet('mapActions')} label="Map actions" />
        <Button style={{root: button}} onPress={() => toggleBottomSheet('featureActions')} label="Marker actions" />
        <Button style={{root: button}} onPress={() => toggleBottomSheet('offlineActions')} label="Offline actions" />
        <Button style={{root: button}} onPress={() => toggleBottomSheet('cameraActions')} label="Camera actions" />
        <Button style={{root: button}} onPress={() => toggleBottomSheet('utils')} label="Utils" />
      </View>
      <View style={progressBar}>
        {!download?.state.isComplete && <ProgressBar progress={downloadProgress}/>}
      </View>
      <BottomSheet
        onAnimationEnd={updateOverlayElements}
        isOpen={bottomSheetID === 'mapActions'}
      >
        <View style={actionContainer}>
            <Button style={{root: button}} label="Show" onPress={() => {
              setIsMapDisplayed(true);
            }}/>
            <Button style={{root: button}} label="Hide" onPress={() => {
              setIsMapDisplayed(false);
            }}/>
            <Button style={{root: button}} label="Set debug" onPress={() => {
              map.current?.toggleDebug();
            }}/>
            <Button style={{root: button}} label="Close" onPress={() => {
              toggleBottomSheet('mapActions');
            }}/>
        </View>
      </BottomSheet>
      <BottomSheet
        onAnimationEnd={updateOverlayElements}
        isOpen={bottomSheetID === 'featureActions'}
      >
        <View style={actionContainer}>
            <Button style={{root: button}} label="Add marker" onPress={() => {
              map.current?.addPOI()
            }}/>
            <Button style={{root: button}} label="Start move animation" onPress={() => {
              map.current?.startAnimation()
            }}/>
            <Button style={{root: button}} label="Stop move animation" onPress={() => {
              map.current?.stopAnimation()
            }}/>
            <Button style={{root: button}} label="Close" onPress={() => {
              toggleBottomSheet('featureActions');
            }}/>
        </View>
      </BottomSheet>

      <BottomSheet
        onAnimationEnd={updateOverlayElements}
        isOpen={bottomSheetID === 'utils'}
      >
        <View style={actionContainer}>
            <Button style={{root: button}} label="Screen to coords" onPress={() => {
              map.current?.screen2Coords({'x': window.innerWidth/2,'y': window.innerHeight/2})
                .then(alert)
            }}/>
            <Button style={{root: button}} label="Coords to screen" onPress={() => {
              map.current?.coords2Screen({'lat': 52.3732160,'lng': 4.8941680})
            }}/>
            <Button style={{root: button}} label="Get bounds" onPress={() => {
              map.current?.getBounds().then(alert);
            }}/>
            <Button style={{root: button}} label="Get camera position" onPress={() => {
              map.current?.getCameraPosition().then(alert);
            }}/>
            <Button style={{root: button}} label="Close" onPress={() => {
              toggleBottomSheet('utils');
            }}/>
        </View>
      </BottomSheet>
      <BottomSheet
        onAnimationEnd={updateOverlayElements}
        isOpen={bottomSheetID === 'offlineActions'}
      >
        <View style={actionContainer}>
          <Button style={{root: button}} label="Get offlines region names" onPress={() => {
              map.current?.getOfflineRegionList()
                .then(list => alert(list.join(', ')))
            }}/>
          <Button style={{root: button}} label="Download current region" onPress={() => {
            map.current?.downloadArea(function(state) {
              if (!download?.isPaused) {
                setDownloadState({isPaused: false, state})
              }
            })
          }}/>
          <Button
            style={{root: button}}
            label={
              download?.isPaused
                ? "Resume download"
                : "Pause download"
            }
            onPress={() => {
              download?.isPaused
                ? map.current?.resumeDownload(function(){
                  setDownloadState({isPaused: false, state: download.state})
                })
                : map.current?.pauseDownload(function(){
                  setDownloadState({isPaused: true, state: download.state})
                })
            }}
            isDisabled={download === undefined}
          />
          
          <Button
            style={{root: button}}
            label="Delete offline map"
            isDisabled={download === undefined}
            onPress={() => {
              map.current?.deleteOffline(function() {
                setDownloadState(undefined)
              })
            }}
          />
          <Button style={{root: button}} label="Close" onPress={() => {toggleBottomSheet('offlineActions');}}/>
        </View>
      </BottomSheet>
      <BottomSheet
        onAnimationEnd={updateOverlayElements}
        isOpen={bottomSheetID === "cameraActions"}
      >
        <View style={actionContainer}>
          <Button style={{root: button}} label="Zoom in" onPress={map.current?.zoomIn}/>
          <Button style={{root: button}} label="Zoom out" onPress={map.current?.zoomOut}/>
          <Button style={{root: button}} label="Animate zoom" onPress={map.current?.zoomTo}/>
          <Button style={{root: button}} label="Get zoom" onPress={() => {
            map.current?.getZoom().then(alert)
          }}/>
          <Button style={{root: button}} label="Fly to" onPress={() => {
            map.current?.flyTo()
            toggleBottomSheet('cameraActions')
          }}/>
          <Button style={{root: button}} label="Center" onPress={() => {
            map.current?.setCenter()
          }}/>
          <Button style={{root: button}} label="Get center" onPress={() => {
            map.current?.getCenter().then(alert)
          }}/>
          <Button style={{root: button}} label="Pitch" onPress={() => {
            map.current?.setPitch()
          }}/>
          <Button style={{root: button}} label="Get pitch" onPress={() => {
            map.current?.getPitch().then(alert)
          }}/>
          <Button style={{root: button}} label="Close" onPress={() => {toggleBottomSheet('cameraActions')}}/>
        </View>
      </BottomSheet>
      <div
        ref={setRef}
        style={{flex: 1}}
      >
        <Map
          ref={m => map.current = m}
          isDisplayed={isMapDisplayed}
          transparentClassname=""
          container={container}
          overlayElements={overlayElements}
        />
      </div>
    </View>
  )
}