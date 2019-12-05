import React, { PureComponent } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Echarts from 'native-echarts';
import { screen } from '../../utils/index';

export default class CircleChart extends PureComponent {
  render() {
    const title = this.props.title;
    return (
      <View style={styles.container}>
        <Echarts
          option={this.props.option}
          height={275}
          width={screen.width}
        />
        {title.length > 0 && title[0] ? (<View style={styles.leftTitle}>
          <Text style={styles.rowText}>{title[0]}</Text>
        </View>) : null}
        {title.length > 0 && title[2] ? (<View style={styles.rightTitle}>
          <Text style={styles.rowText}>{title[2]}</Text>
        </View>) : null}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  leftTitle: {
    position: 'absolute',
    left: 50,
    top: 110,
    zIndex: 999,
  },
  rightTitle: {
    position: 'absolute',
    left: screen.width - 60,
    top: 110,
    zIndex: 999,
  },
  rowText: {
    width: 15,
    color: '#7e7e7e',
  },
});
