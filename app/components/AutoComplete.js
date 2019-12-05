import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

class Autocomplete extends PureComponent {
  static propTypes = {
    data: PropTypes.array,
    /**
     * Set to `true` to hide the suggestion list.
     */
    hideResults: PropTypes.bool,
    /*
     * These styles will be applied to the container which surrounds
     * the textInput component.
     */
    keyboardShouldPersistTaps: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.boolean,
    ]),
    /*
     * These styles will be applied to the container which surrounds
     * the result list.
     */
    onShowResults: PropTypes.func,
    /**
     * method for intercepting swipe on ListView. Used for ScrollView support on Android
     */
    // onStartShouldSetResponderCapture: PropTypes.func,
    /**
     * `renderItem` will be called to render the data objects
     * which will be displayed in the result view below the
     * text input.
     */
    renderItem: PropTypes.func,
    /**
     * `renderSeparator` will be called to render the list separators
     * which will be displayed between the list elements in the result view
     * below the text input.
     */
    renderSeparator: PropTypes.func,
    /**
     * renders custom TextInput. All props passed to this function.
     */
    renderTextInput: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    defaultValue: '',
    keyboardShouldPersistTaps: 'always',
    onStartShouldSetResponderCapture: () => false,
    renderItem: (rowData) => <Text>{rowData}</Text>,
    renderSeparator: null,
    renderTextInput: (props) => <TextInput {...props} />,
  };

  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      isActivityIndicator: '',
      errSource: false,
      defaultErrSource: false,
    };
    this.resultList = null;
  }

  componentWillReceiveProps ({ data, isActivityIndicator, errSource, defaultErrSource }) {
    const dataSource = data;
    this.setState({ dataSource, isActivityIndicator, errSource, defaultErrSource });
  }

  /**
   * Proxy `blur()` to autocomplete's text input.
   */
  blur () {
    const { textInput } = this;
    textInput && textInput.blur();
  }

  /**
   * Proxy `focus()` to autocomplete's text input.
   */
  focus () {
    const { textInput } = this;
    textInput && textInput.focus();
  }

  renderResultList () {
    const { dataSource } = this.state;
    const { listStyle, renderItem, renderSeparator, keyboardShouldPersistTaps } = this.props;
    const length = dataSource.length;
    return (
      <FlatList
        keyboardShouldPersistTaps="always"
        ref={(resultList) => { this.resultList = resultList; }}
        style={[styles.list, listStyle]}
        initialListSize={4}
        initialNumToPender={length}
        maxToRenderPerBatch={length}
        data={dataSource}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  }

  renderTextInput () {
    const { onEndEditing, renderTextInput, style } = this.props;
    const props = {
      style: [styles.input, style],
      ref: (ref) => { this.textInput = ref; },
      onEndEditing: (e) => onEndEditing && onEndEditing(e),
      ...this.props,
    };

    return renderTextInput(props);
  }

  render () {
    const { dataSource } = this.state;
    const {
      containerStyle,
      hideResults,
      inputContainerStyle,
      listContainerStyle,
      onShowResults,
      onStartShouldSetResponderCapture,
    } = this.props;
    const showResults = dataSource.length > 0;

    // Notify listener if the suggestion will be shown.
    onShowResults && onShowResults(showResults);

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.inputContainer, inputContainerStyle]}>
          {this.renderTextInput()}
        </View>
        {
          !hideResults && (
            <View
              style={listContainerStyle}
              onStartShouldSetResponderCapture={onStartShouldSetResponderCapture}
            >
              {/*  展示搜索不到数据的文本提示 */}
              {
                this.state.errSource &&
                <View style={{ zIndex: 999, paddingTop: 20, backgroundColor: '#fff' }}>
                  <Text style={{ alignSelf: 'center' }}>
                    找不到相关信息，请换个内容试试
                  </Text>
                </View>
              }

              {/*  defaultSearch时 展示搜索不到数据的文本提示 */}
              {
                this.state.defaultErrSource &&
                <View style={{ zIndex: 999, paddingTop: 20, backgroundColor: '#fff' }}>
                  <Text style={{ alignSelf: 'center' }}>
                    您没有楼盘可以看
                  </Text>
                </View>
              }

              {/*  展示搜索菊花或者列表 */}
              {this.state.isActivityIndicator ?
                <View style={styles.ActivityIndicatorContainer}>
                  <View style={styles.ActivityIndicatorMain}>
                    <ActivityIndicator
                      color="white"
                      size="small"
                    />
                    <View style={{ marginLeft: 5 }}>
                      <Text style={{ color: '#3a3a3a' }}>搜索中</Text>
                    </View>
                  </View>
                </View>
                :
                this.renderResultList()
              }

              {
                // showResults && this.renderResultList()
              }
            </View>
          )
        }
      </View>
    );
  }
}
const border = {
  borderColor: '#b9b9b9',
  borderRadius: 1,
  borderWidth: StyleSheet.hairlineWidth,
};

const androidStyles = {
  container: {
    flex: 1,
  },
  inputContainer: {
    ...border,
    marginBottom: 0,
  },
  list: {
    ...border,
    backgroundColor: 'white',
    borderTopWidth: 0,
    margin: 10,
    marginTop: 0,
  },
};

const iosStyles = {
  container: {
    zIndex: 1,
  },
  inputContainer: {
    ...border,
  },
  input: {
    backgroundColor: 'white',
    height: 40,
    paddingLeft: 3,
  },
  list: {
    ...border,
    backgroundColor: 'white',
    borderTopWidth: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
    height: 40,
    paddingLeft: 3,
  },
  ...Platform.select({
    android: { ...androidStyles },
    ios: { ...iosStyles },
  }),
  ActivityIndicatorContainer: {
    backgroundColor: '#999',
    opacity: 0.4,
    height: Dimensions.get('window').height,
  },
  ActivityIndicatorMain: {
    flexDirection: 'row',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Autocomplete;
