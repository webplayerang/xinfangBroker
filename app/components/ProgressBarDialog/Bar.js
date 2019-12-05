import React, {
  PureComponent,
} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';

class Bar extends PureComponent {
  static defaultProps = {
    style: styles,
    easing: Easing.inOut(Easing.ease),
    initialProgress: 0,
    progress: 0,
    backgroundStyle: '',
  }

  constructor(props) {
    super(props);
    this.progress = new Animated.Value(this.props.initialProgress || 0);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.progress >= 0 && this.props.progress !== nextProps.progress) {
      this.update(nextProps.progress);
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  update(progress) {
    Animated.spring(this.progress, {
      toValue: progress,
    }).start();
  }

  render() {
    return (
      <View style={[styles.background, this.props.backgroundStyle, this.props.style]}>
        <Animated.View style={[styles.fill, this.props.fillStyle, {
          width: this.progress.interpolate({
            inputRange: [0, 100],
            outputRange: [0 * this.props.style.width, 1 * this.props.style.width],
          }),
        }]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#bbbbbb',
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: 'rgba(0, 255, 0, 1)',
    height: 8,
  },
});

export default Bar;
