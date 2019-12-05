/**
 * xinfangBroker
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';
import FontMap from './FontMap';

const fontReference = 'iconfont';

class Icon extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    size: PropTypes.number,
    color: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    name: '',
    size: 30,
    color: '#000',
    style: null,
  };

  render() {
    const { name, size, color, style, ...props } = this.props;
    const glyph = FontMap(name);
    const styleDefaults = {
      fontSize: size,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color,
    };
    props.style = [styleDefaults, style];
    props.ref = (component) => { this.root = component; };
    styleDefaults.fontFamily = fontReference;
    return (<Text {...props}>{glyph}</Text>);
  }
}

export default Icon;
