import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  Content,
  Events,
  IonicPage,
  NavController,
  PopoverController,
  Slides
} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import gql from 'graphql-tag';

import { HttpService } from '../../../../services/http.service';
import { GraphqlService } from '../../../../services/graphql.service';
import { IClubDetails } from '../../../../shared/model/club.model';
import {
  CommonService,
  ToastMessageType,
  ToastPlacement
} from '../../../../services/common.service';
import { API } from '../../../../shared/constants/api_constants';
import { SharedServices } from '../../../services/sharedservice';
import { AppType, DeviceType } from '../../../../shared/constants/module.constants';
import { CommonRestApiDto } from '../../../../shared/model/common.model';

@IonicPage()
@Component({
  selector: 'page-holidaycamppaymentreport',
  templateUrl: 'holidaycamppaymentreport.html',
  providers: [HttpService]
})
export class HolidaycamppaymentreportPage {
  @ViewChild('myslider') myslider: Slides;
  @ViewChild(Content) content: Content;

  isDateRange: boolean = true;
  isSearchEnabled: boolean = false;
  isDarkTheme: boolean = true;
  LangObj: any = {};
  reportType: string = 'Paid';
  total_txns: number = 0;
  total_txns_amount: number = 0.0;
  postgre_parentclub_id: string = '';

  report_input: CommonRestApiDto & {
    updated_by: string;
    start_date: string;
    end_date: string;
  } = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: DeviceType.IOS,
    app_type: AppType.ADMIN_NEW,
    device_id: '',
    updated_by: '',
    start_date: '',
    end_date: ''
  };

  clubs: IClubDetails[] = [];
  selectedClub: string = 'All';
  paidMemberList: HolidayCampTransactionHistoryItem[] = [];
  paidMemberListtemp: HolidayCampTransactionHistoryItem[] = [];
  dueMemberList: any[] = [];
  dueMemberListtemp: any[] = [];

  startDate: any;
  endDate: any;
  isMonthSelected: boolean = false;
  trnsMonths: Array<any> = [];
  userData: any = {};
  parentClubKey: string = '';
  currencyDetails: any = '';
  scrollContent: any;

  private themeChangeHandler = (isDark: boolean) => {
    this.isDarkTheme = isDark;
    this.applyTheme();
  };

  constructor(
    public events: Events,
    private commonService: CommonService,
    public storage: Storage,
    public navCtrl: NavController,
    private sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private elementRef: ElementRef,
    private graphqlService: GraphqlService,
    private httpService: HttpService
  ) {
    this.setupInitialConfig();
  }

  ngOnInit() {
    this.initializeMonths();
    this.loadUserData();
  }

  ionViewWillEnter() {
    this.loadTheme();
    this.events.subscribe('theme:changed', this.themeChangeHandler);
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed', this.themeChangeHandler);
  }

  async setupInitialConfig() {
    const values = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub')
    ]);
    const postgre_parentclub = values[1];
    if (postgre_parentclub) {
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.userData = this.sharedservice.getUserData();
      this.startDate = moment().subtract(10, 'days').format('YYYY-MM-DD');
      this.endDate = moment().format('YYYY-MM-DD');
      this.report_input.start_date = this.startDate;
      this.report_input.end_date = this.endDate;
      this.report_input.parentclubId = postgre_parentclub.Id;
      this.report_input.activityId = '';
      this.report_input.memberId = this.sharedservice.getLoggedInId();
      this.report_input.app_type = AppType.ADMIN_NEW;
      this.report_input.device_id = this.sharedservice.getDeviceId();
      this.report_input.updated_by = this.sharedservice.getLoggedInId();
      this.report_input.device_type =
        this.sharedservice.getPlatform() === 'android'
          ? DeviceType.ANDROID
          : DeviceType.IOS;
      this.getClubList();
    }
  }

  private initializeMonths() {
    for (let i = 0; i < 4; i++) {
      const check = moment().subtract(i, 'months');
      this.trnsMonths.push({
        month: check.format('MMM'),
        year: check.format('YYYY'),
        IsActive: false
      });
    }
    this.trnsMonths.reverse();
    this.trnsMonths.push({ month: '7', year: 'Days', IsActive: false });
    this.trnsMonths.push({ month: 'Dates', year: '', IsActive: true });
  }

  ionViewDidLoad() {
    this.scrollContent = this.elementRef.nativeElement.getElementsByClassName(
      'scroll-content'
    )[0];
    this.getLanguage();
    this.events.subscribe('language', () => this.getLanguage());
  }

  private loadUserData() {
    this.storage.get('userObj').then((val) => {
      if (val) {
        const parsed = JSON.parse(val);
        this.parentClubKey = parsed.UserInfo[0].ParentClubKey;
      }
    });
    this.storage
      .get('Currency')
      .then((val) => {
        this.currencyDetails = val ? JSON.parse(val) : null;
      })
      .catch((error) => console.error('Currency fetch error:', error));
  }

  getLanguage() {
    this.storage.get('language').then((res) => {
      this.LangObj = res && res.data ? res.data : {};
    });
  }

  getClubList() {
    const clubs_input = {
      parentclub_id: this.postgre_parentclub_id,
      user_postgre_metadata: {
        UserMemberId: this.sharedservice.getLoggedInId()
      },
      user_device_metadata: {
        UserAppType: AppType.ADMIN,
        UserDeviceType:
          this.sharedservice.getPlatform() === 'android'
            ? DeviceType.ANDROID
            : DeviceType.IOS
      }
    };
    const clubs_query = gql`
      query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!) {
        getVenuesByParentClub(clubInput: $clubs_input) {
          Id
          ClubName
          FirebaseId
          MapUrl
          sequence
        }
      }
    `;
    this.graphqlService.query(clubs_query, { clubs_input: clubs_input }, 0).subscribe(
      (res: any) => {
        this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
        this.selectedClub = 'All';
        this.report_input.clubId = '';
        this.getPayment();
      },
      (error) => {
        this.commonService.toastMessage('No venues found', 2500, ToastMessageType.Error);
        console.error('Error in fetching:', error);
        this.getPayment();
      }
    );
  }

  getPayment(): void {
    this.httpService
      .post<HolidayCampTransactionHistoryItem[] | { data: HolidayCampTransactionHistoryItem[] }>(
        API.HOLIDAYCAMP_PAYMENT_LISTING,
        this.report_input
      )
      .subscribe({
        next: (res: any) => {
          const list: HolidayCampTransactionHistoryItem[] = Array.isArray(res)
            ? res
            : (res && res.data) || [];
          this.paidMemberList = list;
          this.paidMemberListtemp = JSON.parse(JSON.stringify(list));
          this.total_txns_amount = list.reduce(
            (total, item) => total + (parseFloat(item.total_amount_paid as any) || 0),
            0
          );
          this.total_txns = list.length;
        },
        error: () => {
          this.paidMemberList = [];
          this.paidMemberListtemp = [];
          this.total_txns_amount = 0;
          this.total_txns = 0;
          this.commonService.toastMessage(
            'Failed to fetch payment',
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      });
  }

  getPendingPayments(): void {
    const payload: CommonRestApiDto & { updated_by: string } = {
      parentclubId:
        this.report_input.parentclubId || this.sharedservice.getPostgreParentClubId(),
      clubId: this.report_input.clubId,
      activityId: this.report_input.activityId,
      memberId: this.report_input.memberId || this.sharedservice.getLoggedInId(),
      action_type: this.report_input.action_type,
      device_type:
        this.sharedservice.getPlatform() === 'android'
          ? DeviceType.ANDROID
          : DeviceType.IOS,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId(),
      updated_by: this.sharedservice.getLoggedInId()
    };

    this.httpService.post<HolidayCampEnrolmentDetailsItem[]>(API.EnrolmentDetails, payload).subscribe({
      next: (res: any) => {
        const raw: HolidayCampEnrolmentDetailsItem[] = Array.isArray(res)
          ? res
          : (res && res.data) || [];
        const list = raw.map((item) => ({
          userName: item.username,
          campName: item.campname,
          sessionName: item.sessionname,
          sessionDate: item.sessiondate,
          venueName: item.venuename,
          coachName: item.coachname,
          startTime: item.starttime,
          endTime: item.endtime,
          holidayCampDays: item.holidaycampdays,
          amountDue: item.amountdue
        }));
        this.dueMemberList = list;
        this.dueMemberListtemp = JSON.parse(JSON.stringify(list));
        this.total_txns_amount = list.reduce(
          (total, item) => total + (parseFloat(item.amountDue as any) || 0),
          0
        );
        this.total_txns = list.length;
      },
      error: (error) => {
        console.warn('No pending holiday camp payments found', error);
        this.dueMemberList = [];
        this.dueMemberListtemp = [];
        this.total_txns_amount = 0;
        this.total_txns = 0;
      }
    });
  }

  public SelectedMonth(index: number) {
    this.isDateRange = false;
    this.total_txns_amount = 0.0;
    this.isMonthSelected = true;
    this.trnsMonths[index].IsActive = true;
    this.trnsMonths.forEach((item, itemIndex) => {
      if (itemIndex !== index) {
        item.IsActive = false;
      }
    });

    const selected = this.trnsMonths[index];
    if (selected.year === 'Days') {
      this.report_input.start_date = moment().subtract(7, 'days').format('YYYY-MM-DD');
      this.report_input.end_date = moment().format('YYYY-MM-DD');
    } else if (selected.year === '') {
      this.isDateRange = true;
      this.report_input.start_date = moment().subtract(10, 'days').format('YYYY-MM-DD');
      this.report_input.end_date = moment().format('YYYY-MM-DD');
    } else {
      const startOfMonth = moment(`${selected.year}-${selected.month}-01`).startOf('month');
      const endOfMonth = moment(startOfMonth).endOf('month');
      this.report_input.start_date = startOfMonth.format('YYYY-MM-DD');
      this.report_input.end_date = endOfMonth.format('YYYY-MM-DD');
    }
    this.getPayment();
  }

  Search() {
    if (moment(this.startDate).isAfter(this.endDate)) {
      this.commonService.toastMessage(
        'end should not be greater than start date',
        3000,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    }
    this.report_input.start_date = this.startDate;
    this.report_input.end_date = this.endDate;
    this.getPayment();
  }

  paymentTabClick(type: string) {
    this.reportType = type;
    if (type === 'Paid') {
      this.getPayment();
    } else {
      this.getPendingPayments();
    }
  }

  onChangeOfClub() {
    this.report_input.clubId = this.selectedClub === 'All' ? '' : this.selectedClub;
    if (this.reportType === 'Paid') {
      this.paidMemberList = [];
      this.paidMemberListtemp = [];
      this.getPayment();
    } else {
      this.dueMemberList = [];
      this.dueMemberListtemp = [];
      this.getPendingPayments();
    }
  }

  presentPopover(myEvent) {
    const popover = this.popoverCtrl.create('PopoverPage');
    popover.present({ ev: myEvent });
  }

  goToDetailsPage(item: HolidayCampTransactionHistoryItem) {
    this.navCtrl.push('HolidaycampaymentsdetailsPage', {
      transaction_id: item.transaction_id,
      transaction_date: item.transaction_date,
      clubId: this.report_input.clubId,
      parentclubId: this.report_input.parentclubId,
      amount_paid: item.total_amount_paid,
      paid_by_text: item.paid_by_text,
      camp_names: item.camp_names
    });
  }

  goToPrintPage() {
    if (this.paidMemberListtemp.length === 0) {
      this.commonService.toastMessage('No records found', 2500, ToastMessageType.Error);
      return false;
    }
    const memberList = this.paidMemberListtemp.map((mem) => ({
      FirstName: '',
      LastName: '',
      CampName:
        mem.camp_names ||
        mem.holidaycamp_count + ' camps / ' + mem.session_count + ' sessions',
      ClubName: '',
      PaidBy: mem.paidby,
      AmountPaid: mem.total_amount_paid,
      DueAmount: 0,
      TransactionDate: mem.transaction_date,
      IsEnable: true
    }));
    this.navCtrl.push('CampReportPrint', {
      memberList: memberList,
      reportType: 'paid',
      parentclubKey: this.parentClubKey
    });
  }

  getFilterItems(ev: any) {
    const val: string = ev && ev.target ? ev.target.value : '';
    const source = this.reportType === 'Paid' ? this.paidMemberList : this.dueMemberList;
    if (val && val.trim() !== '') {
      const lower = val.toLowerCase();
      const fields =
        this.reportType === 'Paid'
          ? ['transaction_id', 'paidby', 'paid_by_text', 'transaction_date', 'camp_names']
          : [
              'campName',
              'userName',
              'sessionName',
              'sessionDate',
              'venueName',
              'coachName',
              'startTime',
              'endTime',
              'holidayCampDays'
            ];
      const filtered = source.filter((item: any) =>
        fields.some(
          (field) =>
            item[field] !== undefined &&
            item[field] !== null &&
            String(item[field]).toLowerCase().indexOf(lower) > -1
        )
      );
      if (this.reportType === 'Paid') {
        this.paidMemberListtemp = filtered as HolidayCampTransactionHistoryItem[];
      } else {
        this.dueMemberListtemp = filtered;
      }
    } else if (this.reportType === 'Paid') {
      this.paidMemberListtemp = JSON.parse(JSON.stringify(this.paidMemberList));
    } else {
      this.dueMemberListtemp = JSON.parse(JSON.stringify(this.dueMemberList));
    }
  }

  private loadTheme() {
    this.storage
      .get('dashboardTheme')
      .then((isDarkTheme) => {
        this.isDarkTheme =
          isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true;
        this.applyTheme();
      })
      .catch(() => {
        this.isDarkTheme = true;
        this.applyTheme();
      });
  }

  private applyTheme() {
    const el = document.querySelector('page-holidaycamppaymentreport');
    if (el) {
      if (this.isDarkTheme) {
        el.classList.remove('light-theme');
        el.classList.add('dark-theme');
      } else {
        el.classList.remove('dark-theme');
        el.classList.add('light-theme');
      }
    }
  }

  getDay(dt: string) {
    return dt && moment(dt).isValid() ? moment(dt).format('DD-MM-YYYY') : '';
  }
}

export class HolidayCampTransactionHistoryItem {
  transaction_id: string;
  parentclub_id: string;
  club_id?: string;
  transaction_date: string;
  paidby: string;
  paid_by_text?: string;
  camp_names?: string;
  session_count: number;
  holidaycamp_count: number;
  total_amount_paid: number;
}

export class HolidayCampEnrolmentDetailsItem {
  id: string;
  userid: string;
  username: string;
  campname: string;
  sessionid: string;
  sessionname: string;
  sessiondate: string;
  venuename: string;
  enrolmentdate: string;
  enrolmentid: string;
  holidaycampdays: string;
  starttime: string;
  endtime: string;
  amountdue: string;
  coachname: string;
}
