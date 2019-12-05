import React from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import baseStyles from '../../style/BaseStyles';

function getdistributionPersonVosView(store) {
  const showProportion = store.list.length > 1;
  return store.list.map((item) =>
    (
      <View key={Math.random()}>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>姓名：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.distributionPersonName}</Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>可结算佣金：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.distributionSettlement} 元</Text>
          </View>
        </View>
        {
          store.hasCashPrize === 0 &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>可结现金奖：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.distributionCashPrize} 元</Text>
            </View>
          </View>
        }
        {
          store.hasCooperativeCommission === 0 &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>合作佣金：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.distributionCooperativeCommission} 元</Text>
            </View>
          </View>
        }
        {/* 比例 */}
        {
          showProportion &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>佣金比例：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.actualProportion}</Text>
            </View>
          </View>
        }
        {
          (store.hasCashPrize === 0 && showProportion) &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>现金奖比例：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.awardProportion}</Text>
            </View>
          </View>
        }
        {
          (store.hasCooperativeCommission === 0 && showProportion) &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>合作佣金比例：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.cooperationProportion}</Text>
            </View>
          </View>
        }
      </View>),
  );
}
export default function (store) {
  const distributionPersonVosView = getdistributionPersonVosView(store);
  return (
    <View>
      <View style={[styles.list, styles.pr0, baseStyles.darkBorderBt]} >
        <View><Text style={[styles.titleTxt, { color: '#3a3a3a' }]}>基础信息</Text></View>
      </View>
      <View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>团购费：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.groupPrice} 元</Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>现金奖：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.hasCashPrize === 0 ? '有' : '无'}</Text>
          </View>
        </View>
        {store.hasCashPrize === 0 &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>现金奖形式：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.cashPrizeMode === 0 ? '佣金内' : '佣金外'}</Text>
            </View>
          </View>
        }

        {
          store.hasCashPrize === 0 && store.cashPrizeMode === 0 ?
            <View style={[baseStyles.borderTop, styles.infoItem]}>
              <View>
                <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>分销佣金承担：</Text>
              </View>
              <View>
                <Text style={[styles.comRightTxt, baseStyles.text14]}>
                  {store.distributionCommissionBear === 0 ? '是' : '否'}
                </Text>
              </View>
            </View>
            : null
        }


        {store.hasCashPrize === 0 &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>现金奖金额：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.cashPrizeAmount} 元</Text>
            </View>
          </View>
        }
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>合作佣金：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.hasCooperativeCommission === 0 ? '有' : '无'}</Text>
          </View>
        </View>
        {store.hasCooperativeCommission === 0 &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>合作金额：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.cooperativeCommission} 元</Text>
            </View>
          </View>
        }
        {store.hasCooperativeCommission === 0 &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>比例分配：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.cooperativeProportion.join(':')} (项目:分销)</Text>
            </View>
          </View>
        }
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>实际佣金：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.actualCommission} 元</Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>佣金分配方式：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.actualCommissionMode === 0 ? '比例分佣' : '定额分佣'}</Text>
          </View>
        </View>
        {store.actualCommissionMode === 0 ?
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>比例分配：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.actualProportion.join(':')} (项目:分销)</Text>
            </View>
          </View>
          :
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>定额佣金(分销)：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.distributionFixedCommission} 元</Text>
            </View>
          </View>
        }
        <View style={[baseStyles.borderTop, styles.infoItem, styles.list, { borderBottomColor: '#a8a8a8', borderBottomWidth: StyleSheet.hairlineWidth }]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, { width: 200, color: '#3A3A3A', fontSize: 16 }]}>项目人员佣金分配</Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>姓名：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.projectPersonName}</Text>
          </View>
        </View>
        {store.hasCooperativeCommission === 0 &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>合作佣金(支出)：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.projectCooperativeCommission} 元</Text>
            </View>
          </View>
        }
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>可结算佣金：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.projectSettlement} 元</Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem, styles.list, { borderBottomColor: '#a8a8a8', borderBottomWidth: StyleSheet.hairlineWidth }]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, { width: 200, color: '#3A3A3A', fontSize: 16 }]}>分销人员佣金分配</Text>
          </View>
        </View>
        {distributionPersonVosView}
        {/* <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>姓名：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.distributionPersonName}</Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>可结算佣金：</Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.distributionSettlement} 元</Text>
          </View>
        </View>
        {store.hasCashPrize === 0 &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>可结现金奖：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.distributionCashPrize} 元</Text>
            </View>
          </View>
        }
        {store.hasCooperativeCommission === 0 &&
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWider]}>合作佣金：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.distributionCooperativeCommission} 元</Text>
            </View>
          </View>
        } */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    height: 54,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleTxt: {
    fontSize: 16,
    color: '#7e7e7e',
  },
  pr0: {
    paddingRight: 0,
  },
  infoItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    height: 44,
    alignItems: 'center',
    flexDirection: 'row',
  },
  comLeftTxt: {
    color: '#7e7e7e',
    fontSize: 14,
  },
  comRightTxt: {
    color: '#3a3a3a',
    fontSize: 14,
  },
  leftWidth: {
    width: 88,
  },
  leftWider: {
    width: 120,
  },
});
