import { Component, Renderer2 } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, AlertController, ActionSheetController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment'
import * as $ from "jquery";
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { ClubVenueDto, CourtDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../shared/dtos/club.dto';
import { AppType, DeviceType } from '../../../../shared/constants/module.constants';
import { CommonRestApiDto } from '../../../../shared/model/common.model';
import { ClubActivity } from '../../../../shared/model/activity.model';
import { ThemeService } from '../../../../services/theme.service';
/**
 * Generated class for the BookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-booking',
  templateUrl: 'booking.html',
})
export class BookingPage {
  bookingConfig = {
    ActivityDuration: 0,
    AdvanceBookingAllowed: 0,//ina day
    MaxBookingLimit: 0,
    MaxBookingForTotaldays: 0
  }
  NoActiveBooking = "No Active Booking"
  selectedParentClubKey: any = "";
  selectedClubKey: any = "";
  memberKey: any;
  currencyDetails: any = "";
  slotsType: boolean = false;
  slotListing = [];
  slots = [];
  pastSlots = [];
  upCommingSlots = [];
  clubs:ClubVenueDto[] = [];
  courts = [];
  ActivityList = [];
  selectedActivity = "";
  selectedCourt = "all";
  loading: any;
  selectedTabInd = 0;
  Todayslots: any[];
  isClearStorage = false;
  isDarkTheme: boolean = true; // 🌗 Default dark theme
  // Club key the current ActivityList was fetched for - guards against the duplicate
  // ionChange that a programmatic selectedClubKey write triggers.
  private activityFetchClubKey: string = null;
  // Last club/activity/court/tab combination slots were fetched for - dedupes the
  // explicit fetch against the court select's (ionChange).
  private lastSlotFetchKey: string = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController, public storage: Storage,
    public fb: FirebaseService, public commonService: CommonService,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController, public sharedService: SharedServices, 
    public http: HttpClient, private httpService: HttpService,
    private renderer: Renderer2, private themeService: ThemeService, public events: Events) {
    //this.sharedService.get


  }


  ionViewWillEnter() {
    // 🌗 Theme setup
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
    this.events.subscribe('theme:changed', (isDark) => this.applyTheme(isDark));

    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);

      for (let user of val.UserInfo) {
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
    // Allow one activity fetch per page entry even if the club is unchanged.
    this.activityFetchClubKey = null;
    this.lastSlotFetchKey = null;
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
            }
          },
          error: (err) => {
            this.clubs = [];
          }
        });
  }
  getAllActivity() {
    // ion-select re-emits (ionChange) when selectedClubKey is written programmatically
    // in getClubDetails() - Ionic 3 BaseInput.writeValue() fires _fireIonChange() on every
    // write after the first. That made this endpoint fire twice per page entry. Skip the
    // duplicate by remembering the club the current list was fetched for.
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
        this.ActivityList = [];
        this.selectedActivity = "";
        const clubActivities: ClubActivity[] = (res && res.data && res.data.club_activities) ? res.data.club_activities : [];
        // Drop the placeholder rows this endpoint returns (activity_key "undefined", null
        // activity/name). Courts are still read from Firebase under the activity key, so a
        // row without a usable key would load an empty court list and break the cascade.
        this.ActivityList = clubActivities
          .filter((activity) => activity && activity.activity_key && activity.activity_key !== 'undefined'
            && (activity.alias_name || activity.activity_name))
          // Keep $key / ActivityName so booking.html and the Firebase court path stay unchanged.
          .map((activity) => ({
            ...activity,
            $key: activity.activity_key,
            ActivityName: activity.alias_name || activity.activity_name
          }));
        if (this.ActivityList.length > 0) {
          this.selectedActivity = this.ActivityList[0].$key;
        }
        this.getAllCourts();
      },
      error: () => {
        this.ActivityList = [];
        this.selectedActivity = "";
      }
    });
  }
  getAllCourts() {
    this.courts = [];
    // Default to the "All" option rather than the first court. The booking
    // APIs already map 'all' -> 'nil', and resetting here also clears a stale
    // court key when the activity changes (that key belongs to the old activity).
    this.selectedCourt = 'all';
    if (!this.selectedActivity) {
      return;
    }
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
        this.courts = allCourts
          // Preserves the IsActive filter the previous Firebase query applied.
          .filter((court) => court && court.IsActive && court.firebasekey)
          // Keep $key so the template and the booking API URLs stay unchanged.
          .map((court) => ({ ...court, $key: court.firebasekey }));
        // Load the slots for the new court list. Previously this happened only as a
        // side effect of selectedCourt changing to courts[0].$key and re-emitting
        // (ionChange); with 'all' as the default that write is a no-op, so the fetch
        // has to be explicit. callbothfunction() dedupes against the ionChange path.
        this.callbothfunction();
      },
      error: () => {
        this.courts = [];
      }
    });
  }
  getTime(date) {
    return moment(date, 'DD MM YYYY').format('D-MMM');
  }

  async callbothfunction() {
    // Slots are loaded from two places: the court select's (ionChange) and the explicit
    // call at the end of getAllCourts(). Dedupe so the same selection is not fetched twice.
    const tab = this.selectedTabInd === 0 ? 'today' : 'allday';
    const fetchKey = `${tab}-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
    if (this.lastSlotFetchKey === fetchKey) {
      return;
    }
    this.lastSlotFetchKey = fetchKey;

    this.slotListing = []
    if (this.selectedTabInd === 0) {
      let key = `today-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
      let data = await this.commonService.getDataWithExpiry(key)
      if (data == null) {
        this.getTodayBookings()
      } else {
        this.slotListing = data
      }

    } else {
      let key = `allday-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
      let data = await this.commonService.getDataWithExpiry(key)
      if (data == null) {
        this.getActiveBookings()
      } else {
        this.slotListing = data
      }
    }
  }

  doRefresh(event) {

    if (this.selectedTabInd === 0) {
      this.getTodayBookings()
    } else {
      this.getActiveBookings()
    }
    event.complete();


  }

  // getTodayBookings() {
  //   if(this.selectedCourt){
  //     this.loading = this.loadingCtrl.create({
  //       content: 'Please wait...'
  //     });
  //     this.loading.present();
  //     let startDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  //     let lasttDate = new Date(new Date().setHours(23, 59, 59)).getTime();
  //       .subscribe(async (data: any) => {
  //         this.loading.dismiss()
  //         if(this.selectedCourt == 'all'){
  //           this.Todayslots = []
  //           for(let i =0 ; i< this.courts.length ; i++){
  //             let slot: any = data.data.allCourtSlots[this.courts[i].$key]
  //             if(slot){  

  //               slot.forEach(eachSlot => { 
  //                 eachSlot.CourtInfo = {  
  //                   ...this.courts[i],
  //                 }
  //                 eachSlot['MemberName'] = eachSlot['Member'].find(member => member.IsPrimaryMember)
  //                 this.Todayslots.push(eachSlot)
  //               });
  //             }
  //           }
  //         }
  //         else if (this.selectedCourt != 'all' && data.data.allCourtSlots[this.selectedCourt]!=undefined) {
  //           this.Todayslots = [];
  //           // this.courts.forEach(async (eachCourt: any) => { })

  //             let slot: any = data.data.allCourtSlots[this.selectedCourt]
  //             if(slot){
  //              let court = this.courts.filter(court => court.$key == this.selectedCourt)[0]
  //               slot.forEach(eachSlot => {
  //                 eachSlot.CourtInfo = {
  //                   ...court
  //                 }
  //                 eachSlot['MemberName'] = eachSlot['Member'].find(member => member.IsPrimaryMember)
  //                 this.Todayslots.push(eachSlot)
  //               });   
  //             }


  //         }
  //         this.slotListing = this.Todayslots
  //         let key = `today-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
  //         const date = new Date();
  //         date.setDate(date.getDate() + 30);
  //         const ttl = new Date(date).getTime();
  //         this.commonService.setDataWithExpiry(key, this.Todayslots, ttl);
  //          // this.getSortedSlots();
  //       }, (err) => {
  //         console.log(JSON.stringify(err));
  //         this.loading.dismiss()
  //       });
  //   }else{
  //     this.slots = [];

  //   }

  // }

  // getActiveBookings() {
  //   if(this.selectedCourt){
  //     this.loading = this.loadingCtrl.create({
  //       content: 'Please wait...'
  //     });
  //     this.loading.present();
  //     let startDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  //     let tempDate: any = moment().add(30, 'days');
  //     let lasttDate = new Date(new Date(tempDate).setHours(23, 59, 59)).getTime();
  //       .subscribe((data: any) => {
  //         this.loading.dismiss()
  //         if(this.selectedCourt == 'all'){
  //           this.slots = []
  //           for(let i =0 ; i< this.courts.length ; i++){
  //             let slot: any = data.data.allCourtSlots[this.courts[i].$key]
  //             if(slot){  

  //               slot.forEach(eachSlot => {
  //                 eachSlot.CourtInfo = {  
  //                   ...this.courts[i],
  //                 }
  //                 eachSlot['MemberName'] = eachSlot['Member'].find(member => member.IsPrimaryMember)
  //                 this.slots.push(eachSlot)
  //               });
  //             }
  //           }
  //         }
  //         else if (this.selectedCourt != 'all' && data.data.allCourtSlots[this.selectedCourt]!=undefined) {
  //           this.slots = [];
  //           // this.courts.forEach(async (eachCourt: any) => { })

  //             let slot: any = data.data.allCourtSlots[this.selectedCourt]
  //             if(slot){
  //              let court = this.courts.filter(court => court.$key == this.selectedCourt)[0]
  //               slot.forEach(eachSlot => {
  //                 eachSlot.CourtInfo = {
  //                   ...court
  //                 }
  //                 eachSlot['MemberName'] = eachSlot['Member'].find(member => member.IsPrimaryMember)
  //                 this.slots.push(eachSlot)
  //               });   
  //             }


  //         }
  //         this.slotListing = this.slots
  //          // this.getSortedSlots();
  //          let key = `allday-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
  //          const date = new Date();
  //          date.setDate(date.getDate() + 30);
  //          const ttl = new Date(date).getTime();
  //          this.commonService.setDataWithExpiry(key, this.slots, ttl);

  //       }, (err) => {
  //         console.log(JSON.stringify(err));
  //         this.loading.dismiss()
  //       });
  //   }else{
  //     this.slots = [];
  //    // this.commonService.toastMessage('No Record', 3000)
  //   }

  // }

  getActiveBookings() {
    if (this.selectedCourt) {
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      const selectedCourt = this.selectedCourt.toLowerCase() == 'all' ? 'nil' : this.selectedCourt;
      const url = `${API.ALL_ACTIVE_BOOKING_BY_COURT}/${this.selectedParentClubKey}/${this.selectedClubKey}/${this.selectedActivity}/${selectedCourt}`;
      
      this.httpService.get(url, null, null, 1).subscribe({
        next: (data: any) => {
          this.loading.dismiss()
          this.slots = data['data']
          this.slotListing = this.slots
          this.slots.forEach(slot => {
            slot.slot_start_time = moment(slot.slot_start_time, 'HH:mm:ss').format('HH:mm')
            slot.slot_end_time = moment(slot.slot_end_time, 'HH:mm:ss').format('HH:mm')
            slot.booking_transaction_time = moment.utc(slot.booking_transaction_time).local().format('DD-MMM-YYYY')
            slot.booking_date = moment.utc(slot.booking_date).local().format('DD MM YYYY')
          });
          const key = `allday-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
          const date = new Date();
          date.setDate(date.getDate() + 30);
          const ttl = new Date(date).getTime();
          this.commonService.setDataWithExpiry(key, this.slots, ttl);
        },
        error: (err) => {
          console.log(JSON.stringify(err));
          this.loading.dismiss()
        }
      });
    } else {
      this.slots = [];
    }
  }
  
  getTodayBookings() {
    if (this.selectedCourt) {
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      const startDate = moment().format('YYYY-MM-DD')
      const selectedCourt = this.selectedCourt.toLowerCase() == 'all' ? 'nil' : this.selectedCourt;
      const url = `${API.ACTIVE_BOOKING_IN_RANGE}/${this.selectedParentClubKey}/${this.selectedClubKey}/${this.selectedActivity}/${startDate}/${startDate}/${selectedCourt}`;
      
      this.httpService.get(url, null, null, 1).subscribe({
        next: (data: any) => {
          this.loading.dismiss()
          this.Todayslots = data['data']
          this.slotListing = this.Todayslots
          this.Todayslots.forEach(slot => {
            slot.slot_start_time = moment(slot.slot_start_time, 'HH:mm:ss').format('HH:mm')
            slot.slot_end_time = moment(slot.slot_end_time, 'HH:mm:ss').format('HH:mm')
            slot.booking_transaction_time = moment.utc(slot.booking_transaction_time).local().format('DD-MMM-YYYY')
            slot.booking_date = moment.utc(slot.booking_date).local().format('DD MM YYYY')
          });
          const key = `today-${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}`;
          const date = new Date();
          date.setDate(date.getDate() + 30);
          const ttl = new Date(date).getTime();
          this.commonService.setDataWithExpiry(key, this.Todayslots, ttl);
        },
        error: (err) => {
          console.log(JSON.stringify(err));
          this.loading.dismiss()
        }
      });
    } else {
      this.slots = [];
    }
  }

  goToRecuringbooking() {
    this.navCtrl.push('RecuringbookingPage');
  }

  openSearch() {
    let searchrow = document.getElementById('row');
    if (searchrow.style.display == "none") {
      $("#row").css("display", "block");
      document.getElementById('fab').classList.add('searchbtn')
    } else {
      $("#row").css("display", "none");
      document.getElementById('fab').classList.remove('searchbtn')
    }
  }

  changeTab(tabIndex: number) {
    this.selectedTabInd = tabIndex;
    this.callbothfunction()
  }

  getFilterItems(ev: any) {

    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.slotListing = this.slotListing.filter((item) => {

        if (item.name != undefined) {
          if (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
        }
        if (item.slot_start_time != undefined) {
          if (item.slot_start_time.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
        }
        if (this.getTime(item.booking_date) != undefined) {
          if (this.getTime(item.booking_date).toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
        }
        if (item.courtname != undefined) {
          if (item.courtname.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
        }

      })

    }

  }
  initializeItems() {
    if (this.selectedTabInd === 0) {
      this.slotListing = this.Todayslots
    } else {
      this.slotListing = this.slots
    }
  }

  //Actionshett for cancel

  gotoDetails(slot) {
    let clubIndex = this.clubs.findIndex(club => club.FirebaseId === this.selectedClubKey);
    let selectedClub = this.clubs[clubIndex].ClubName;
    this.navCtrl.push('ActiveBookingDetail',
      {
        ParentClubKey: this.selectedParentClubKey,
        selectedClub: selectedClub,
        ClubKey: this.selectedClubKey,
        // courtInfoObj : slot.CourtInfo,
        // selectedCourt :  slot.CourtInfo,
        slotInfo: slot,

      });
  }

  goTofilterpage() {
    this.navCtrl.push("FilterbookingsPage");
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
    const pageElement = document.querySelector('page-booking');
    if (pageElement) {
      isDark ? this.renderer.removeClass(pageElement, 'light-theme')
             : this.renderer.addClass(pageElement, 'light-theme');
    }
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

}