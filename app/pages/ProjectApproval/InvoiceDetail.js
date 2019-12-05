import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  InteractionManager,
  ScrollView,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-easy-toast';
// 友盟统计
import axiosErp from '../../common/AxiosInstance';

import DialogBox from '../../components/react-native-dialogbox';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';

import InvoiceItem from './InvoiceItem';
import BaseStyles from '../../style/BaseStyles';

// 认筹详情页面

export default class InvoiceDetail extends PureComponent {
  // static propTypes = {
  //   navigation: PropTypes.object,
  // }

  // static defaultProps = {
  //   navigation: {},
  // }
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '增值税专用发票',
      headerLeft: (<GoBack navigation={navigation} />),
      headerRight: (<Text />),
    };
  };

  constructor(props) {
    super(props);

    this.renderItem = this.renderItem.bind(this);
  }

  componentDidMount() {

  }

  renderItem(item) {
    const { id } = item; // 开票单据id
    return (
      <View>
        <InvoiceItem item={item} />
      </View>
    );
  }
  render() {
    const { invoiceBillData } = this.props.navigation.state.params;

    return (
      <View style={BaseStyles.container}>
        <ScrollView style={styles.container}>
          <View style={styles.invoiceContainer} >
            <Text style={[BaseStyles.gray, BaseStyles.text16]}>增值税专用发票：</Text>
            <View style={styles.invoiceRight}>
              <Text style={[BaseStyles.orange, BaseStyles.text16]}>
                {invoiceBillData.totalPrice}
              </Text>
              <Text style={[BaseStyles.black, BaseStyles.text16]}>
                元
              </Text>
            </View>
          </View>

          <FlatList
            data={invoiceBillData.subscribeInvoiceBills}
            renderItem={this.renderItem}
            keyExtractor={Math.random}
          />


        </ScrollView>


      </View>
    );
  }
}


const styles = StyleSheet.create({
  commonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 66,
    backgroundColor: '#fff',


  },
  leftYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc601',
  },
  commonTitle: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#3a3a3a',
  },

  container: {
    width: '100%',
    marginTop: 10,
  },

  main: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },

  mainItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e8ea',
  },
  mainLabel: {
    color: '#a8a8a8',
    fontSize: 16,
    width: '30%',
  },
  mainContent: {
    color: '#3a3a3a',
    fontSize: 16,
    width: '70%',
  },
  invoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  invoiceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e8ea',
  },
  bottomBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    height: 45,
  },

});

