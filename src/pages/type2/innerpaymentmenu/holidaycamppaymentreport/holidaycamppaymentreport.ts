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
import gql from 'graphql-tag';

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

  // Tabs (kept for parity with monthlysesreport visual structure)
  reportType: string = 'Paid';

  // Summary
  total_txns: number = 0;
  total_txns_amount: number = 0.0;

  postgre_parentclub_id: string = '';

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

  clubs: IClubDetails[] = [];
  selectedClub: string = 'All';

  paidMemberList: HolidayCampTransactionHistoryItem[] = [];
  paidMemberListtemp: HolidayCampTransactionHistoryItem[] = [];

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

  // Get holiday camp payment listing (transaction summary)
  getPayment(): void {
    this.httpService
      .post<HolidayCampTransactionHistoryItem[] | { data: HolidayCampTransactionHistoryItem[] }>(
        API.HOLIDAYCAMP_PAYMENT_LISTING,
        this.report_input
      )
      .subscribe({
        next: (res: any) => {
          // Endpoint returns the listing array directly. Be defensive in case
          // the controller ever wraps it under { data }.
          const list: HolidayCampTransactionHistoryItem[] = Array.isArray(res)
            ? res
            : (res && res.data) || [];

          this.paidMemberList = list;
          this.paidMemberListtemp = JSON.parse(JSON.stringify(list));
          this.total_txns_amount = list.reduce(
            (acc, item) => acc + (parseFloat(item.total_amount_paid as any) || 0),
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

  goToDetailsPage(item: HolidayCampTransactionHistoryItem) {
    // Pass item info into the existing details page so the existing flow
    // continues to work for drill-down.
    this.navCtrl.push('HolidaycampaymentsdetailsPage', {
      info: {
        transaction_id: item.transaction_id,
        TransactionDate: item.transaction_date,
        ClubKey: item.club_id,
        AmountPaid: item.total_amount_paid,
        PaidBy: item.paidby
      }
    });
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
    // Map summary rows to a print-friendly shape (CampReportPrint expects
    // FirstName/LastName/CampName/ClubName/AmountPaid/PaidBy/TransactionDate).
    const memberList = this.paidMemberListtemp.map((mem) => ({
      FirstName: '',
      LastName: '',
      CampName: `${mem.holidaycamp_count} camps / ${mem.session_count} sessions`,
      ClubName: '',
      PaidBy: mem.paidby,
      AmountPaid: mem.total_amount_paid,
      DueAmount: 0,
      TransactionDate: mem.transaction_date,
      IsEnable: true
    }));
    this.navCtrl.push('CampReportPrint', {
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
          (item.transaction_id && String(item.transaction_id).toLowerCase().indexOf(lower) > -1) ||
          (item.paidby && String(item.paidby).toLowerCase().indexOf(lower) > -1) ||
          (item.transaction_date && String(item.transaction_date).toLowerCase().indexOf(lower) > -1)
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
    const el = document.querySelector('page-holidaycamppaymentreport');
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

// Response shape returned by paymentreport/holidaycampPayment_listing.
export class HolidayCampTransactionHistoryItem {
  transaction_id: string;
  parentclub_id: string;
  club_id?: string;
  transaction_date: string;
  paidby: string;
  session_count: number;
  holidaycamp_count: number;
  total_amount_paid: number;
}
