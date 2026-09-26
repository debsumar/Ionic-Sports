import { SharedServices } from './../../../services/sharedservice';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController} from 'ionic-angular';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { HttpClient } from '@angular/common/http';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { API } from '../../../../shared/constants/api_constants';
import { HttpService } from '../../../../services/http.service';
import { ThemeService } from '../../../../services/theme.service';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../shared/dtos/club.dto';
import { AppType, DeviceType } from '../../../../shared/constants/module.constants';
import { CommonRestApiDto } from '../../../../shared/model/common.model';
import { ClubActivity } from '../../../../shared/model/activity.model';
/**
 * Generated class for the FilterbookingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filterbookings',
  templateUrl: 'filterbookings.html',
})
export class FilterbookingsPage {
  @ViewChild('slides') slides: Slides;
  showCurrentDate: string;
  numbers = [0,1,2];
  sevenDaysAvailability: any = [];
  currentmonth: string;
  showCalender = false;
  loading: any;
  selectedParentClubKey: any;
  selectedClubKey: any;
  clubs: any[];
  ActivityList: any[];
  selectedActivity: string;
  allCourtSlots: any;
  courts: any[];
  slotListing = [];
  isDarkTheme: boolean = true;
  // Club the current ActivityList was fetched for - guards against the duplicate
  // (ionChange) Ionic re-fires when selectedClubKey is written programmatically.
  private activityFetchClubKey: string = null;
  Isgotosession: boolean = false;
  currencyDetails: any;
  constructor(public navCtrl: NavController, 
    public storage: Storage, public sharedService: SharedServices,
     public http: HttpClient, 
    public fb: FirebaseService, public commonService: CommonService,  
    public loadingCtrl: LoadingController,  public navParams: NavParams,
    private httpService: HttpService, private themeService: ThemeService) {
    
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        this.selectedParentClubKey = user.ParentClubKey;
      
       
       
        this.getClubDetails() 
        //this.getSevenDaysAvailability(new Date())
        
        this.currentmonth = moment(new Date()).format("MMM YYYY")

        break;
      }
    }).catch(error => {

    });

    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
  }

  ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme();
    });
  }

  ionViewDidLoad() {
   
  }

  getAllCourts() {
    this.fb.getAllWithQuery("Court/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity, { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
      this.courts = [];
    
      if (data.length > 0) {
        this.courts = data;
        var d = moment().startOf('week').format("DD MMM YYYY")
        console.log(d)
        this.currentmonth = moment().format("MMM YYYY")
        let date = moment().format('YYYY-MM-DD')
        this.calculateweek(d, date)
      }else{
        this.slotListing = []
      }
     
    });
  }
    

  getClubDetails() {
    // Allow one activity fetch per page entry even if the club is unchanged.
    this.activityFetchClubKey = null;
    const body: GetParentClubVenuesRequestDto = {
      parentclub_id: this.sharedService.getPostgreParentClubId(),
      app_type: AppType.ADMIN_NEW,
      device_type: this.sharedService.getPlatform() == 'android' ? DeviceType.ANDROID : DeviceType.IOS,
      device_id: this.sharedService.getDeviceId() || 'web',
      updated_by: this.sharedService.getLoggedInUserId()
    };

    this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
      next: (res: GetParentClubVenuesResponseDto) => {
        // Keep $key/ClubKey so the template and the Firebase court path stay unchanged.
        this.clubs = res.data.map((club: ClubVenueDto) => ({ ...club, $key: club.FirebaseId, ClubKey: club.FirebaseId }));
        if (this.clubs.length > 0) {
          this.selectedClubKey = this.clubs[0].FirebaseId;
          this.getAllActivity();
        }
      },
      error: () => {
        this.clubs = [];
      }
    });
  }
  getAllActivity() {
    // Ionic re-fires (ionChange) when selectedClubKey is written programmatically in
    // getClubDetails(), which would call this endpoint twice per page entry.
    if (this.activityFetchClubKey === this.selectedClubKey) {
      return;
    }
    this.activityFetchClubKey = this.selectedClubKey;

    // The club select binds the Firebase club id, but club_activity/get_club_activities
    // is keyed on postgres ids - bridge the two via the clubs list (ClubVenueDto has both).
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
        this.ActivityList = [];
        this.selectedActivity = "";
        const clubActivities: ClubActivity[] = (res && res.data && res.data.club_activities) ? res.data.club_activities : [];
        // Drop the placeholder rows this endpoint returns (activity_key "undefined", null
        // activity/name) - courts are keyed on activity_key, so a row without one is unusable.
        this.ActivityList = clubActivities
          .filter((activity) => activity && activity.activity_key && activity.activity_key !== 'undefined'
            && (activity.alias_name || activity.activity_name))
          // Keep $key / ActivityName so the template and the court lookup stay unchanged.
          .map((activity) => ({
            ...activity,
            $key: activity.activity_key,
            ActivityName: activity.alias_name || activity.activity_name
          }));
        if (this.ActivityList.length > 0) {
          this.selectedActivity = this.ActivityList[0].$key;
          this.getAllCourts();
        }
      },
      error: () => {
        this.ActivityList = [];
        this.selectedActivity = "";
      }
    });
  }

  loadTheme() {
    this.isDarkTheme = this.themeService.getCurrentTheme();
    this.applyTheme();
  }

  applyTheme() {
    const pageElement = document.querySelector('page-filterbookings');
    if (pageElement) {
      pageElement.classList.remove('dark-theme', 'light-theme');
      pageElement.classList.add(this.isDarkTheme ? 'dark-theme' : 'light-theme');
    }
  }

    calculateweek(firstdayofweek, date){
      this.showCalender = false   
      this.sevenDaysAvailability = [];
      this.sevenDaysAvailability.push({
        day:moment(firstdayofweek).format('ddd'),
        month:moment(firstdayofweek).format('MMM'),
        date:moment(firstdayofweek).format('DD'),
        currentDate:moment(firstdayofweek).format('YYYY-MM-DD'),
        isSelect:false
      })
      for(let i=1; i<7; i++){
        let Temp_Date = moment(firstdayofweek).add('days', i).format('DD-MMM-YYYY');
        this.sevenDaysAvailability.push({
          day:moment(Temp_Date).format('ddd'),
          month:moment(Temp_Date).format('MMM'),
          date:moment(Temp_Date).format('DD'),
          currentDate:moment(Temp_Date).format('YYYY-MM-DD'),
          isSelect:false
        })
      }
      this.sevenDaysAvailability.forEach(day => {
        if(day.currentDate == date)
       
        this.changeday(day)
      });


      
    //  this.showCalender = false
    }


    
    onDaySelect(event){
      console.log(event)
      this.calculateweek( moment(event).startOf('week').format("DD MMM YYYY"), moment(event).format('YYYY-MM-DD'))
      this.currentmonth = moment(event).format("MMM YYYY")
    }
    
   async changeday(day){
      this.sevenDaysAvailability.forEach(dayofweek => {
        if(dayofweek.isSelect) {
          dayofweek.isSelect = false
        }
      });
      day.isSelect = true

      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      if( this.selectedActivity && this.selectedClubKey){
        this.allCourtSlots = []
        const history = await this.getNewSlots(day)
        this.loading.dismiss()
      }else{
        this.loading.dismiss()
        this.commonService.toastMessage('Please select club and activity',3000, ToastMessageType.Success, ToastPlacement.Bottom)
      }
      
    }


    async getBookingHistory(day){       
      return new Promise((res, rej)=>{
        try{
          const startDate = new Date(new Date(day.currentDate).setHours(0, 0, 0, 0)).getTime();
          const endDate = new Date(new Date(day.currentDate).setHours(23, 59, 59)).getTime();
          const params = {
            parentClubKey: this.selectedParentClubKey,
            courtkey: 'all',
            activitykey: this.selectedActivity,
            clubKey: this.selectedClubKey,
            startDate: startDate,
            endDate: endDate
          };
          
          this.httpService.get(API.COURT_BOOKING_HISTORY, params, null, 1).subscribe({
            next: (data: any) => {
              res('success')
              if(data.data){
                this.allCourtSlots = []
                this.courts.forEach((eachCourt:any)=>{
                  let slot :any = data.data.allCourtSlots[eachCourt.$key]
                  slot.forEach(eachSlot => {
                    eachSlot['MemberName'] = eachSlot['Member'].find(member => member.IsPrimaryMember) || eachSlot['Member'][0]
                    this.allCourtSlots.push(eachSlot)
                  });
                })
                this.slotListing = this.allCourtSlots
              }
            },
            error: (err) => {
              console.log(JSON.stringify(err));
              this.loading.dismiss()
              rej('fail')
            }
          });
        }catch(err){
          this.loading.dismiss()
        }
      })
    }
    
    getTime(date) {
      return moment(date, 'DD MM YYYY').format('D-MMM');
    }

    async getNewSlots(day){
      return new Promise((res, rej)=>{
        try{
          const url = `${API.ACTIVE_BOOKING_IN_RANGE}/${this.selectedParentClubKey}/${this.selectedClubKey}/${this.selectedActivity}/${day.currentDate}/${day.currentDate}/nil`;
          
          this.httpService.get(url, null, null, 1).subscribe({
            next: (data: any) => {
              res('success')
              this.allCourtSlots = data['data']
              this.allCourtSlots.forEach(slot => {
                slot.slot_start_time = moment(slot.slot_start_time, 'HH:mm:ss').format('HH:mm')
                slot.slot_end_time = moment(slot.slot_end_time, 'HH:mm:ss').format('HH:mm')
                slot.booking_transaction_time = moment.utc(slot.booking_transaction_time).local().format('DD-MMM-YYYY')
                slot.booking_date = moment.utc(slot.booking_date).local().format('DD MM YYYY')
              });
              this.slotListing = this.allCourtSlots
            },
            error: (err) => {
              console.log(JSON.stringify(err));
              this.loading.dismiss()
              rej('fail')
            }
          });
        }catch(err){
          this.loading.dismiss()
        }
      })
    }

   
      
    openSearch(){
      let searchrow = document.getElementById('row1');
      if(searchrow.style.display == "none"){
          $(".searchrow").css("display", "block");
         // $("#row1").css("display", "block");
          document.getElementById('fab').classList.add('searchbtn')
      }else{
         $(".searchrow").css("display", "none");
          document.getElementById('fab').classList.remove('searchbtn')
      }
  }

    getFilterItems(ev: any) {

      // Reset items back to all of the items
      this.initializeItems();

      // set val to the value of the searchbar
      let val = ev.target.value;

      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        this.slotListing = this.slotListing.filter((item) => {
          if (item.name != undefined ) {
            if (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true
          }
          if(this.getTime(item.booking_date) != undefined){
            if (this.getTime(item.booking_date).toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true
          }
          if(item.slot_start_time != undefined){
            if (item.slot_start_time.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true
        }
          if(item.courtname != undefined){
            if (item.courtname.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true
          }
        
        })
      }

  }       
  initializeItems() {
    this.slotListing = this.allCourtSlots
  
  }
 
//   getSevenDaysAvailability(currentDate) {
//     let response=[];
//     response.push({ Available: true, Date: currentDate, Day: moment(currentDate).format("DD"),
//     currentMonth:moment(currentDate).format("MMM"),
//     currentDate:moment(currentDate).format("DD"), currentYear:moment(currentDate).format("YYYY"),
//     currentDay:moment().isoWeekday(moment(currentDate).day()).format("ddd") });
    
//     for(let i=1;i<7;i++){
//       let Temp_Date = moment(currentDate).add('days', i).format('DD-MMM-YYYY');
//       response.push({ Available: true, Date: Temp_Date, Day: moment(Temp_Date).format("DD"), currentMonth:moment(Temp_Date).format("MMM"),
//       currentDate:moment(Temp_Date).format("DD"), currentYear:moment(Temp_Date).format("YYYY"),
//       currentDay:moment().isoWeekday(moment(Temp_Date).day()).format("ddd")
//      });
//     }
//     this.sevenDaysAvailability =  response;
//     console.log(this.sevenDaysAvailability);
// }

// //Slidenext
// loadNext() {
// this.slides.lockSwipeToPrev(false); 
//  console.log(this.slides.getActiveIndex());
//  let newIndex = this.slides.getActiveIndex();

//  newIndex--;
//  this.numbers.push(this.numbers[this.numbers.length - 1] + 1);
//  this.numbers.shift();
//  // Workaround to make it work: breaks the animation
//  this.slides.slideTo(newIndex, 0, false);
//  this.showCurrentDate = moment(this.sevenDaysAvailability[6].Date).format('DD-MMM-YYYY');//this.showSelectedDate;
//  this.getSevenDaysAvailability(this.showCurrentDate);
//  console.log(`New status: ${this.numbers}`);
// }

// //Slideback
// loadPrev() {
//   console.log('Prev');
//   let newIndex = this.slides.getActiveIndex();
  
//   newIndex++;
//   this.numbers.unshift(this.numbers[0] - 1);
//   this.numbers.pop();
  
//   // Workaround to make it work: breaks the animation
//   this.slides.slideTo(newIndex, 0, false);

//   console.log(`New status: ${this.numbers}`);
//     this.showCurrentDate = moment(this.sevenDaysAvailability[0].Date).subtract(6,'days').format('DD-MMM-YYYY');//this.showSelectedDate;
    
//      this.getSevenDaysAvailability(this.showCurrentDate);
//      console.log(`New status: ${this.numbers}`);
//     //  if(moment(this.showSelectedDate).isSameOrBefore(moment(new Date()).format("DD-MMM-YYYY"))){
//     //   this.slides.lockSwipeToPrev(true);
//     //   console.log(moment(this.showSelectedDate).isSameOrAfter(this.showCurrentDate));
//     // }else{
//     //   this.slides.lockSwipeToPrev(false);
//     // }  
//   }

}
