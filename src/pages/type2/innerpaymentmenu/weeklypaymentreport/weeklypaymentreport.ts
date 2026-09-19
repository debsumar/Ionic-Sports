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
import {
  WeeklyPendingPaymentModel,
  WeeklyPendingPaymentSessions
} from '../../../../shared/model/booking_history.model';

@IonicPage()
@Component({
  selector: 'weeklypaymentreport-page',
  templateUrl: 'weeklypaymentreport.html',
  providers: [HttpService]
})
export class WeeklyPaymentReport {
  @ViewChild('myslider') myslider: Slides;
  @ViewChild(Content) content: Content;

  isDateRange: boolean = true;
  isSearchEnabled: boolean = false;
  isDarkTheme: boolean = true;
  isMonthSelected: boolean = false;
  LangObj: any = {};
  total_txns: number = 0;
  total_txns_amount: number = 0.0;
  postgre_parentclub_id: string = '';
  reportType: string = 'Paid';

  report_input: CommonRestApiDto & {
    updated_by: string;
    start_date: string;
    end_date: string;
    status: number;
  } = {
    parentclubId: '',
    clubId: '',
    memberId: '',
    activityId: '',
    action_type: 0,
    device_type: DeviceType.IOS,
    app_type: AppType.ADMIN_NEW,
    device_id: '',
    updated_by: '',
    start_date: '',
    end_date: '',
    status: 1
  };

  parentClubKey: string = '';
  clubs: IClubDetails[] = [];
  selectedClub: string = 'All';
  userData: any = {};
  startDate: any;
  endDate: any;
  currencyDetails: any = '';
  trnsMonths: Array<any> = [];
  paidMemberList: WeeklyPaymentReportRes[] = [];
  paidMemberListtemp: WeeklyPaymentReportRes[] = [];
  dueMemberList: WeeklyPendingPaymentSessions[] = [];
  dueMemberListtemp: WeeklyPendingPaymentSessions[] = [];
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
      this.report_input.memberId = this.sharedservice.getLoggedInUserId();
      this.report_input.app_type = AppType.ADMIN_NEW;
      this.report_input.device_id = this.sharedservice.getDeviceId();
      this.report_input.updated_by = this.sharedservice.getLoggedInUserId();
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

  getPayment(): void {
    this.httpService
      .post<{ message: string; data: WeeklyPaymentReportRes[] }>(
        API.WEEKLY_ALL_PAYMENT_DETAILS,
        this.report_input
      )
      .subscribe({
        next: (res) => {
          this.paidMemberList = res && Array.isArray(res.data) ? res.data : [];
          this.paidMemberListtemp = JSON.parse(JSON.stringify(this.paidMemberList));
          this.total_txns_amount = this.paidMemberList.reduce(
            (total, item) => total + (parseFloat(item.amount_paid as any) || 0),
            0
          );
          this.total_txns = this.paidMemberList.length;
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
      memberId:
        this.report_input.memberId || this.sharedservice.getLoggedInUserId(),
      action_type: this.report_input.action_type,
      device_type:
        this.sharedservice.getPlatform() === 'android'
          ? DeviceType.ANDROID
          : DeviceType.IOS,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId(),
      updated_by: this.sharedservice.getLoggedInUserId()
    };

    this.httpService
      .post<WeeklyPendingPaymentModel>(API.GetPendingPaymentWeekly, payload)
      .subscribe({
        next: (res) => {
          this.dueMemberList = res && Array.isArray(res.pending_sessions)
            ? res.pending_sessions
            : [];
          this.dueMemberListtemp = JSON.parse(JSON.stringify(this.dueMemberList));
          const responseTotal = res ? parseFloat(res.totalDueAmountSum) : NaN;
          this.total_txns_amount = isNaN(responseTotal)
            ? this.dueMemberList.reduce(
                (total, item) => total + (parseFloat(item.amount_due as any) || 0),
                0
              )
            : responseTotal;
          const responseCount = res ? parseInt(res.totalCount, 10) : NaN;
          this.total_txns = isNaN(responseCount)
            ? this.dueMemberList.length
            : responseCount;
        },
        error: (error) => {
          console.warn('No pending weekly payments found', error);
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

    const selectedMonth = this.trnsMonths[index];
    if (selectedMonth.year === 'Days') {
      this.report_input.start_date = moment().subtract(7, 'days').format('YYYY-MM-DD');
      this.report_input.end_date = moment().format('YYYY-MM-DD');
    } else if (selectedMonth.year === '') {
      this.isDateRange = true;
      this.report_input.start_date = moment().subtract(10, 'days').format('YYYY-MM-DD');
      this.report_input.end_date = moment().format('YYYY-MM-DD');
    } else {
      const startOfMonth = moment(
        `${selectedMonth.year}-${selectedMonth.month}-01`
      ).startOf('month');
      const endOfMonth = moment(startOfMonth).endOf('month');
      this.report_input.start_date = startOfMonth.format('YYYY-MM-DD');
      this.report_input.end_date = endOfMonth.format('YYYY-MM-DD');
    }
    this.getPayment();
  }

  getLanguage() {
    this.storage.get('language').then((res) => {
      this.LangObj = res && res.data ? res.data : {};
    });
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

  getClubList() {
    const clubs_input = {
      parentclub_id: this.postgre_parentclub_id,
      user_postgre_metadata: {
        UserMemberId: this.sharedservice.getLoggedInUserId()
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

  getFilterItems(ev: any) {
    const val: string = ev && ev.target ? ev.target.value : '';
    const source: any[] =
      this.reportType === 'Paid' ? this.paidMemberList : this.dueMemberList;
    if (val && val.trim() !== '') {
      const lower = val.toLowerCase();
      const fields =
        this.reportType === 'Paid'
          ? ['member_name', 'session_name', 'coach_name', 'club_name', 'days']
          : [
              'FirstName',
              'LastName',
              'session_name',
              'ClubName',
              'coach_first_name',
              'coach_last_name',
              'days',
              'start_date'
            ];
      const filtered = source.filter((item) =>
        fields.some(
          (field) =>
            item[field] !== undefined &&
            item[field] !== null &&
            String(item[field]).toLowerCase().indexOf(lower) > -1
        )
      );
      if (this.reportType === 'Paid') {
        this.paidMemberListtemp = filtered as WeeklyPaymentReportRes[];
      } else {
        this.dueMemberListtemp = filtered as WeeklyPendingPaymentSessions[];
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
    const el = document.querySelector('weeklypaymentreport-page');
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
}

export class WeeklyPaymentReportRes {
  enrol_id: string;
  session_id: string;
  member_id: string;
  is_child: boolean;
  session_name: string;
  weekly_session_name: string;
  member_name: string;
  transaction_date: string;
  transaction_id?: string;
  amount_paid?: number;
  start_time?: string;
  days?: string;
  email_id: string;
  phone_number: string;
  parentclub_id: string;
  parentclub_name: string;
  coach_id?: string;
  coach_name?: string;
  club_id?: string;
  club_name?: string;
  paidby?: string;
  paidby_text?: string;
}
