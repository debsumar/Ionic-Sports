import { Component, ViewChild, Renderer2, ElementRef } from '@angular/core';
import {
  NavController,
  PopoverController,
  ActionSheetController,
  LoadingController,
  Slides,
  Content,
  IonicPage,
  Events
} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';

import { HttpService } from '../../../../services/http.service';
import { GraphqlService } from '../../../../services/graphql.service';
import { ThemeService } from '../../../../services/theme.service';
import { IClubDetails } from '../../../../shared/model/club.model';
import {
  CommonService,
  ToastMessageType,
  ToastPlacement
} from '../../../../services/common.service';
import { API } from '../../../../shared/constants/api_constants';
import { SharedServices } from '../../../services/sharedservice';
import { AppType } from '../../../../shared/constants/module.constants';
import gql from 'graphql-tag';

@IonicPage()
@Component({
  selector: 'page-schoolpaymentreport',
  templateUrl: 'schoolpaymentreport.html',
  providers: [HttpService]
})
export class SchoolpaymentreportPage {
  @ViewChild('myslider') myslider: Slides;
  @ViewChild(Content) content: Content;

  isDateRange: boolean = true;
  isSearchEnabled: boolean = false;
  isDarkTheme: boolean = true;
  LangObj: any = {};

  // Summary
  total_txns: number = 0;
  total_txns_amount: number = 0.0;

  // Tabs (kept for parity with monthlysesreport visual structure)
  reportType: string = 'Paid';

  // Postgre parent club
  postgre_parentclub_id: string = '';

  // Report request payload
  report_input = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    start_date: '',
    end_date: ''
  };

  // School/Venue list (the API uses club_id; for the UI we keep "school" wording)
  clubs: IClubDetails[] = [];
  selectedClub: string = 'All';

  paidMemberList: schoolSessionPaymentRes[] = [];
  paidMemberListtemp: schoolSessionPaymentRes[] = [];

  startDate: any;
  endDate: any;
  isMonthSelected: boolean = false;
  trnsMonths: Array<any> = [];

  userData: any = {};
  parentClubKey: string = '';
  currencyDetails: any = '';
  scrollContent: any;

  constructor(
    public events: Events,
    private commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public navCtrl: NavController,
    private sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    public actionSheetCtrl: ActionSheetController,
    private graphqlService: GraphqlService,
    private httpService: HttpService,
    private themeService: ThemeService
  ) {
    this.setupInitialConfig();
    this.loadTheme();
  }

  ngOnInit() {
    this.initializeMonths();
    this.loadUserData();
  }

  async setupInitialConfig() {
    const [userObj, postgre_parentclub] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub')
    ]);
    if (postgre_parentclub) {
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.userData = this.sharedservice.getUserData();

      this.startDate = moment().subtract(10, 'days').format('YYYY-MM-DD');
      this.endDate = moment().format('YYYY-MM-DD');
      this.report_input.start_date = this.startDate;
      this.report_input.end_date = this.endDate;
      this.report_input.parentclubId = postgre_parentclub.Id;
      this.report_input.app_type = AppType.ADMIN_NEW;
      this.report_input.device_id = this.sharedservice.getDeviceId();
      this.report_input.updated_by = this.sharedservice.getLoggedInId();
      this.report_input.device_type =
        this.sharedservice.getPlatform() == 'android' ? 1 : 2;

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
    this.events.subscribe('language', () => {
      this.getLanguage();
    });
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
        UserAppType: 0,
        UserDeviceType: this.sharedservice.getPlatform() == 'android' ? 1 : 2
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
    this.graphqlService
      .query(clubs_query, { clubs_input: clubs_input }, 0)
      .subscribe(
        (res: any) => {
          this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
          this.selectedClub = 'All';
          this.report_input.clubId = '';
          this.getPayment();
        },
        (error) => {
          this.commonService.toastMessage(
            'No venues found',
            2500,
            ToastMessageType.Error
          );
          console.error('Error in fetching:', error);
          this.getPayment();
        }
      );
  }

  // Get paid school session payments
  getPayment(): void {
    this.httpService
      .post<{ message: string; data: schoolSessionPaymentRes[] }>(
        API.SCHOOL_SESSION_PAYMENT_REPORT,
        this.report_input
      )
      .subscribe({
        next: (res) => {
          this.paidMemberList = (res && res.data) || [];
          this.paidMemberListtemp = JSON.parse(
            JSON.stringify(this.paidMemberList)
          );
          this.total_txns_amount = this.paidMemberList.reduce(
            (acc, item) => acc + (parseFloat(item.amount_paid as any) || 0),
            0
          );
          this.total_txns = this.paidMemberListtemp.length;
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

  public SelectedMonth(index: number) {
    this.isDateRange = false;
    this.total_txns_amount = 0.0;
    this.isMonthSelected = true;
    this.trnsMonths[index].IsActive = true;
    this.trnsMonths.forEach((item, itemIndex) => {
      if (itemIndex !== index) item.IsActive = false;
    });

    const selected = this.trnsMonths[index];
    if (selected.year === 'Days') {
      this.report_input.start_date = moment()
        .subtract(7, 'days')
        .format('YYYY-MM-DD');
      this.report_input.end_date = moment().format('YYYY-MM-DD');
    } else if (selected.year === '') {
      this.isDateRange = true;
      this.report_input.start_date = moment()
        .subtract(10, 'days')
        .format('YYYY-MM-DD');
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
    // School payment report only has 'Paid'. We keep the segment for visual
    // parity but only the Paid list is meaningful.
    this.reportType = type;
    this.getPayment();
  }

  onChangeOfClub() {
    if (this.selectedClub === 'All') {
      this.report_input.clubId = '';
    } else {
      this.report_input.clubId = this.selectedClub;
    }
    this.paidMemberList = [];
    this.paidMemberListtemp = [];
    this.getPayment();
  }

  presentPopover(myEvent) {
    const popover = this.popoverCtrl.create('PopoverPage');
    popover.present({ ev: myEvent });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot('Dashboard');
  }

  goToPrintPage() {
    if (this.paidMemberListtemp.length === 0) {
      this.commonService.toastMessage(
        'No records found',
        2500,
        ToastMessageType.Error
      );
      return false;
    }
    // Map to the field shape expected by SchoolReportPrint
    const memberList = this.paidMemberListtemp.map((mem) => ({
      FirstName: mem.FirstName,
      LastName: mem.LastName,
      SessionName: mem.session_name,
      SchoolName: mem.ClubName,
      PaidBy: mem.paid_by_text,
      AmountPaid: mem.amount_paid,
      AmountDue: mem.amount_due,
      DueAmount: mem.amount_due,
      TransactionDate: mem.transaction_date,
      IsEnable: true
    }));
    this.navCtrl.push('SchoolReportPrint', {
      memberList,
      reportType: 'paid',
      parentclubKey: this.parentClubKey
    });
  }

  // Searching transactions
  getFilterItems(ev: any) {
    const val: string = ev && ev.target ? ev.target.value : '';
    if (val && val.trim() !== '') {
      const lower = val.toLowerCase();
      this.paidMemberListtemp = this.paidMemberList.filter((item) => {
        return (
          (item.session_name && item.session_name.toLowerCase().indexOf(lower) > -1) ||
          (item.FirstName && item.FirstName.toLowerCase().indexOf(lower) > -1) ||
          (item.LastName && item.LastName.toLowerCase().indexOf(lower) > -1) ||
          (item.coach_name && item.coach_name.toLowerCase().indexOf(lower) > -1) ||
          (item.ClubName && item.ClubName.toLowerCase().indexOf(lower) > -1) ||
          (item.days && item.days.toLowerCase().indexOf(lower) > -1) ||
          (item.start_time && item.start_time.toLowerCase().indexOf(lower) > -1)
        );
      });
    } else {
      this.paidMemberListtemp = JSON.parse(JSON.stringify(this.paidMemberList));
    }
  }

  loadTheme() {
    this.storage
      .get('dashboardTheme')
      .then((isDarkTheme) => {
        this.isDarkTheme = isDarkTheme !== null ? isDarkTheme : true;
        this.applyTheme();
      })
      .catch(() => {
        this.isDarkTheme = true;
        this.applyTheme();
      });
    this.events.subscribe('theme:changed', (isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme();
    });
  }

  applyTheme() {
    const el = document.querySelector('page-schoolpaymentreport');
    if (el) {
      if (this.isDarkTheme) {
        el.classList.remove('light-theme');
      } else {
        el.classList.add('light-theme');
      }
    }
  }

  getDay(dt) {
    return moment(dt).format('DD-MM-YYYY');
  }
}

// Response shape returned by paymentreport/schoolSessionPaymentReport.
export class schoolSessionPaymentRes {
  ClubName: string;
  user_id: string;
  session_id: string;
  parent_key: string;
  FirebaseKey: string;
  DOB: string;
  MedicalCondition: string;
  MediaConsent: string;
  PhoneNumber: string;
  ParentEmailID: string;
  ParentPhoneNumber: string;
  transaction_date: string;
  ClubKey: string;
  club_id: string;
  is_child: boolean;
  postgre_clubid: string;
  FirstName: string;
  LastName: string;
  amount_due: string;
  session_name: string;
  coach_name: string;
  start_time: string;
  days: string;
  amount_paid: string;
  paidby: number;
  paid_by_text: string;
  total_discount: number;
  term_name: string;
  coach_id: string;
  phone_number: string;
  email: string;
}
