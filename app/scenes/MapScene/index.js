import React, { Component } from 'react';
import { Header, Title, Body, View, List, ListItem, Text, Left, Right, Icon, Button } from 'native-base';
import { DeviceEventEmitter, ScrollView } from 'react-native';

import MapView, { Marker, Callout } from 'react-native-maps';
import RNCallEvent from 'react-native-call-events';
import CallLogs from 'react-native-call-log';
import BackgroundTimer from 'react-native-background-timer';

export default class MapScene extends Component {

    constructor(props) {
        super(props);

        this.state = {
            region: {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            showMarker: false,
            getList: false,
            callList: [],
            title: "Hello world, I'm here :)",
        }
    }

    componentDidMount() {
        this.eventCallsHandler();
    }

    eventCallsHandler() {
        RNCallEvent.init(false, false);

        DeviceEventEmitter.addListener('callStatusUpdate', event => {

            if (event.state == "CALL_STATE_RINGING") {
                this.setState({getList: true});
            }

            if(event.state == 'CALL_STATE_IDLE' && this.state.getList) {

                BackgroundTimer.setTimeout(() => {
                    CallLogs.show((logs) => {
                        // parse logs into json format
                        const parsedLogs = JSON.parse(logs);

                        this.getCoordinates().then( (coords) => {
                            this.addMissedCall( parsedLogs[0].phoneNumber, coords);
                        });
                    });
                }, 500);
            }

        });
    }

    addMissedCall(number, coords) {

        let callList = this.state.callList.slice();
        let now = new Date();

        callList.push({
            number: number,
            date: now.toLocaleDateString() + ' ' +now.toLocaleTimeString(),
            coords: coords
        });

        this.setState({ callList });
    }

    getCoordinates() {

        var options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        return new Promise( (resolve, reject) => {
            navigator.geolocation.getCurrentPosition((pos) => {
                var crd = pos.coords;

                this.setState({
                    showMarker: true,
                    title: "Hello world, I'm here :)",
                    region: {
                        latitude: crd.latitude,
                        longitude: crd.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }
                });

                setTimeout( () => { console.log(this.state); }, 500 );

                resolve(pos.coords);

            }, (err) => {
                console.warn('ERR', err);
                reject();
            }, options);
        });

    }

    render() {

        let list = this.state.callList.map(elem => {
            return <ListItem key={ elem.date }>
                <Left>
                    <Text>{ elem.number }</Text>
                </Left>
                <Body>
                    <Text>{ elem.date }</Text>
                </Body>
                <Right>
                    <Button
                        transparent
                        onPress={ () => this.setState({
                            showMarker: true,
                            title: `you was here when number ${elem.number} tried to contact with you`,
                            region: {
                                latitude: elem.coords.latitude,
                                longitude: elem.coords.longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }
                        }) }
                    >
                        <Icon name='pin' style={{ color: '#ff0000' }} />
                    </Button>
                </Right>
            </ListItem>
        });

        let msg = <View>
            <Left>
                <Icon name='information-circle' style={{ color: '#1b88fb' }} />
            </Left>
            <Right>
                <Text style={{ color: '#1b88fb' }}>No missed calls</Text>
            </Right>
        </View>;

        return (
            <View>
                <Header>
                    <Body>
                        <Title>Calls logger</Title>
                    </Body>
                </Header>
                <View>
                    <ScrollView style={{ height: 300 }}>
                    { list.length === 0 && msg }
                        <List>
                            { list }
                        </List>
                    </ScrollView>

                    <MapView
                        style={{ width: 415, height: 300 }}
                        region={ this.state.region }
                        liteMode={ true }
                    >
                        {this.state.showMarker && <Marker
                            title={ this.state.title }
                            pinColor="#1b88fb"
                            flat={ true }
                            coordinate={{
                                latitude: this.state.region.latitude,
                                longitude: this.state.region.longitude
                            }}
                        />}
                    </MapView>
                </View>
            </View>
        );
    }
}


