import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
} from 'react-native';


export default class OtherReasonInput extends PureComponent {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      otherReason: '',
      visible: false,
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {

  }

  getValue() {
    return this.state.otherReason;
  }

  toggleVisible(isVisible) {
    this.setState({
      visible: isVisible,
    });
  }

  render() {
    if (!this.state.visible) {
      return null;
    }
    return (
      <View style={styles.container}>

        <TextInput
          style={[styles.formInput]}
          value={this.state.otherReason}
          placeholder="请输入驳回原因"
          autoFocus
          multiline
          maxLength={200}
          placeholderTextColor="#a8a8a8"
          underlineColorAndroid="transparent"
          onChangeText={(text) => {
            if (text.trim() !== '') {
              this.setState({ otherReason: text.trim() });
            }
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    marginTop: 10,
    borderColor: '#e7e8ea',
    borderWidth: StyleSheet.hairlineWidth,
  },
  formInput: {
    height: 100,
    paddingHorizontal: 10,
    fontSize: 14,
    padding: 0,
    color: '#3a3a3a',
    textAlignVertical: 'top',
  },
});
