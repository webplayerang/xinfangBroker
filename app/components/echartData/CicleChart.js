import React, { PureComponent } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import PercentageCircle from 'react-native-percentage-circle';

export default class CicleChart extends PureComponent {
  render() {
    const { title, option } = this.props;
    return (
      <View style={styles.container}>
        <PercentageCircle radius={100} borderWidth={15} percent={option.value} color={'#62cdff'}>
          {
            option.title.map((ele, index) => (<Text key={index} style={ele.textStyle}>{ele.text}<Text style={ele.unitStyle}>{ele.unit}</Text></Text>))
          }
        </PercentageCircle>
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
  container: {
    alignItems: 'center',
    paddingTop: 35,
  },
  leftTitle: {
    position: 'absolute',
    left: 40,
    top: 110,
    zIndex: 999,
  },
  rightTitle: {
    position: 'absolute',
    right: 40,
    top: 110,
    zIndex: 999,
  },
  rowText: {
    width: 15,
    color: '#7e7e7e',
  },
});
