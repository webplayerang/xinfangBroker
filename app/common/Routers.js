// 主页
import TabHome from '../pages/Home/TabHome';
import ScanQRcode from '../pages/Home/ScanQRcode';
// 房贷计算器
import MortgageCalculator from '../pages/MortgageCalculator';
import ContactsList from '../components/ContactsList';
// import MyImagePicker from '../components/MyImagePicker';
import MsgDemo from '../components/MsgDemo';
// 日期插件
import MyDatePicker from '../components/MyDatePicker';
import Distributin from '../pages/Common/DistributionForm';
// 通用下拉组件
import SelectPicker from '../components/SelectPicker';
import NewSelectPicker from '../components/NewSelectPicker';
import SelectPickerPosition from '../components/SelectPickerPosition';
// 收据号选择
import ReceiptNumber from '../components/ReceiptNumber';
// 系统参考号选择
import SystemNumber from '../components/SystemNumber';
// 报备页面经纪人选择
import BrokerPicker from '../components/BrokerPicker';
// 分销人员选择
import DistributePicker from '../components/DistributePicker';
import BottomBarTest from '../pages/BottomBarTest';
// 登录页面
import Login from '../pages/Login';
import AdvSwiper from '../pages/AdvSwiper';
import ViewPage from '../pages/ViewPage';
// 新增报备页面
import Report from '../pages/Report';
// 合同页面
import Contract from '../pages/Common/ContractForm';
// 录入认筹基本信息
import EditBasicRecognize from '../pages/RecognizeChip/EditBasicRecognize';
// 报备管理
import ReportManage from '../pages/ReportManage';
// 我的发布管理
import MyReleaseManage from '../pages/MyReleaseManage';
// 报备楼盘搜索
import GardenSearch from '../pages/Search/GardenSearch';
// 个人报备列表搜索
import ReportListSearch from '../pages/Search/ReportListSearch';
// 个人报备列表搜索
import ReleaseSearch from '../pages/Search/ReleaseSearch';
// 个人报备列表
import PersonalReportList from '../pages/PersonalReportList';
// 发布楼盘战况
import ReleaseReport from '../pages/PersonalReportList/ReleaseReport';
import ImageTemplate from '../pages/PersonalReportList/ImageTemplate';
// 报备详情
import ReportDetail from '../pages/ReportDetail/ReportDetail';
// 认筹管理
import RecognizeManage from '../pages/RecognizeManage';
// 认筹搜查
import RecognizeSearch from '../pages/Search/RecognizeSearch';
// 成交管理
import DealManage from '../pages/DealManage';
// 认筹搜查
import DealSearch from '../pages/Search/DealSearch';
// 房号选择
import RoomPicker from '../components/RoomPicker';
import SelectRoom from '../components/RoomPicker/SelectRoom';
// 新增编辑收款信息
import EditReceipts from '../pages/RecognizeChip/EditReceipts';
// 认筹客户详情
import RecoginzeDetail from '../pages/RecoginzeDetail/RecoginzeDetail';
// 成交详情
import DealDetail from '../pages/DealDetail/DealDetail';
// 成交详情
import MyReleaseDetail from '../pages/MyReleaseDetail';
// 上数页面
import SubscribeDetail from '../pages/SubscribeDetail/SubscribeDetail';
// 转成交页面
import DealChange from '../pages/DealChange/DealChange';
// 团购费页面
import GroupPurchase from '../pages/Common/GroupPurchaseForm';
// 业绩报告
import PerformanceReport from '../pages/PerformanceReport';
// 业绩报告-楼盘搜索
import PerforGardenSearch from '../pages/PerformanceReport/PerforGardenSearch';
import PerforGardenAll from '../pages/PerformanceReport/PerforGardenAll';
// 业绩报告-楼盘战报
import GardenPerformance from '../pages/PerformanceReport/GardenPerformance';
// 业绩报告-全国战报
import CountryPerformance from '../pages/PerformanceReport/CountryPerformance';
// 项目审批
import ProjectApproval from '../pages/ProjectApproval';
// 项目审批-开票列表
import InvoiceAuditList from '../pages/ProjectApproval/InvoiceAuditList';
// 项目审批-开票详情
import InvoiceAuditDetail from '../pages/ProjectApproval/InvoiceAuditDetail';
// 项目审批-开票详情-增值税专业发票详情
import InvoiceDetail from '../pages/ProjectApproval/InvoiceDetail';
// 项目审批-开票驳回
import Disagree from '../pages/ProjectApproval/Disagree';
// 项目审批-上数审批列表
import SubscribeAuditList from '../pages/ProjectApproval/SubscribeAuditList';
// 项目审批-上数审批列表
import SubscribeAuditSearch from '../pages/Search/SubscribeAuditSearch';
// 项目审批-上数审批详情
import SubscribeAuditDetail from '../pages/ProjectApproval/SubscribeAuditDetail';
// 项目审批-上数审批详情-分佣信息
import CommissionInformation from '../pages/ProjectApproval/CommissionInformation';
// 搜索楼盘
import SearchHouse from '../pages/SearchHouse/SearchHouse';
// 搜索本人楼盘
import SearchMyHouse from '../pages/SearchMyHouse/SearchMyHouse';
// 编辑动态
import EditDynamic from '../pages/EditDynamic/EditDynamic';
// 添加动态
import AddDynamic from '../pages/AddDynamic/AddDynamic';
// 选择动态类型
import DynamicType from '../pages/DynamicType/DynamicType';

const Routes = {
  TabHome: { screen: TabHome },
  ScanQRcode: { screen: ScanQRcode },
  MortgageCalculator: { screen: MortgageCalculator },
  ReportManage: { screen: ReportManage },
  MyReleaseManage: { screen: MyReleaseManage },
  GardenSearch: { screen: GardenSearch },
  ReportListSearch: { screen: ReportListSearch },
  PersonalReportList: { screen: PersonalReportList },
  ReleaseReport: { screen: ReleaseReport },
  ImageTemplate: { screen: ImageTemplate },
  RecognizeManage: { screen: RecognizeManage },
  RecognizeSearch: { screen: RecognizeSearch },
  DealManage: { screen: DealManage },
  DealSearch: { screen: DealSearch },
  ContactsList: { screen: ContactsList },
  MyImagePicker: { screen: MyImagePicker },
  MsgDemo: { screen: MsgDemo },
  MyDatePicker: { screen: MyDatePicker },
  Distributin: { screen: Distributin },
  SelectPicker: { screen: SelectPicker },
  NewSelectPicker: { screen: NewSelectPicker },
  SelectPickerPosition: { screen: SelectPickerPosition },
  ReceiptNumber: { screen: ReceiptNumber },
  SystemNumber: { screen: SystemNumber },
  BrokerPicker: { screen: BrokerPicker },
  DistributePicker: { screen: DistributePicker },
  BottomBarTest: { screen: BottomBarTest },
  EditBasicRecognize: { screen: EditBasicRecognize },
  ReportDetail: { screen: ReportDetail },
  Login: { screen: Login },
  AdvSwiper: { screen: AdvSwiper },
  ViewPage: { screen: ViewPage },
  Report: { screen: Report },
  Contract: { screen: Contract },
  RoomPicker: { screen: RoomPicker },
  SelectRoom: { screen: SelectRoom },
  EditReceipts: { screen: EditReceipts },
  RecoginzeDetail: { screen: RecoginzeDetail },
  DealDetail: { screen: DealDetail },
  MyReleaseDetail: { screen: MyReleaseDetail },
  SubscribeDetail: { screen: SubscribeDetail },
  DealChange: { screen: DealChange },
  GroupPurchase: { screen: GroupPurchase },
  PerformanceReport: { screen: PerformanceReport },
  PerforGardenAll: { screen: PerforGardenAll },
  PerforGardenSearch: { screen: PerforGardenSearch },
  ReleaseSearch: { screen: ReleaseSearch },
  CountryPerformance: { screen: CountryPerformance },
  GardenPerformance: { screen: GardenPerformance },
  ProjectApproval: { screen: ProjectApproval },
  InvoiceAuditList: { screen: InvoiceAuditList },
  InvoiceAuditDetail: { screen: InvoiceAuditDetail },
  InvoiceDetail: { screen: InvoiceDetail },
  Disagree: { screen: Disagree },
  SubscribeAuditList: { screen: SubscribeAuditList },
  SubscribeAuditDetail: { screen: SubscribeAuditDetail },
  CommissionInformation: { screen: CommissionInformation },
  SubscribeAuditSearch: { screen: SubscribeAuditSearch },
  SearchHouse: { screen: SearchHouse },
  EditDynamic: { screen: EditDynamic },
  AddDynamic: { screen: AddDynamic },
  SearchMyHouse: { screen: SearchMyHouse },
  DynamicType: { screen: DynamicType },
};

export default Routes;
