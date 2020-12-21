import { Bounds, CameraPosition, Coords, DownloadState } from 'cordova-plugin-mapbox';
import { FeatureCollection, Geometry, Point } from 'geojson';
import React from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import { Animated } from 'reactxp';

type Props = {
    isClickable?: boolean
    isDisplayed?: boolean
    transparentClassname: string
    container?: HTMLDivElement
    overlayElements: Animated.View[]
}

type State = {
  parentIsMount: boolean
}

export default class Map extends React.Component<Props, State> {
  private features: GeoJSON.Feature<Point>[] = []
  private zoom: number
  private styleUrl: string

  constructor(props: Props) {
    super(props);
    this.styleUrl = 'mapbox://styles/vikti/ciqi9isrt002ve1njkb6la458';
    this.zoom = 10;
    this.state = {
      parentIsMount: false,
    };

    for (let i = 0; i < 30; i++) {
      this.features.push({
        id: i.toString(),
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-2 + Math.random(), 47 + Math.random()],
        },
        // Randomly set quest checker
        properties: {
          type: 'marker',
          image: Math.random() > 0.5
            ? 'quest_start-light'
            : 'next_objective-light',
        },
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      container,
      isClickable = true,
      isDisplayed: isMapDisplayed = true,
      overlayElements,
    } = this.props;
    if (!prevProps.isDisplayed && isMapDisplayed && container) {
      this.show();
    }
    if (prevProps.isDisplayed && !isMapDisplayed && container) {
      this.hide();
    }
    Mapbox.setClickable(isClickable ?? true);
    // Wait for material design ripple effect to end
    setTimeout(() => Mapbox.setContainer({
      domContainer: container,
      additionalDomElements: overlayElements.map((view) => ReactDOM.findDOMNode(view) as HTMLElement),
    }), 250);
  }

  componentWillUnmount() {
    Mapbox.destroy();
  }

  private isDebug = false

  public toggleDebug() {
    Mapbox.setDebug(!this.isDebug, () => {
      this.isDebug = !this.isDebug
    })
    
  }

  private getMarkerFromQueryResult(featureCollection: FeatureCollection<Geometry, {
    [name: string]: any;
  }>) {
    return featureCollection.features.find(function (feature) {
        return !!feature.properties && feature.properties.type && feature.properties.type === "marker"
    })
  }


  private show() {
    Mapbox.show({
      domContainer: this.props.container,
      additionalDomElements: this.props.overlayElements.map(view => findDOMNode(view) as HTMLElement),
      style: this.styleUrl,
      cameraPosition: {
        // Sets the center of the map to Maracanã
        target: {
          lng: -2.395446,
          lat: 47.929544,
        },
        zoom: this.zoom,
        bearing: 0, // Sets the orientation of the camera to look west
        tilt: 40, // // Sets the tilt of the camera to 30 degrees
      },
      selectedFeatureLayerId: 'selected-feature',
      selectedFeatureSourceId: 'selected-feature',
      selectableFeaturePropType: 'marker',
      hideAttribution: true, // default false
      hideLogo: true, // default false
    },
    () => {
      // Set the container background transparent to show the map
      const toMakeTransparent = document.getElementsByClassName(this.props.transparentClassname);
      Array.prototype.forEach.call(toMakeTransparent, (element: HTMLElement) => {
        element.style.backgroundColor = 'transparent';
      });

      for (let i = 0; i < 30; i++) {
          this.features.push({
              id: i.toString(),
              type: "Feature",
              geometry: {
                  type: "Point",
                  coordinates: [-2 + Math.random(), 47 + Math.random()]
              },
              // Randomly set quest checker
              properties: {
                  type: 'marker',
                  image: Math.random() > .5
                      ? "quest_start-light"
                      : "next_objective-light"
              }
          })
      }


      const questSource = {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: this.features,
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      }
      
      const pnjSource = {    
          type: "geojson",
          data: {
              type: "Feature",
              geometry: {
                  type: "Point",
                  coordinates: [-2.395446, 47.929544]
              }
          }
      }
      
      const selectedMarkerSource = {
          type: "geojson",
          data: {}
      }
      
      const questLayer = {
          id: "quests",
          type: "symbol",
          source: "quests",
          layout: {
              "icon-image": "{image}",
              "icon-allow-overlap": true,
              "icon-offset": [0, -32]
          }
      }
      
      const selectedMarker = {
          id: "selected-feature",
          type: "symbol",
          source: "selected-feature",
          layout: {
              "icon-image": "{image}",
              "icon-allow-overlap": true,
              "icon-offset": [0, -32]
          }
      }
      
      const pnjLayer = {
          id: "pnj",
          type: "symbol",
          source: "pnj",
      }

      Mapbox.addSource("pnj", pnjSource as any);
      Mapbox.addSource('quests', questSource as any);
      Mapbox.addImage("reinhart", {
          width: 128,
          height: 128,
          path: "www/reinhart.png"
      })

      Mapbox.addImage("quest_start-light", {
          width: 64,
          height: 64,
          path: "www/quest_start-light.png"
      })
      Mapbox.addImage("next_objective-light", {
          width: 64,
          height: 64,
          path: "www/next_objective-light.png"
      })
      Mapbox.addLayer(questLayer as any);

      Mapbox.addImage("clusterCircle", {
          width: 64,
          height: 64,
          path: "www/cluster_circle.png"
      })

      Mapbox.addLayer({
          id: 'clusters',
          type: 'symbol',
          source: 'quests',
          filter: ['has', 'point_count'],
          layout: {
              "icon-image": "clusterCircle",
              "icon-allow-overlap": true,
              "icon-size": [
                  'step',
                  ['get', 'point_count'],
                  .8,
                  5,
                  .7,
                  10,
                  1
              ]
          }
      })
      Mapbox.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'quests',
          filter: ['has', 'point_count'],
          layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': [
                  'step',
                  ['get', 'point_count'],
                  20,
                  5,
                  25,
                  10,
                  30
              ]
          },
          paint: {
              'text-color': '#fdd30c',
              'text-halo-blur': 4,
              'text-halo-color': 'rgba(255, 96, 0, 120)',
              'text-halo-width': .1
          }
      });
      Mapbox.addLayer(pnjLayer as any);
      Mapbox.setLayoutProperty("pnj", {"icon-image": "reinhart"})
    
      Mapbox.addSource("selected-feature", selectedMarkerSource as any);
      Mapbox.addLayer(selectedMarker as any)

      Mapbox.addMapClickCallback(r => {
        const marker = this.getMarkerFromQueryResult(r)
        if (marker) {
            alert(marker.id)
        }
      })

      // let's add callbacks for region changing
      //
      // - invoked when the map is about to moved (animated or not).
      Mapbox.addOnCameraWillChangeListener(() => {
        console.log('Camera will move');
      });
      // - invoked after the map has moved (animated or not).
      Mapbox.addOnCameraDidChangeListener(() => {
        console.log('Camera did move');
      });
    })
  }

  private hide() {
    Mapbox.hide();
  }

  private isAnimationRunning = false

  private newData: FeatureCollection<GeoJSON.Point>

  private tick() {
    window.requestAnimationFrame(() => {
      if (this.isAnimationRunning) {
        this.newData.features = this.newData.features
          .map((feature) => {
            const coordinates = [
              feature.geometry.coordinates[0] + 0.001,
              feature.geometry.coordinates[1],
            ];
            return ({
              id: feature.id,
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates,
              },
              properties: feature.properties,
            });
          });

        Mapbox.setGeoJson('quests', this.newData);
        this.tick();
      }
    });
  }

  public startAnimation() {
    this.newData = {
      type: 'FeatureCollection',
      features: this.features,
    };
    this.isAnimationRunning = true;
    this.tick();
  }

  public stopAnimation() {
    this.isAnimationRunning = false;
  }

  public addPOI() {
    Mapbox.setGeoJson('quests', {
      type: 'FeatureCollection',
      features: [
        ...this.features,
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-2 + Math.random(), 47 + Math.random()],
          },
          properties: {
            image: 'quest_start',
          },
        },
      ],
    });
  }

  public screen2Coords(point: {x: number, y: number}): Promise<Coords> {
    return new Promise<Coords>((resolve, reject) => {
      Mapbox.convertPoint({
        x: point.x,
        y: point.y,
      },
      resolve,
      reject);
    });
  }

  public coords2Screen(coords: Coords): Promise<{x: number, y: number}> {
    return new Promise<{x: number, y: number}>((resolve, reject) => {
      Mapbox.convertCoordinates(coords, resolve, reject);
    });
  }

  public getBounds(): Promise<Bounds> {
    return new Promise<Bounds>((resolve, reject) => {
      Mapbox.getBounds(resolve, reject);
    });
  }

  public getCameraPosition(): Promise<CameraPosition> {
    return new Promise<CameraPosition>((resolve, reject) => {
      Mapbox.getCameraPosition(resolve, reject);
    });
  }

  public getOfflineRegionList(): Promise<string[]> {
    return new Promise<string[]>((resolve) => {
      Mapbox.getOfflineRegionList(
        this.styleUrl,
        resolve,
      );
    });
  }

  public downloadArea(handleProgress: (s: DownloadState) => void) {
    Mapbox.getBounds(
      (bounds) => {
        Mapbox.downloadRegion(
          {
            regionName: 'current',
            bounds,
            minZoom: 4, // Zoom value when France fits the whole view.
            maxZoom: 6, // Just zoom enough to not eat the whole Mapbox monthly rate
          },
          handleProgress,
          (e) => {
            if (typeof e === 'object' && e.reason === 'REGION_EXISTS') {
              alert('A region with the same name already exists, please, delete the existing region first.');
            }
          },
        );
      },
      console.error,
    );
  }

  public pauseDownload(cb: () => void) {
    Mapbox.pauseDownload({ styleUrl: this.styleUrl }, cb);
  }

  public resumeDownload(cb: () => void) {
    Mapbox.resumeDownload({ styleUrl: this.styleUrl }, cb);
  }

  public deleteOffline(onDelete: () => void) {
    Mapbox.deleteOfflineRegion({ styleUrl: this.styleUrl }, onDelete);
  }

  public zoomIn = () => {
    Mapbox.setZoom(++this.zoom);
  }
  
  public zoomOut = () => {
    Mapbox.setZoom(--this.zoom);
  }
  
  public zoomTo = () => {
    Mapbox.zoomTo(5);
  }

  public getZoom(): Promise<number> {
    return new Promise<number>(function(resolve) {
      Mapbox.getZoom(resolve, console.error);
    })
}

  public flyTo() {
    Mapbox.flyTo({
      // Sets the center of the map to Maracanã
      target: {
        lng: -2.395446,
        lat: 47.929544,
      },
      zoom: 20, // Android, zoomLevel
      bearing: 270, // Sets the orientation of the camera to look west
      tilt: 40, // // Sets the tilt of the camera to 30 degrees
      duration: 4000, // in seconds
    });
  }

  public setCenter() {
    Mapbox.setCenter([-2.395446, 47.929544]); // [long, lat]
  }

  public getCenter(): Promise<Coords> {
    return new Promise<Coords>(function(resolve) {
      Mapbox.getCenter(
        resolve,
        console.error
      )
    })
  }

  public setPitch() {
    Mapbox.setPitch(45);
  }

  public getPitch(): Promise<number> {
    return new Promise<number>(function(resolve) {
      Mapbox.getPitch(
        resolve,
        console.error
      )
    })
  }

  public render() {
    return <></>;
  }
}