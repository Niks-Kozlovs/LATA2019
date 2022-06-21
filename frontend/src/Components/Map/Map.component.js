/* eslint-disable no-var */
import React, { Component } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import './Map.style.scss';
import 'leaflet/dist/leaflet.css';

class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            points: [],
            showStops: false,
            layerGroup: null,
            customMarkers: null,
            routes: [],
            startPoint: [56.93329535896783, 24.085367918014526],
            startPointEnd: [56.9395115996661, 24.091161489486698],
            endPointStart: [56.94578785273847, 24.11480784416199],
            endPointEnd: [56.94189307900047, 24.115912914276123],
            shown: false
        };
    }

    componentDidMount() {
        L.Map = L.Map.extend({
            openPopup: function(popup) {
                // this.closePopup(); 
                this._popup = popup;
                return this.addLayer(popup).fire('popupopen', {
                    popup: this._popup
                });
            }
        });

        this.map = L.map('map', {
            center: [56.94309358311792, 24.105205535888675],
            zoom: 13,
            layers: [
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution:
              '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                })
            ]
        });

        const layerGroup = L.layerGroup().addTo(this.map);
        const routingLayer = L.layerGroup().addTo(this.map);
        const customMarkers = L.layerGroup().addTo(this.map);

        this.map.on('click', (e) => {
            const { points } = this.state;
            if (!points.length) return;
            const { latlng } = e;
            const nearest = points.filter(({ lat, lng }) => {
                const point = L.latLng([lat, lng]);
                return (point.distanceTo(latlng) < 100);
            });

            if (!nearest.length) return;

            const fNearest = this.removeDuplicates(nearest, 'route');
            var text = 'Route: <br />';
            fNearest.forEach(({ route }) => {
                text += route;
                text += '<br />';
            });
            L.popup()
                .setLatLng(latlng)
                .setContent(`<p>${text}</p>`)
                .openOn(this.map);
        });

        this.setState({
            layerGroup,
            routingLayer,
            customMarkers
        })

        this.getData();
    }

    getData(){
        const url = 'http://localhost:8000/graphql';
        const query = JSON.stringify({
            query: `
            query {
              trips(first: 20) {
                data {
                  trip_headsign,
                  direction_id
                  route {
                    arrival_time
                    stops {
                      stop_lat
                      stop_lon
                      stop_name
                      stop_url
                    }
                  }
                }
              }
            }
    `
        });

        this.setLoading(true);
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: query
        })
            .then((res) => res.json())
            .then((res) => {
                const { data } = res;
                this.setState({ data })
                this.updateData();
                this.setLoading(false);
            });
    }

    clearRoutes() {
        const { routes: oldRoute } = this.state;

        if (oldRoute.length) {
            oldRoute.forEach(route => {
                this.map.removeControl(route);
            });
        }
    }

    updateData() {
        const { data: { trips: { data } }, showStops, layerGroup } = this.state;
        const routeWaypoints = data.reduce((acc, { route, trip_headsign, direction_id }) => {
            const waypoints = route.reduce((acc, { stops }) => {
                if (!stops[0]) return acc;
                const { stop_lat, stop_lon, stop_name } = stops[0];
                acc.push(L.latLng(stop_lat, stop_lon));
                if (showStops) {
                    L.circleMarker([stop_lat, stop_lon], {
                    radius: 5,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8,
                }).bindPopup(stop_name).addTo(layerGroup);
            }
                return acc;
            }, []);

            const info = { waypoints, trip_headsign, direction_id };
            acc.push(info);
            return acc;
        }, []).filter(({ waypoints }) => waypoints.length < 25);

        this.clearRoutes();

        routeWaypoints.forEach(({ waypoints, trip_headsign, direction_id }) => {
            // eslint-disable-next-line global-require
            const rColor = require('randomcolor');
            const color = rColor.randomColor();

            const route = L.Routing.control({
                waypoints,
                routeLine: (route) => {
                    const { coordinates } = route;

                    coordinates.forEach((coord) => {
                        // eslint-disable-next-line no-param-reassign
                        coord.route = trip_headsign;

                        this.setState(({ points }) => {
                            points.push(coord);

                            return { points };
                        });
                    });

                    const line = L.Routing.line(route,
                        {
                            styles: [{ color, opacity: 1, weight: (direction_id / 2), dashArray: '10,5,10'}]
                        });
                    return line;
                },
                options: { name: 'hello' },
                autoRoute: true,

                // eslint-disable-next-line max-len
                // eslint-disable-next-line new-cap
                router: new L.Routing.mapbox('pk.eyJ1Ijoic2xvcHB5bmljazMiLCJhIjoiY2sxd3Nxajc0MDB0dTNkcGM5OXhrbGdnZSJ9.hK3_6kZUGJ9QDzEYlzl3vw')
            }).addTo(this.map);

            this.setState(({routes}) => {
                routes.push(route);
                return routes;
            })
        });

        this.setLoading(false);
        // markers.clearLayers();
        // for (let i = 0; i < stops.length; i++) {
        //     const { stop_lon, stop_lat, stop_name } = stops[i];

        //     L.circleMarker([stop_lat, stop_lon], { readius: 20, ...circleStyle }).addTo(markers)
        //         .bindPopup(stop_name);
        // }
    }

    setLoading(loading) {
        this.setState({
            loading
        });
    }

    removeDuplicates(originalArray, prop) {
        var newArray = [];
        var lookupObject = {};

        for (var i in originalArray) {
            lookupObject[originalArray[i][prop]] = originalArray[i];
        }

        for (i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
        return newArray;
    }

    doStuff() {
        const { loading } = this.state;

        if (loading) return;
        this.updateData();
    }

    firstWaypoint() {
        this.setState({shown: true});
        const { startPoint, startPointEnd, endPointStart, endPointEnd, customMarkers } = this.state;

        var greenIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

        // L.marker(startPoint).bindPopup('Start').addTo(customMarkers);
        // L.marker(startPointEnd, {icon: enterIcon}).bindPopup('Enter').addTo(customMarkers);
        // L.marker(endPointStart, {icon: exitIcon}).addTo(customMarkers);
        // L.marker(endPointEnd, {icon: endIcon}).addTo(customMarkers);

        const waypoints = [startPoint ,startPointEnd];
        const route = L.Routing.control({
            waypoints,
            routeLine: (route) => {
                const line = L.Routing.line(route,
                    {
                        styles: [{ color: 'black', opacity: 1, weight: 5 }]
                    });
                return line;
            },
            autoRoute: true,

            // eslint-disable-next-line max-len
            // eslint-disable-next-line new-cap
            router: new L.Routing.mapbox('pk.eyJ1Ijoic2xvcHB5bmljazMiLCJhIjoiY2sxd3Nxajc0MDB0dTNkcGM5OXhrbGdnZSJ9.hK3_6kZUGJ9QDzEYlzl3vw')
        }).addTo(this.map);

        this.setState(({routes}) => {
            routes.push(route);
            return routes;
        })

        const endWaypoints = [endPointStart, endPointEnd];

        const route2 = L.Routing.control({
            waypoints: endWaypoints,
            routeLine: (route) => {
                const line = L.Routing.line(route,
                    {
                        styles: [{ color: 'black', opacity: 1, weight: 5 }]
                    });
                return line;
            },
            autoRoute: true,

            // eslint-disable-next-line max-len
            // eslint-disable-next-line new-cap
            router: new L.Routing.mapbox('pk.eyJ1Ijoic2xvcHB5bmljazMiLCJhIjoiY2sxd3Nxajc0MDB0dTNkcGM5OXhrbGdnZSJ9.hK3_6kZUGJ9QDzEYlzl3vw')
        }).addTo(this.map);

        this.setState(({routes}) => {
            routes.push(route2);
            return routes;
        })

        L.marker(endPointStart, {icon: greenIcon}).bindPopup('Exit transport').addTo(customMarkers);
        L.marker(startPointEnd,{icon: greenIcon}).bindPopup('Enter transport').addTo(customMarkers).openPopup();


    }

    render() {
        const { loading, shown } = this.state;
        return (
            <>
              <div id="map" />
              <p style={ { color: 'white' } }>{ loading ? 'Loading' : null }</p>
              <div className="buttons">
              <button onClick={ () => this.doStuff() }> Reset! </button>
              <button onClick={ () => this.firstWaypoint() }> Go to work! </button>
              <div id="block" className={ shown ? 'visible' : 'hidden'}>
                  <p>Speed: 1. tram</p>
                  <p>Comfort: 22. bus</p>
              </div>
              </div>
            </>
        );
    }
}

export default Map;
