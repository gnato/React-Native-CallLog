import React, { Component } from 'react';
import { View, Text } from 'react-native';

import MapScene from './scenes/MapScene';

export default class App extends Component {
    render() {
        return (
            <View>
                <MapScene />
            </View>
        );
    }
}
