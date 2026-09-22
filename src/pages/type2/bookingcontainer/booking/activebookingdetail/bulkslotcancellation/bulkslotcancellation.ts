import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, AlertController, ActionSheetController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment'
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../../../services/sharedservice';
import { FirebaseService } from '../../../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../../../services/common.service';
import { HttpService } from '../../../../../../services/http.service';
import { API } from '../../../../../../shared/constants/api_constants';
import { ClubVenueDto, CourtDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../../../shared/dtos/club.dto';
import { AppType, DeviceType } from '../../../../../../shared/constants/module.constants';
import { CommonRestApiDto } from '../../../../../../shared/model/common.model';
import { ClubActivity } from '../../../../../../shared/model/activity.model';
import { ThemeService } from '../../../../../../services/theme.service';



/**
 * Generated class for the BookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bulkslotcancellation',
  templateUrl: 'bulkslotcancellation.html',
})
export class BulkSlotCancellation {
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
  clubs: ClubVenueDto[] = [];
  courts = [];
  ActivityList = [];
  selectedActivity = "";
  selectedCourt = "all";
  loading: any;
  selectedTabInd = 0;
  Todayslots: any[];
  isClearStorage = false;
  deleteText = ""
  userkey: any;
  cancelReason = "";
  type: any;
  isDarkTheme: boolean = true;
  // Club key the current ActivityList was fetched for - guards against the duplicate
  // ionChange that a programmatic selectedClubKey write triggers.
  private activityFetchClubKey: string = null;
  // Last club/activity/court combination slots were fetched for - dedupes the explicit
  // fetch against the court select's (ionChange).
  private lastSlotFetchKey: string = null;
  
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController, public storage: Storage,
    public fb: FirebaseService, public commonService: CommonService,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController, public sharedService: SharedServices, public http: HttpClient, private httpService: HttpService,
    public events: Events, private themeService: ThemeService) {
    //this.sharedService.get
  

  }


  ngOnInit() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
    this.events.subscribe('theme:changed', (isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  private loadTheme(): void {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      const isDark = isDarkTheme !== null ? isDarkTheme : true;
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    }).catch(() => {
      this.isDarkTheme = true;
      this.applyTheme(true);
    });
  }

  private applyTheme(isDark: boolean): void {
    const el = document.querySelector("page-bulkslotcancellation");
    if (el) {
      isDark ? el.classList.remove("light-theme") : el.classList.add("light-theme");
    }
  }


  ionViewWillEnter() {
    this.loadTheme();
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.userkey = val.$key
      this.type = this.navParams.get('type')
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
    // Allow one activity/slot fetch per page entry even if the club is unchanged.
    this.activityFetchClubKey = null;
    this.lastSlotFetchKey = null;
    // this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
    //   this.clubs = data;
    //   if (data.length != 0) {
    //     this.selectedClubKey = this.clubs[0].$key;
    //     this.getAllActivity();
    //   }
    // });
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
    // write after the first, which would call this endpoint twice per page entry.
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
        // activity/name) - courts are keyed on activity_key, so a row without one is unusable.
        this.ActivityList = clubActivities
          .filter((activity) => activity && activity.activity_key && activity.activity_key !== 'undefined'
            && (activity.alias_name || activity.activity_name))
          // Keep $key / ActivityName so the template and court lookup stay unchanged.
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

  /**
   * On this bulk-cancellation screen the card is the row's primary tap target, so
   * tapping it toggles selection instead of navigating. Navigating away would discard
   * the user's in-progress selection. The sibling app-checkbox re-renders because its
   * `checked` input is bound to the same property.
   */
  toggleSlotSelection(slot) {
    slot.IsSelect = !slot.IsSelect;
  }

  async callbothfunction(){
    // Slots are loaded from two places: the court select's (ionChange) and the explicit
    // call at the end of getAllCourts(). Dedupe so the same selection is not fetched twice.
    const fetchKey = `${this.selectedClubKey}-${this.selectedActivity}-${this.selectedCourt}-${this.type}`;
    if (this.lastSlotFetchKey === fetchKey) {
      return;
    }
    this.lastSlotFetchKey = fetchKey;
    this.getActiveBookings()
  }

  getActiveBookings(){
    if(this.selectedCourt){
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      const selectedCourt = this.selectedCourt.toLowerCase() == 'all' ? 'nil' : this.selectedCourt;
      const url = `${API.ALL_BOOKING_BY_COURT}/${this.selectedParentClubKey}/${this.selectedClubKey}/${this.selectedActivity}/${this.type}/${selectedCourt}`;
      
      this.httpService.get(url, null, null, 1).subscribe({
        next: (data: any) => {
          this.loading.dismiss()
          this.slots = data['data']
         
          this.slots.forEach(slot => {
            slot.slot_start_time = moment(slot.slot_start_time, 'HH:mm:ss').format('HH:mm')
            slot.slot_end_time = moment(slot.slot_end_time, 'HH:mm:ss').format('HH:mm')
            slot.booking_transaction_time = moment.utc(slot.booking_transaction_time).local().format('DD-MMM-YYYY')
            slot.booking_date = moment.utc(slot.booking_date).local().format('DD MM YYYY')
            slot['IsSelect'] = false
          });

          this.slotListing = this.slots
        },
        error: (err) => {
          console.log(JSON.stringify(err));
          this.loading.dismiss()
        }
      });
    }else{
      this.slots = [];
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
        if(item.slot_start_time != undefined){
          if (item.slot_start_time.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true
      }
      if(this.getTime(item.booking_date) != undefined){
        if (this.getTime(item.booking_date).toLowerCase().indexOf(val.toLowerCase()) > -1)
          return true
      }
      if(item.courtname != undefined){
        if (item.courtname.toLowerCase().indexOf(val.toLowerCase()) > -1)
          return true
      }
      
      })
      
    }

}       

showConfirm(){
  if (this.deleteText != "DELETE"){
    this.commonService.toastMessage("Type 'DELETE' in input field", 3000, ToastMessageType.Error)
  }else{
    this.commonService.commonAlter('Deletion', 'Are you sure?', ()=>{
      this.cancelBulk()
    })
  }
}

cancelBulk(){
  return new Promise((resolve, reject) =>{
    const cancelIds = []
    this.slotListing.forEach((slot) =>{
      if (slot.IsSelect)
      cancelIds.push(slot.Id)
    })
    
    const body = {
      ids: cancelIds,
      cancelby: this.userkey,
      cancelreason: this.cancelReason
    };

    this.httpService.put(API.BULK_CANCEL_RECURRING_BY_ID, body, null, 1).subscribe({
      next: (res) => {
        resolve('success')
        this.commonService.toastMessage("Bookings cancelled successfully", 3000, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop().then(() => this.navCtrl.pop(). then(() => this.navCtrl.pop()));
      },
      error: (err) => {
        console.log(err)
        this.commonService.toastMessage("Unable to cancel slot", 2000)
        reject('fail')
      }
    })
  })
}

initializeItems() {
    this.slotListing = this.slots
}

}