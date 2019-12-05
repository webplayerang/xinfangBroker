import { Platform, Dimensions } from 'react-native';

const dimen = Dimensions.get('window');

export default {
  isIOS: Platform.OS === 'ios',
  isIphoneX: Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    ((dimen.height === 812 && dimen.width === 375) || (dimen.height === 375 && dimen.width === 812)),
  isIphoneXs: Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    ((dimen.height === 896 && dimen.width === 414) || (dimen.height === 414 && dimen.width === 896)),
  Version: Platform.Version,
};
