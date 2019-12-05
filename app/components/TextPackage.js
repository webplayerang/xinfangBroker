import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import PropTypes from 'prop-types';


const OwnTextInput = (props) => (
  <View style={{ marginRight: 5 }}>
    {
      props.val ?
        <Text style={styles.TextStyVal}>{props.val}</Text>
        :
        <Text style={styles.TextStyleplaceText}>{props.placeText}</Text>
    }
  </View >
);
// 声明类型
OwnTextInput.propTypes = {
  placeText: PropTypes.string.isRequired,
  val: PropTypes.string,
};
// 设置默认值
OwnTextInput.defaultProps = {
  val: '',
};

const styles = StyleSheet.create({
  TextStyleplaceText: {
    fontSize: 14,
    color: '#a7a7a7',
  },
  TextStyVal: {
    fontSize: 14,
    color: '#3a3a3a',
  },
});
export default OwnTextInput;
