import { FirebaseService } from '../../../../services/firebase.service';
import { Component, ViewChild, Renderer2, ElementRef, } from '@angular/core';
import { NavController, PopoverController, Platform, ActionSheetController, Slides, Content } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';

import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import * as moment from 'moment';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import { payment_email } from '../../payment/model/report.model';
import { ModuleReportTypeForEmail } from '../../mailtomemberbyadmin/mailtomemberbyadmin';
import { ThemeService } from '../../../../services/theme.service';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../shared/dtos/club.dto';
import { GetMembershipsByClubRequestDto, GetMembershipsByClubResponseDto } from './membershipreport.dto';

/**
 * Generated class for the MembershipreportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-membershipreport',
  templateUrl: 'membershipreport.html',
})
export class MembershipreportPage {
  @ViewChild('myslider') myslider: Slides;
  @ViewChild(Content) content: Content;
  isSearchEnabled: boolean = false;
  isDarkTheme: boolean = true;
  isFirstTime: boolean = true;
  paymentReportType: any;
  LangObj: any = {};//by vinod
  isMonthSelected: boolean = false;
  TotTransc: number = 0;
  TotTrnsAmt: any = 0.0;

  TotDueTrnsAmt: any = 0.0;
  TotDueTransc: number = 0;
  showTypeVal: any = "paid";
  dueMemberList = [];
  paidMemberListtemp = [];
  dueMemberListtemp = [];
  pendingVerificationMemberList = [];
  pendingVerificationMemberListtemp = [];

  //paymentObj = { parentClubKey: "", MemberShipKey:"All", clubKey : "All", StartDate:"",EndDate:"",SelectedMonth:"", SearchCriteria:"Days"};
  paymentObj = { parentClubKey: "", membershipKey: "All", clubKey: "All", searchCriteria: {} };
  nodeUrl: string = "";
  currentFinacialYearTermList = [];
  financialYear1Key: any;
  financialYear1: any;
  termKey = "";
  themeType: number;
  isAndroid: boolean = false;

  reportType = "Paid";
  coachKey: any;
  parentClubKey: any;

  obj = {
    Message: ''
  }
  sessionFolder = [];
  clubs: ClubVenueDto[] = [];
  selectedClub = "All";
  selectedCurrentClub = "";
  coaches = [];
  memberships = [];
  selectedCoach = "";
  MembershipKey = "";
  selectedCurrentCoach = "";
  memberList = [];
  sessionDetails = [];
  sessionDetailsCurrentTerm = [];
  amountPaid = "0.00";
  amountDue = "0.00";
  currentAmountPaid = "0.00";
  currentAmountDue = "0.00";
  duecount: number;
  paidcount: number;
  userData: any = {};
  isDateRange: boolean = false;
  paidMemberList: Array<any> = [];
  startDate: any;
  endDate: any;
  maxDate: any;
  minDate: any;
  currencyDetails: any = "";
  constructor(public events: Events, public sharedService: SharedServices, public commonService: CommonService, platform: Platform, public storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,
    private renderer: Renderer2, private elementRef: ElementRef, private http: HttpClient, public actionSheetCtrl: ActionSheetController, private themeService: ThemeService, private httpService: HttpService) {
    
    this.userData = this.sharedService.getUserData();
    this.themeType = sharedservice.getThemeType();
    this.nodeUrl = this.sharedService.getnestURL()
    this.isAndroid = platform.is('android');
    console.log(this.isAndroid);
    this.reportType = "Paid";

    this.startDate = moment((moment().subtract(10, 'days'))).format("YYYY-MM-DD");;
    this.endDate = moment().format("YYYY-MM-DD")
    // let now = moment().add(10, 'year');
    // this.maxDate = moment(now).format("YYYY-MM-DD");
    // this.minDate = this.endDate;

    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });

    this.loadTheme();

  }

  startdateChanged() {
    //this.weeklySessionObj.NoOfWeeks = Math.ceil( this.days.length / 7);
  }
  // validateSessionDate() {
  //   if (new Date(this.startDate).getTime() > new Date(this.endDate).getTime()) {
  //     //this.showToast("Session start date should be greater than end date.", 5000);
  //     return false;
  //   }
  //   return true;
  // }



  trnsMonths: Array<any> = [];
  ionViewWillEnter() {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getClubList();
        this.getMembershipDetails();
      }
    });

  }


  scrollContent: any
  ionViewDidLoad() {
    this.scrollContent = this.elementRef.nativeElement.getElementsByClassName('scroll-content')[0];
    

    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });

  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      //console.log(res["data"]);
      this.LangObj = res.data;
    })
  }

  slideChanged() {

  }

  SelectedMonth(index: number) {
    this.isDateRange = false;
    this.TotTrnsAmt = 0.0;
    this.isMonthSelected = true;
    this.trnsMonths[index].IsActive = true;

    if (this.trnsMonths[index].IsActive) {
      this.trnsMonths.filter((item, itemIndex) =>
        itemIndex != index
      ).map((item) => {
        item.IsActive = false;
      });
    }

    this.paymentReportType = `${this.trnsMonths[index].month}-${this.trnsMonths[index].year}`;
    if (this.trnsMonths[index].year == "Days") {
      this.paymentObj.searchCriteria["type"] = "DAYS";
      this.paymentObj.searchCriteria["numberOfDays"] = 7;
      this.getMembershipDetails();
    } else if (this.trnsMonths[index].year == "") {
      this.paymentObj.searchCriteria["type"] = "CUSTOM";
      this.paymentObj.searchCriteria["startDate"] = this.startDate;
      this.paymentObj.searchCriteria["endDate"] = this.endDate;
      this.isDateRange = true;
      this.getMembershipDetails();
    } else {
      this.paymentObj.searchCriteria["type"] = "MONTH";
      this.paymentObj.searchCriteria["monthWithYear"] = `${this.trnsMonths[index].month}-${this.trnsMonths[index].year}`;
      this.getMembershipDetails();
    }

    

  }

  ChooseDates() {

  }



  cancel() {
    this.navCtrl.pop();
  }
  pay() {

  }

  paymentTabClick(type: string) {
    console.log(this.reportType);
    console.log(this.dueMemberListtemp.length);
    if (this.reportType == "Paid") {

      this.showType('Paid');
      // if (this.isAndroid) {
      //   this.renderer.removeClass(this.scrollContent, "androidMargin");
      // } else {
      //   this.renderer.removeClass(this.scrollContent, "iosMargin");
      // }
    } else {

      this.showType('Due');
      // if (this.isAndroid) {
      //   this.renderer.addClass(this.scrollContent, "androidMargin");
      // } else {
      //   this.renderer.addClass(this.scrollContent, "iosMargin");
      // }

    }

  }


  getClubList() {
    const body: GetParentClubVenuesRequestDto = {
      parentclub_id: this.sharedService.getPostgreParentClubId(),
      app_type: AppType.ADMIN_NEW,
      device_type: this.sharedService.getPlatform() == 'android' ? 1 : 2,
      device_id: this.sharedService.getDeviceId() || 'web',
      updated_by: this.sharedService.getLoggedInUserId()
    };
    this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
      next: (res: GetParentClubVenuesResponseDto) => {
        this.clubs = (res.data || []).filter(c => c.IsEnable);
        this.selectedClub = "All";
        this.selectedCurrentClub = "All";
      }
    });
  }

  Search(){
    this.getMembershipDetails();
  }

  getMembershipDetails() {
    this.commonService.showLoader("Please wait");

    const club = this.clubs.find(c => c.FirebaseId === this.selectedClub);
    const body: GetMembershipsByClubRequestDto = {
      parentclub_id: this.sharedService.getPostgreParentClubId(),
      club_id: club ? club.Id : '',
      start_date: this.startDate,
      end_date: this.endDate,
      action_type: 1,
      device_type: this.sharedService.getPlatform() === 'android' ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedService.getDeviceId() || '',
      updated_by: this.sharedService.getLoggedInUserId() || ''
    };

    this.httpService.post(API.GET_MEMBERSHIPS_BY_CLUB, body).subscribe((res: GetMembershipsByClubResponseDto) => {
      this.commonService.hideLoader();
      this.paidMemberList = res.data.paid || [];
      this.dueMemberList = res.data.pending || [];
      this.TotTransc = res.data.paid_count;
      this.TotDueTransc = res.data.pending_count;
      this.TotTrnsAmt = this.paidMemberList.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0).toFixed(2);
      this.TotDueTrnsAmt = this.dueMemberList.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0).toFixed(2);
      this.paidMemberListtemp = JSON.parse(JSON.stringify(this.paidMemberList));
      this.dueMemberListtemp = JSON.parse(JSON.stringify(this.dueMemberList));
    }, (err) => {
      this.commonService.hideLoader();
      this.commonService.toastMessage(err.message || 'Failed to fetch memberships', 2500, ToastMessageType.Error);
    });
  }





  onChangeOfClub() {
    this.getMembershipDetails();
  }
  // onChangeOfCoach() {
  //   this.amountDue = "0.00";
  //   this.amountPaid = "0.00";
  //   if (this.selectedCoach != "All") {
  //     this.paymentObj.CoachKey = this.selectedCoach;

  //     this.getMembershipDetails();

  //   }

  // }
  
  //-KpyPVVvqEJ_g_i77biY
  //KpyPVVvqEJ_g_i77biY
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  goToPaymentDetailsListPage() {
    this.navCtrl.push("PaymentDetails", { AllSessionLists: this.sessionDetails, AllClubs: this.clubs, SelectedClub: this.selectedClub, SelectedCoach: this.selectedCoach, ReportType: "Overall", TermKey: this.termKey });
    console.log(this.sessionDetails);
    console.log(this.clubs);
  }

  goToCurrentPaymentDetailsListPage() {
    this.navCtrl.push("PaymentDetails", { AllSessionLists: this.sessionDetailsCurrentTerm, AllClubs: this.clubs, SelectedClub: this.selectedCurrentClub, SelectedCoach: this.selectedCurrentCoach, ReportType: "CurrentTerm", TermKey: this.termKey });
  }

  
  slectedList: Array<any> = [];
  showType(val) {
    if (val == 'Paid') {
      this.showTypeVal = ShowType.Paid;
      let data = [];
      this.paidMemberListtemp.forEach((paidMember) => {
        if (paidMember.isMonthlySes) {
          if (paidMember.MonthsPaidFor.length > 0) {
            paidMember.MonthsPaidFor.forEach((monthlySes) => {
              monthlySes["coachName"] = paidMember.CoachName;
              monthlySes["FirstName"] = paidMember.FirstName;
              monthlySes["LastName"] = paidMember.LastName;
              monthlySes["SessionName"] = paidMember.SessionName;
              monthlySes["ClubName"] = paidMember.ClubName;
              data.push(monthlySes);
            });
          }
        } else {
          data.push(paidMember);
        }
      });
      this.slectedList = JSON.parse(JSON.stringify(data));
    } else if (val == 'Due') {
      this.showTypeVal = ShowType.Due;
      let data = [];
      this.dueMemberListtemp.forEach((dueMember) => {
        if (dueMember.isMonthlySes) {
          if (dueMember.MonthsNeedtoPay.length > 0) {
            dueMember.MonthsNeedtoPay.forEach((monthlySes) => {
              monthlySes["coachName"] = dueMember.CoachName;
              monthlySes["FirstName"] = dueMember.FirstName;
              monthlySes["LastName"] = dueMember.LastName;
              monthlySes["SessionName"] = dueMember.SessionName;
              monthlySes["ClubName"] = dueMember.ClubName;
              data.push(monthlySes);
            });
          }
        } else {
          data.push(dueMember);
        }
      });
      //this.dueMemberListtemp = data;
      this.slectedList = data;
    }
  }



  //print
  goToPrint() {
    this.navCtrl.push('PrintmembershipPage', {
      showType: this.showTypeVal,
      memberList: this.reportType == "Due" ? this.dueMemberListtemp:this.paidMemberListtemp,
      parentClubKey: this.parentClubKey,
      reportType: this.paymentReportType
    });
  }
  
  sendMailStatus() {
    console.log(this.reportType)
    //let  memberList = this.reportType == "Due"?this.dueMemberListtemp:this.paidMemberListtemp
    // let memberList = this.slectedList;
    // this.navCtrl.push("PaymentstatusemailPage", {
    //   memberList: this.reportType == "Due" ? this.dueMemberListtemp:this.paidMemberListtemp,
    //   type: this.reportType,
    //   parentclubKey: this.parentClubKey
    // })

    try{
          console.log(this.reportType)
          const reportList = this.reportType == "Due" ? this.dueMemberListtemp : this.paidMemberListtemp;
          if(reportList.length == 0){
            this.commonService.toastMessage("No records found", 2500, ToastMessageType.Error)
            return false;
          }
          const member_list = reportList.map((member,index) => {
            return {
                IsChild:false,
                ParentId:"",
                MemberId:member.user.Id,
                MemberEmail:"",
                MemberName: member.user.FirstName + " " + member.user.LastName
            }
          })
        
          const email_modal = {
              module_info:null,
              email_users:member_list,
              type:ModuleReportTypeForEmail.MEMBERSHIP,
          }
          this.navCtrl.push("PaymentstatusemailPage", { email_modal });
        }catch(err){
          this.commonService.toastMessage("Something went wrong", 2500, ToastMessageType.Error)
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
    const el = document.querySelector('page-membershipreport');
    if (el) {
      if (this.isDarkTheme) { el.classList.remove('light-theme'); } else { el.classList.add('light-theme'); }
    }
  }


}




enum ShowType {
  Paid = 'paid',
  Due = "due",
  Pending = "pending"
}
