import { Component, Renderer2 } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController,AlertOptions, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { SharedServices } from '../../../services/sharedservice';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { CommonService } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { ClubVenueDto, CourtDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../shared/dtos/club.dto';
import { AppType, DeviceType } from '../../../../shared/constants/module.constants';
import { CommonRestApiDto } from '../../../../shared/model/common.model';
import { ClubActivity } from '../../../../shared/model/activity.model';
import { ThemeService } from '../../../../services/theme.service';

/**
 * Generated class for the RecuringbookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-recuringbooking',
  templateUrl: 'recuringbooking.html',
})
export class RecuringbookingPage {
  selectedParentClubKey:any = "";
  selectedClubKey:any = "";
  memberKey:any;
  currencyDetails:any = "";
  slotsType:boolean = false;nestUrl: string;
  cancelReason = "n/a";
  userKey: any;
  selectOptions:AlertOptions = {
    title:"",
    subTitle:"",
    mode:"ios"
  };
  clubs:ClubVenueDto[] = [];
  courts = [];
  ActivityList = [];
  selectedActivity = "";
  selectedCourt = "";
  is_initial:boolean = true;
  recuringBookDetails:any = [];
  daysDetails = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  isDarkTheme: boolean = true; // 🌗 Default dark theme
  // Each fetch below writes its own select's ngModel, and Ionic 3's BaseInput re-emits
  // (ionChange) on programmatic writes - which would re-trigger the next fetch on top of
  // the explicit chained call. These remember the last inputs each fetch ran for.
  private activityFetchClubKey: string = null;
  private courtFetchActivityKey: string = null;
  private recurringFetchCourtKey: string = null;
  constructor(public navCtrl: NavController,public http: HttpClient, 
    public navParams: NavParams,public storage: Storage,
    public fb: FirebaseService,public commonService: CommonService,
    public alertCtrl: AlertController,public sharedService: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl:ToastController, private httpService: HttpService,
    private renderer: Renderer2, private themeService: ThemeService, public events: Events) {
    // this.storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   this.userKey = val.$key
    //   for (let user of val.UserInfo) {
    //     this.nestUrl = this.sharedService.getnestURL()
    //     this.selectedParentClubKey = user.ParentClubKey;
    //     this.selectedClubKey = user.ClubKey;
    //     this.memberKey = user.MemberKey;
    //     this.getClubDetails();
      
    //     break;
    //   }
    // }).catch(error => {

    // });
    // this.storage.get('Currency').then((val) => {
    //   this.currencyDetails = JSON.parse(val);
    // }).catch(error => {
    // });
    this.selectOptions.mode = 'ios';
  }

  
 
  ionViewWillEnter(){
    // 🌗 Theme setup
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
    this.events.subscribe('theme:changed', (isDark) => this.applyTheme(isDark));

    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.userKey = val.$key
      for (let user of val.UserInfo) {
        this.nestUrl = this.sharedService.getnestURL()
        this.selectedParentClubKey = user.ParentClubKey;
        this.selectedClubKey = user.ClubKey;
        this.memberKey = user.MemberKey;
        this.getClubDetails();
      
        break;
      }
    }).catch(error => {

    });
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
  }

  getClubDetails() {
          // Allow one fetch of each stage per page entry even if the selections are unchanged.
          this.activityFetchClubKey = null;
          this.courtFetchActivityKey = null;
          this.recurringFetchCourtKey = null;
          const body: GetParentClubVenuesRequestDto = {
              parentclub_id: this.sharedService.getPostgreParentClubId(),
              app_type: AppType.ADMIN_NEW,
              device_type: this.sharedService.getPlatform() == 'android' ? 1 : 2,
              device_id: this.sharedService.getDeviceId() || 'web',
              updated_by: this.sharedService.getLoggedInUserId()
            };
        
            this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
              next: (res: GetParentClubVenuesResponseDto) => {
                this.clubs = res.data.map((club: ClubVenueDto) => ({ ...club, $key: club.FirebaseId, ClubKey: club.FirebaseId }));
                if (this.clubs.length > 0) {
                  this.selectedClubKey = this.clubs[0].FirebaseId;
                  this.getAllActivity();
                }else{
                  this.ActivityList = [];
                  this.selectedActivity = "";
                }
              },
              error: (err) => {
                this.clubs = [];
              }
            });
  }
  
  getAllActivity() {
    if (this.activityFetchClubKey === this.selectedClubKey) {
      return;
    }
    this.activityFetchClubKey = this.selectedClubKey;

    // The club select binds the Firebase club id, but club_activity/get_club_activities is
    // keyed on postgres ids - bridge the two via the clubs list (ClubVenueDto has both).
    const selectedClub = this.clubs.find((club: ClubVenueDto) => club.FirebaseId === this.selectedClubKey);
    const body: CommonRestApiDto & { updated_by: string } = {
      parentclubId: this.sharedService.getPostgreParentClubId(),
      clubId: selectedClub ? selectedClub.Id : '',
      activityId: '',
      memberId: this.sharedService.getLoggedInUserId(),
      action_type: 0,
      device_type: this.sharedService.getPlatform() == 'android' ? DeviceType.ANDROID : DeviceType.IOS,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedService.getDeviceId() || '',
      updated_by: this.sharedService.getLoggedInUserId()
    };

    this.httpService.post(API.CLUB_ACTIVITIES, body).subscribe({
      next: (res: any) => {
        const clubActivities: ClubActivity[] = (res && res.data && res.data.club_activities) ? res.data.club_activities : [];
        // Drop the placeholder rows this endpoint returns (activity_key "undefined", null
        // activity/name) - courts are keyed on activity_key, so a row without one is unusable.
        const activities = clubActivities
          .filter((activity) => activity && activity.activity_key && activity.activity_key !== 'undefined'
            && (activity.alias_name || activity.activity_name))
          // Keep $key / ActivityName so the template and court lookup stay unchanged.
          .map((activity) => ({
            ...activity,
            $key: activity.activity_key,
            ActivityName: activity.alias_name || activity.activity_name
          }));
        if (activities.length > 0) {
          this.ActivityList = activities;
          this.selectedActivity = this.ActivityList[0].$key;
          this.getAllCourts();
        } else {
          this.ActivityList = [];
          this.selectedActivity = "";
          this.courts = [];
          this.selectedCourt = "";
          this.recuringBookDetails = [];
        }
      },
      error: () => {
        this.ActivityList = [];
        this.selectedActivity = "";
      }
    });
  }
  getAllCourts(){
    if (!this.selectedActivity) {
      this.courts = [];
      this.selectedCourt = "";
      this.recuringBookDetails = [];
      return;
    }
    if (this.courtFetchActivityKey === this.selectedActivity) {
      return;
    }
    this.courtFetchActivityKey = this.selectedActivity;
    // courtbooking/getAllCourts is keyed on Firebase ids, which is what all three
    // of these already hold.
    const params = {
      activity: this.selectedActivity,
      clubKey: this.selectedClubKey,
      parentClubKey: this.selectedParentClubKey
    };
    this.httpService.get(API.GET_ALL_COURTS, params, null, 1).subscribe({
      next: (res: any) => {
        const allCourts: CourtDto[] = (res && res.data) ? res.data : [];
        const courts = allCourts
          // Preserves the IsActive filter the previous Firebase query applied.
          .filter((court) => court && court.IsActive && court.firebasekey)
          // Keep $key so the template and the recurring lookup stay unchanged.
          .map((court) => ({ ...court, $key: court.firebasekey }));
        if (courts.length > 0) {
          this.courts = courts;
          // Recurring bookings target one specific court (there is no "All" option on
          // this page), so the first court stays the default.
          this.selectedCourt = this.courts[0].$key;
          this.recuringBookDetails = [];
          this.getrecuringBookDetails();
        } else {
          this.courts = [];
          this.selectedCourt = "";
          this.recuringBookDetails = [];
        }
      },
      error: () => {
        this.courts = [];
        this.recuringBookDetails = [];
      }
    });
  }
  // getrecuringBookDetrails(){
  //   this.fb.getAllWithQuery("CourtBooking/RecuringBooking/"+this.selectedParentClubKey+"/"+this.selectedClubKey+"/"+this.selectedActivity,{orderByChild:'CourtKey',equalTo:this.selectedCourt}).subscribe((data)=>{
  //     this.recuringBookDetails = [];
      
  //     for(let i = 0; i <  data.length ;i++){
  //       if(data[i].IsActive == true){
  //         if(new Date(data[i].EndDate).getTime() >= new Date().getTime()){
  //           let tempSet:Set<string> = new Set<string>();
  //           data[i].bookingDays = data[i].BookingDays
  //           let dayDetail = data[i].BookingDays.split(",");
  //           for(let k = 0 ; k < dayDetail.length ; k++){
  //             tempSet.add(dayDetail[k]);
  //           }
           
  //           data[i].BookingDays = tempSet;
  //         this.recuringBookDetails.push(data[i]);
  //         }
  //       }
  //     }
  //   })
  // }

  getrecuringBookDetails(){
    if (!this.selectedCourt) {
      this.recuringBookDetails = [];
      return;
    }
    if (this.recurringFetchCourtKey === this.selectedCourt) {
      return;
    }
    this.recurringFetchCourtKey = this.selectedCourt;
    this.commonService.showLoader('Please wait');
    const url = `${API.GET_RECURRING_LIST}/${this.selectedParentClubKey}/${this.selectedCourt}`;
    
    this.httpService.get(url, null, null, 1).subscribe({
      next: (data:any) => {
        this.recuringBookDetails = []
        this.commonService.hideLoader()
        const activityname = this.ActivityList.filter((act) => this.selectedActivity == act.$key)[0].ActivityName

        for(let i = 0; i <  data.data.length ;i++){
          if(new Date(data.data[i].enddate).getTime() >= new Date().getTime()){
            const tempSet:Set<string> = new Set<string>();
            data.data[i].startdate = moment.utc(data.data[i].startdate).local().format('D-MMM-YY')
            data.data[i].enddate = moment.utc(data.data[i].enddate).local().format('D-MMM-YY')
            const dayDetail = data.data[i].bookingdays.split(",");
            for(let k = 0 ; k < dayDetail.length ; k++){
              if (dayDetail[k] != " "){
                tempSet.add(dayDetail[k]);
              }
            }
            data.data[i]['activityname'] = activityname
            data.data[i].bookingdays = tempSet;
            this.recuringBookDetails.push(data.data[i]);
          }
        }
        this.is_initial = false;
      },
      error: (err) => {
        console.log(err)
        this.commonService.hideLoader() 
        this.commonService.toastMessage("Unable to get recurrings", 2000)
      }
    })
  }


  // On Club selection change. Bound to the select's (ionChange) rather than each
  // ion-option's (ionSelect), so the fetch happens when the value is committed (OK)
  // instead of the moment a radio is tapped. ngModel has already written the value.
  onClubChange(){
    this.getAllActivity();
  }

  //On Activity selection change
  onActivityChange(){
    this.getAllCourts();
  }

  //On Court selection change
  onCourtChange(){
    this.getrecuringBookDetails();
  }




  getTime(time){
    return moment(time).format('D-MMM-YY');;
  }
  addRecuringBooking(){
    this.navCtrl.push("AddrecuringbookingPage");
  }
  presentActionSheet(info) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Delete Booking',
          handler: () => {
            console.log(info);
            this.showConfirm(info);
          }
        }
        // {
        //   text: 'Close',
        //   role: 'cancel',
        //   handler: () => {
        //     console.log('Close clicked');
        //   }
        // }
      ]
    });
 
    actionSheet.present();
  }
  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
        message: m,
        duration: howLongShow,
        position: 'bottom'
    });
    toast.present();
  }
  showConfirm(info) {
    const confirm = this.alertCtrl.create({
      title: 'Are you sure?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'yes',
          handler: async() => {
            //this.fb.update(info.$key,"CourtBooking/RecuringBooking/"+info.ParentClubKey+"/"+info.ClubKey+"/"+info.ActivityKey,{IsActive:false});
            //await this.cancelrecurring(info.$key, info.ParentClubKey, info.ClubKey, info.ActivityKey, info.CourtKey, info.bookingDays, info.EndTime, info.EndDate, info.StartTime, info.StartDate, info.BookingFor, this.userKey, this.cancelReason)
            await this.cancelrecurring_v2(info.Id,this.userKey, this.cancelReason)
            this.showToast("Successfully deleted",2000);
          }
        }
      ]
    });
    confirm.present();
  }
  getFirst(name:string){
    return name.charAt(0);
  }

  cancelrecurring(recurringkey, parentclubkey, clubkey, activitykey, courtkey, bookingdays, endtime, enddate, starttime, startdate, bookingfor, cancelBy, cancelReason){
    return new Promise((resolve, reject) =>{
      const data = {
        recurringkey,
        parentclubkey,
        clubkey,
        activitykey,
        courtkey,
        bookingdays,
        endtime,
        enddate,
        starttime,
        startdate,
        bookingfor,
        cancelBy,
        cancelReason
      }
      
      this.httpService.put(API.CANCEL_RECURRING_V3, data, null, 1).subscribe({
        next: (res) => {
          resolve('success')
          this.commonService.hideLoader()
        },
        error: (err) => {
          console.log(err)
          this.commonService.hideLoader() 
          this.commonService.toastMessage("Unable to create recurring slot", 2000)
          reject('fail')
        }
      })
    })
  }

  cancelrecurring_v2(id,cancelBy, cancelReason){
    return new Promise((resolve, reject) =>{
      const data = {
        id,
        cancelBy,
        cancelReason
      }
      
      this.httpService.put(API.CANCEL_RECURRING_BY_ID, data, null, 1).subscribe({
        next: (res) => {
          resolve('success')
          this.commonService.hideLoader()
          this.navCtrl.pop()
        },
        error: (err) => {
          console.log(err)
          this.commonService.hideLoader() 
          this.commonService.toastMessage("Unable to cancel recurring slot", 2000)
          reject('fail')
        }
      })
    })
  }

  // 🌗 Theme: load persisted preference and apply
  async loadTheme() {
    const isDarkTheme = await this.storage.get('dashboardTheme');
    const isDark = isDarkTheme !== null ? isDarkTheme : true;
    this.isDarkTheme = isDark;
    this.applyTheme(isDark);
  }

  // 🌗 Theme: toggle light-theme class on the page element
  applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const pageElement = document.querySelector('page-recuringbooking');
    if (pageElement) {
      isDark ? this.renderer.removeClass(pageElement, 'light-theme')
             : this.renderer.addClass(pageElement, 'light-theme');
    }
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

}
