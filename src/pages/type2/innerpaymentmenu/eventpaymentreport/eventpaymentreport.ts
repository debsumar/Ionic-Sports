import { Component, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { NavController, PopoverController, ActionSheetController, LoadingController, Slides, Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import * as moment from 'moment';
import { IonicPage } from 'ionic-angular';
import gql from 'graphql-tag';
import { HttpService } from '../../../../services/http.service';
import { GraphqlService } from '../../../../services/graphql.service';
import { ThemeService } from '../../../../services/theme.service';
import { IClubDetails } from '../../../../shared/model/club.model';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { API } from '../../../../shared/constants/api_constants';
import { SharedServices } from '../../../services/sharedservice';
import { AppType } from '../../../../shared/constants/module.constants';

@IonicPage()
@Component({
  selector: 'eventpaymentreport-page',
  templateUrl: 'eventpaymentreport.html',
  providers: [HttpService]
})
export class EventPaymentReport {
  @ViewChild('myslider') myslider: Slides;
  @ViewChild(Content) content: Content;
  isDateRange: boolean = true;
  isSearchEnabled: boolean = false;
  isDarkTheme: boolean = true;
  isMonthSelected: boolean = false;
  LangObj: any = {};
  total_txns: number = 0;
  total_txns_amount: number = 0.00;
  postgre_parentclub_id: string = '';

  report_input = {
    parentclubId: "",
    parentclub_id: "",
    clubId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    start_date: "",
    end_date: "",
    status: 1
  };

  parentClubKey: string = "";
  clubs: IClubDetails[];
  selectedClub = "";
  userData: any = {};
  startDate: any;
  endDate: any;
  isTransactionsAvail: boolean = true;
  currencyDetails: any = "";
  trnsMonths: Array<any> = [];
  paidMemberList: Array<EventPaymentReportRes> = [];
  paidMemberListtemp: EventPaymentReportRes[] = [];

  constructor(public events: Events,
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
    private themeService: ThemeService) {
    this.setupInitialConfig();
    this.loadTheme();
  }

  ngOnInit() {
    this.initializeMonths();
    this.loadUserData();
  }

  async setupInitialConfig() {
    const [login_obj, postgre_parentclub] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
    ]);
    if (postgre_parentclub) {
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.userData = this.sharedservice.getUserData();
      this.getClubList();
      this.startDate = moment().subtract(10, 'days').format("YYYY-MM-DD");
      this.endDate = moment().format("YYYY-MM-DD");
      this.report_input.start_date = this.startDate;
      this.report_input.end_date = this.endDate;
      this.report_input.parentclubId = postgre_parentclub.Id;
      this.report_input.parentclub_id = postgre_parentclub.Id;
      this.report_input.app_type = AppType.ADMIN_NEW;
      this.report_input.device_id = this.sharedservice.getDeviceId();
      this.report_input.updated_by = this.sharedservice.getLoggedInUserId();
      this.report_input.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    }
  }

  private initializeMonths() {
    for (let i = 0; i < 4; i++) {
      let check = moment().subtract(i, 'months');
      let month = check.format('MMM');
      let year = check.format('YYYY');
      this.trnsMonths.push({ month: month, year: year, IsActive: false });
    }
    this.trnsMonths.reverse();
    this.trnsMonths.push({ month: "7", year: "Days", IsActive: false });
    this.trnsMonths.push({ month: "Dates", year: "", IsActive: true });
  }

  scrollContent: any;
  ionViewDidLoad() {
    this.scrollContent = this.elementRef.nativeElement.getElementsByClassName('scroll-content')[0];
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
  }

  private loadUserData() {
    this.storage.get('userObj').then((val) => {
      if (val) {
        val = JSON.parse(val);
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
    });

    this.storage.get('Currency').then((val) => {
      this.currencyDetails = val ? JSON.parse(val) : null;
    }).catch((error) => console.error('Currency fetch error:', error));
  }

  getPayment(): void {
    this.httpService.post<{ message: string, data: EventPaymentReportRes[] }>(`${API.EVENT_PAYMENT_REPORT}`, this.report_input)
      .subscribe({
        next: (res) => {
          this.paidMemberList = res.data;
          this.paidMemberListtemp = JSON.parse(JSON.stringify(this.paidMemberList));
          this.total_txns_amount = this.paidMemberList.reduce((accumulator, item) => { return accumulator += (+item.amount_paid) }, 0);
          this.total_txns = this.paidMemberListtemp.length;
        },
        error: () => {
          this.commonService.toastMessage('Failed to fetch payment', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });
  }

  public SelectedMonth(index: number) {
    this.isDateRange = false;
    this.isTransactionsAvail = false;
    this.total_txns_amount = 0.0;
    this.isMonthSelected = true;
    this.trnsMonths[index].IsActive = true;

    this.trnsMonths.forEach((item, itemIndex) => {
      if (itemIndex !== index) item.IsActive = false;
    });
    const selectedMonth = this.trnsMonths[index];
    if (selectedMonth.year === "Days") {
      this.report_input.start_date = moment().subtract(7, 'days').format("YYYY-MM-DD");
      this.report_input.end_date = moment().format("YYYY-MM-DD");
    } else if (selectedMonth.year === "") {
      this.isDateRange = true;
      this.report_input.start_date = moment().subtract(10, 'days').format("YYYY-MM-DD");
      this.report_input.end_date = moment().format("YYYY-MM-DD");
    } else {
      const startOfMonth = moment(`${selectedMonth.year}-${selectedMonth.month}-01`).startOf('month');
      const endOfMonth = moment(startOfMonth).endOf('month');
      this.report_input.start_date = startOfMonth.format("YYYY-MM-DD");
      this.report_input.end_date = endOfMonth.format("YYYY-MM-DD");
    }
    this.getPayment();
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      this.LangObj = res.data;
    });
  }

  cancel() {
    this.navCtrl.pop();
  }

  Search() {
    if (moment(this.startDate).isAfter(this.endDate)) {
      this.commonService.toastMessage("end should not be greaterthan start date", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    } else {
      this.report_input.start_date = this.startDate;
      this.report_input.end_date = this.endDate;
      this.getPayment();
    }
  }

  getClubList() {
    const clubs_input = {
      parentclub_id: this.postgre_parentclub_id,
      user_postgre_metadata: {
        UserMemberId: this.sharedservice.getLoggedInUserId()
      },
      user_device_metadata: {
        UserAppType: 0,
        UserDeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2
      }
    };
    const clubs_query = gql`
        query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
          getVenuesByParentClub(clubInput:$clubs_input){
                Id
                ClubName
                FirebaseId
                MapUrl
                sequence
            }
        }
        `;
    this.graphqlService.query(clubs_query, { clubs_input: clubs_input }, 0)
      .subscribe((res: any) => {
        this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
        if (this.clubs.length != 0) {
          this.selectedClub = "All";
        }
      },
        (error) => {
          this.commonService.toastMessage("No venues found", 2500, ToastMessageType.Error);
          console.error("Error in fetching:", error);
        });
  }

  onChangeOfClub() {
    if (this.selectedClub == "All") {
      this.report_input.clubId = "";
    } else {
      this.report_input.clubId = this.selectedClub;
    }
    this.paidMemberList = [];
    this.getPayment();
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  getFilterItems(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() != '') {
      this.paidMemberListtemp = this.paidMemberList.filter((item) => {
        if (item.FirstName != undefined && item.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
          return true;
        }
        if (item.LastName != undefined && item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
          return true;
        }
        if (item.event_name != undefined && item.event_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
          return true;
        }
        if (item.club_name != undefined && item.club_name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
          return true;
        }
        if (item.paidby != undefined && item.paidby.toLowerCase().indexOf(val.toLowerCase()) > -1) {
          return true;
        }
      });
    } else {
      this.paidMemberListtemp = this.paidMemberList;
    }
  }

  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme !== null ? isDarkTheme : true;
      this.applyTheme();
    }).catch(() => { this.isDarkTheme = true; this.applyTheme(); });
    this.events.subscribe('theme:changed', (isDark) => { this.isDarkTheme = isDark; this.applyTheme(); });
  }

  applyTheme() {
    const el = document.querySelector('eventpaymentreport-page');
    if (el) {
      if (this.isDarkTheme) { el.classList.remove('light-theme'); } else { el.classList.add('light-theme'); }
    }
  }
}

export class EventPaymentReportRes {
  event_id: string;
  member_id: string;
  is_child: boolean;
  event_name: string;
  FirstName: string;
  LastName: string;
  tickets_bought: number;
  paidby: string;
  txn_date: string;
  transaction_id?: string;
  amount_paid?: number;
  email_id: string;
  phone_number: string;
  parentclub_id: string;
  parentclub_name: string;
  club_id?: string;
  club_name?: string;
}
