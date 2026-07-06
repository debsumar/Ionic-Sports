import { Component, Renderer2 } from '@angular/core';
import { NavController, PopoverController, NavParams, Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../shared/dtos/club.dto';
import { AppType } from '../../../shared/constants/module.constants';
import { API } from '../../../shared/constants/api_constants';
import { CommonService, ToastMessageType } from '../../../services/common.service';
import { HttpService } from '../../../services/http.service';
import { ThemeService } from '../../../services/theme.service';
import { GraphqlService } from '../../../services/graphql.service';
import gql from 'graphql-tag';
import { ClubActivityInput } from '../../../shared/model/club.model';
@IonicPage()
@Component({
  selector: 'courtsetuphome-page',
  templateUrl: 'courtsetuphome.html',
  providers: [GraphqlService]
})

export class Type2CourtSetupHome {
  themeType: number;
  parentClubKey: string;
  menus: Array<{ DisplayTitle: string; 
    OriginalTitle:string;
    MobComponent: string;
    WebComponent: string; 
    MobIcon:string;
    MobLocalImage: string;
    MobCloudImage: string; 
    WebIcon:string;
    WebLocalImage: string;
    WebCloudImage:string;
    MobileAccess:boolean;
    WebAccess:boolean;
    Role: number;
    Type: number;
    Level: number }>;
  responseDetails: any;
  responseDetails1: any;
  selectedClub: any;
  allClub:ClubVenueDto[] = [];
  allActivityArr = [];
  courtDetails = {
    Id: '',
    CourtName: '',
    Surface: '',
    FloodLight: '',
    CourtType: 'Outdoor',
    Shared: '',
    Status: true,
    //PaymentOptionForFloodLight: '',
    Comments: '',
    IsActive: true,
    IsEnable: true,
    CreatedDate: '',
    UpdatedDate: '',
    ParentClubkey: '',
    ClubKey: '',
    ClubName: '',
    ActivityKey: '',
    ActivityName: '',
    FloodLightCostForMember: '',
    FloodLightCostForNonMember: '',
    FloodLightKey:'',
    Days: '',
    Capcity: '',
    SurfaceCode:0,
    Floor : '',
    BookedTime: '',
    BookingInFo: ''
  };


  surfaceList = [
    {name:'Artificial Grass', code:0},
    {name:'Clay', code:1},
    {name:'Grass', code:2},
    {name:'Hardcourt', code:3},
    {name:'Astroturf', code:4},
    {name:'Polymeric', code:5},
    {name:'SyntheticTurf', code:6},
    {name:'Carpet', code:7},
    {name:'Acrylic', code:9},
    {name:'Poraflex', code:10},
    {name:'Tarmac', code:11},
    {name:"Chosen Sport",code:12},
    {name:'Others', code:8},
  

  ]

  floorList = [
    {name:'Inside', code:0},
    {name:'Outside', code:1},
    {name:'Garden', code:2},
    {name:'Beer Garden', code:3},
    {name:'Basement', code:4},
    {name:'First Floor', code:5},
    {name:'Mezzanine Floor', code:6},
    {name:'Bar Area', code:7},
    {name:'Family Area', code:8},
  ]

  isActivityCategoryExist = false;
  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;
  isExistActivitySubCategory: boolean;
  activitySubCategoryList = [];
  acType: any;
  days = [];
  showTime = false;
  selday = "";
  alldays=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  startTime = ['06:00', '06:00', '06:00', '06:00', '06:00', '06:00', '06:00'];
  endTime = ['22:00', '22:00', '22:00', '22:00', '22:00', '22:00', '22:00'];
  isShowTime = [false, false, false, false, false, false, false];
  dayIndex: number = 0;
  selectedActivity: any;
  Isupdatecome: boolean = false;
  minValues = [];
  IsTable: boolean =false;
  url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80' 
  flooddata: any[];
  isDarkTheme: boolean = true; // 🌗 Default dark theme
  constructor(public toastCtrl: ToastController, public storage: Storage,
    public navCtrl: NavController, public sharedservice: SharedServices,
    public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams, 
    public commonService: CommonService,
    private httpService: HttpService,
    private renderer: Renderer2,
    private themeService: ThemeService,
    public events: Events,
    private graphqlService: GraphqlService) {
    let min = 0
    while(min < 60){
      this.minValues.push(min)
      min+= 5;
     
    }
    this.themeType = sharedservice.getThemeType();
    this.menus = sharedservice.getMenuList();
    this.courtDetails = this.navParams.get('Details');

    // if(this.courtDetails.SurfaceCode == undefined){
    //   this.courtDetails.SurfaceCode = this.surfaceList.filter(surf => surf.name == this.courtDetails.Surface)[0].code
    // }
   
    console.log(this.navParams.get('Details'));
    
    if (this.courtDetails != undefined) {
      if(this.courtDetails.Floor){
        let floor = this.floorList.filter(floor => this.courtDetails.Floor.toLowerCase() ==  floor.name.toLowerCase())
        if(floor.length < 0){
          this.floorList.push({name:this.courtDetails.Floor, code:this.floorList.length+1},)
        }
      }
      this.Isupdatecome = true; 
    let endTimeindex = 0;
      this.courtDetails['Days'].split(',').forEach(day =>{
        let index = this.alldays.indexOf(day)
        //let lengthofendTime = this.courtDetails['EndTime']
        this.endTime.splice(index, 1, this.courtDetails['EndTime'].split(',')[endTimeindex])
        this.startTime.splice(index, 1, this.courtDetails['StartTime'].split(',')[endTimeindex])
        endTimeindex++
      })
      // this.courtDetails['EndTime'].split(',').forEach(end => {
      //   this.endTime.push(end)
      // });
      // this.courtDetails['StartTime'].split(',').forEach(start => {
      //   this.startTime.push(start)  
      // });
      let dayList = this.courtDetails.Days.split(',')
      for(var i=0; i<dayList.length ; i++){
  
        this.selectDays(dayList[i], this.alldays.indexOf(dayList[i])) 
      }


      console.log(this.courtDetails)
    } else {
      
        this.courtDetails = {
          Id: '', SurfaceCode:0,Floor : '',
          CourtName: '', Surface: 'Hardcourt', FloodLightKey:'', Capcity:'', FloodLight: 'No', CourtType: 'Outdoor', Shared: 'No', Status: true, Comments: '', IsActive: true, IsEnable: true, CreatedDate: '', UpdatedDate: '', ParentClubkey: '', ClubKey: '', ClubName: '', ActivityKey: '', ActivityName: '', FloodLightCostForMember: '', FloodLightCostForNonMember: '', Days: '', BookedTime: '', BookingInFo: ''
        };
      
      
    }
    

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getClubList();

        }
    })
  }



  ionViewWillEnter() {
    // 🌗 Theme setup
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
    this.events.subscribe('theme:changed', (isDark) => this.applyTheme(isDark));
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  // 🌗 Theme: load persisted preference and apply
  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      const isDark = isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true;
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    }).catch(() => this.applyTheme(true));
  }

  // 🌗 Theme: toggle light-theme class on the page element
  applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const pageElement = document.querySelector('courtsetuphome-page');
    if (pageElement) {
      isDark ? this.renderer.removeClass(pageElement, 'light-theme')
             : this.renderer.addClass(pageElement, 'light-theme');
    }
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  onActChange(){
    if(this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
      this.IsTable = true
        this.courtDetails = {
          Id: '', SurfaceCode:0,Floor : '',
          CourtName: '', Surface: 'Others',  Capcity:'', FloodLightKey:'', FloodLight: 'No', CourtType: 'Outdoor', Shared: 'No', Status: true, Comments: '', IsActive: true, IsEnable: true, CreatedDate: '', UpdatedDate: '', ParentClubkey: '', ClubKey: '', ClubName: '', ActivityKey: '', ActivityName: '', FloodLightCostForMember: '', FloodLightCostForNonMember: '', Days: '', BookedTime: '', BookingInFo: ''
        };
      
    }
  }

  getClubList() {
    // this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
    //   //alert();
    //   if (data.length > 0) {
    //     this.allClub = data;
    //     let key = data[0].$key;
    //     if(this.Isupdatecome){
    //       this.selectedClub = this.courtDetails.ClubKey
    //     }else{
    //       this.selectedClub = key;
    //     }
   
    //     this.getAllActivity();
    //     //this.getAllMemberCategory();
    //   }
    // })
    const body: GetParentClubVenuesRequestDto = {
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      app_type: AppType.ADMIN_NEW,
      device_type: this.sharedservice.getPlatform() == 'android' ? 1 : 2,
      device_id: this.sharedservice.getDeviceId() || 'web',
      updated_by: this.sharedservice.getLoggedInUserId()
    };

    this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
      next: (res: GetParentClubVenuesResponseDto) => {
        this.allClub = res.data as ClubVenueDto[];
        console.table(`all_clubs:${JSON.stringify(this.allClub)}`);
        if (this.allClub.length > 0) {
          let key = this.allClub[0].FirebaseId;
          if(this.Isupdatecome){
            this.selectedClub = this.courtDetails.ClubKey
          }else{
            this.selectedClub = key;
          }
          this.getAllActivity();
        }
      },
      error: (err) => {
        this.allClub = [];
      }
    });
  }

  onClubChange() {
    this.getAllActivity();
  }

  getAllActivity() {
    // Activities are now fetched via the GraphQL getAllActivityByVenue resolver
    // (mirrors createschoolsession). The Firebase activity key is mapped to `$key`
    // so the template dropdown and the downstream getFloodLight() lookup keep working.
    this.allActivityArr = [];
    const club_activity_input: ClubActivityInput = {
      ParentClubKey: this.parentClubKey,
      ClubKey: this.selectedClub,
      VenueKey: this.selectedClub,
      AppType: 0, // 0-Admin
      DeviceType: this.sharedservice.getPlatform() == 'android' ? 1 : 2 // 1-android,2-IOS
    };

    const clubs_activity_query = gql`
      query getAllActivityByVenue($input_obj: VenueDetailsInput!) {
        getAllActivityByVenue(venueDetailsInput: $input_obj) {
          ActivityCode
          ActivityName
          ActivityImageURL
          FirebaseActivityKey
          ActivityKey
        }
      }
    `;

    this.graphqlService
      .query(clubs_activity_query, { input_obj: club_activity_input }, 0)
      .subscribe((res: any) => {
        const activities = (res && res.data && res.data.getAllActivityByVenue) || [];
        if (activities.length > 0) {
          // Preserve the existing contract: template binds to `$key` and
          // getFloodLight() uses selectedActivity in the Firebase path.
          // `ActivityKey` is the unique Firebase activity key; `FirebaseActivityKey`
          // is empty/duplicate and would make every ion-option share the same value.
          this.allActivityArr = activities.map((a: any) => ({
            ...a,
            $key: a.ActivityKey
          }));
          if (this.Isupdatecome) {
            this.selectedActivity = this.courtDetails.ActivityKey;
          } else {
            this.selectedActivity = this.allActivityArr[0].$key;
          }
          if (this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG') {
            this.IsTable = true;
          }
          this.getFloodLight();
        } else {
          this.allActivityArr = [];
        }
      },
      (error) => {
        this.allActivityArr = [];
        console.error("Error in fetching activities:", error);
      });
  }

  getFloodLight(){
    this.fb.getAllWithQuery("StandardCode/FloodLight/"+this.parentClubKey+"/"+this.selectedClub+"/"+this.selectedActivity,  { orderByChild: "IsActive", equalTo: true }).subscribe(data =>{
      this.flooddata = []
      if(data.length > 0){

        this.flooddata = data
      }
    })
  }


  saveCourtSetup() {
    this.courtDetails.Days = "";
    this.days.sort();
    for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

      switch (this.days[daysIndex]) {
        case 0:
          this.selectedDayDetails("Mon");
          break;
        case 1:
          this.selectedDayDetails("Tue");
          break;
        case 2:
          this.selectedDayDetails("Wed");
          break;
        case 3:
          this.selectedDayDetails("Thu");
          break;
        case 4:
          this.selectedDayDetails("Fri");
          break;
        case 5:
          this.selectedDayDetails("Sat");
          break;
        case 6:
          this.selectedDayDetails("Sun");
          break;
      }
    }
    let startDays = "";
    let endDays = "";
    for (let i = 0; i < this.startTime.length; i++) {
      if (this.isShowTime[i] == true) {
        startDays = startDays + this.startTime[i] + ",";
        endDays = endDays + this.endTime[i] + ",";
      }
    }
    this.courtDetails['SurfaceCode'] = this.surfaceList.filter(surf => surf.name == this.courtDetails.Surface)[0].code
    this.courtDetails["StartTime"] = startDays;
    this.courtDetails["EndTime"] = endDays;
    this.courtDetails.ParentClubkey = this.parentClubKey;
    this.courtDetails.CreatedDate = <string>new Date().getTime().toString();
    this.courtDetails.UpdatedDate = <string>new Date().getTime().toString();
    this.courtDetails.ActivityKey = this.selectedActivity;
    this.courtDetails.ClubKey = this.selectedClub;
    for (let i = 0; i < this.allActivityArr.length; i++) {
      if (this.allActivityArr[i].$key == this.courtDetails.ActivityKey) {
        this.courtDetails.ActivityName = this.allActivityArr[i].ActivityName;
      }
    }
    for (let i = 0; i < this.allClub.length; i++) {
      if (this.allClub[i].FirebaseId == this.courtDetails.ClubKey) {
        this.courtDetails.ClubName = this.allClub[i].ClubName;
      }
    }

    if (this.validate()) {
      if (this.courtDetails.Days.split(",").length > 0) {
        // ===== OLD CODE: direct Firebase save (commented out) =====
        // this.responseDetails = this.fb.saveReturningKey("/Court/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/", this.courtDetails);
        // if (this.responseDetails != undefined) {
        //   let message = "Successfully saved";
        //   this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
        //   this.navCtrl.pop();
        // }

        // ===== NEW CODE: call backend createCourt API (courtbooking/createCourt) =====
        const createCourtPayload = {
          parentclub: this.parentClubKey,
          club: this.selectedClub,
          activity: this.selectedActivity,
          name: this.courtDetails.CourtName,
          table_capacity: Number(this.courtDetails.Capcity) || 0,
          comments: this.courtDetails.Comments || '',
          available_days: this.courtDetails.Days,
          available_starttime: this.courtDetails['StartTime'],
          available_endtime: this.courtDetails['EndTime'],
          flood_light: this.courtDetails.FloodLight === 'Yes',
          shared: this.courtDetails.Shared === 'Yes',
          status: this.courtDetails.Status,
          surface: this.courtDetails.Surface,
          surface_code: this.courtDetails.SurfaceCode,
          court_type: this.courtDetails.CourtType,
          flood_light_key: this.courtDetails.FloodLightKey || '',
          floor: this.courtDetails.Floor || ''
        };
        this.commonService.showLoader('Please wait...');
        this.httpService.post(API.CREATE_COURT, createCourtPayload, null, 1).subscribe(
          (res: any) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage("Successfully saved", 2500, ToastMessageType.Success);
            this.navCtrl.pop();
          },
          (err) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage("Failed to save court", 2500, ToastMessageType.Error);
          }
        );
      } else {
        this.commonService.toastMessage("Invalid Details", 2500,ToastMessageType.Error);
      }
    } else {
      this.commonService.toastMessage("Invalid Details", 3000,ToastMessageType.Error);
    }
    console.log(this.courtDetails);
  }

  cancelCourtSetup() {
    this.navCtrl.pop();
  }

  selectedDayDetails(day) {

    if (this.courtDetails.Days == "") {
      this.courtDetails.Days += day;
    }
    else {
      this.courtDetails.Days += "," + day;
    }
  }


  selectDays(day, index) {
    let isPresent = false;
    this.dayIndex = index;
    this.selday = day;
    if (this.isShowTime[index] == true) {
     // this.showTime = false;
      this.isShowTime[index] = false;

    } else if (this.isShowTime[index] == false) {
    //  this.showTime = true;
      this.isShowTime[index] = true;

    }
    if(  this.Isupdatecome ){
      switch (day) {
          case "Mon":
            this.isSelectMon = !this.isSelectMon;
            break;
          case "Tue":    
            this.isSelectTue = !this.isSelectTue;
            break;
          case "Wed":
            this.isSelectWed = !this.isSelectWed;
            break;
          case "Thu":
            this.isSelectThu = !this.isSelectThu;
            break;
          case "Fri":  
            this.isSelectFri = !this.isSelectFri;
            break;
          case "Sat":
            this.isSelectSat = !this.isSelectSat;
            break;
          case "Sun":
            this.isSelectSun = !this.isSelectSun;
            break;
        }

    }
  
    for (let i = 0; i < this.days.length; i++) {
      if (this.days[i] == index) {
        this.days.splice(i, 1);
        isPresent = true;
      }
    }
    if (!isPresent) {
      this.days.push(index);
    }

  }
  validate() {
    let x = false;
    if (this.courtDetails.ActivityKey == undefined || this.courtDetails.ActivityKey == "") {
      x = false;
    } else if (this.courtDetails.ActivityName == undefined || this.courtDetails.ActivityName == "") {
      x = false;
    } else if (this.courtDetails.Surface == undefined || this.courtDetails.Surface == "") {
      x = false;
    } else if (this.courtDetails.Shared == undefined || this.courtDetails.Shared == "") {
      x = false;
    } else if (this.courtDetails.CourtName == undefined || this.courtDetails.CourtName == "") {
      x = false;
    } else if (this.IsTable && (this.courtDetails.Capcity == undefined || this.courtDetails.Capcity == "") ) {
      x = false;
    } 
    else {
      x = true;
    }
    return x;
  }

  updateCourtSetup(){
    this.courtDetails.Days = "";
    this.days.sort(); 
    for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

      switch (this.days[daysIndex]) {
        case 0:
          this.selectedDayDetails("Mon");
          break;
        case 1:
          this.selectedDayDetails("Tue");
          break;
        case 2:
          this.selectedDayDetails("Wed");
          break;
        case 3:
          this.selectedDayDetails("Thu");
          break;
        case 4:
          this.selectedDayDetails("Fri");
          break;
        case 5:
          this.selectedDayDetails("Sat");
          break;
        case 6:
          this.selectedDayDetails("Sun");
          break;
      }
    }
    let startDays = "";
    let endDays = "";
    for (let i = 0; i < this.startTime.length; i++) {
      if (this.isShowTime[i] == true) {
        startDays = startDays + this.startTime[i] + ",";
        endDays = endDays + this.endTime[i] + ",";
      }
    }
    this.courtDetails['SurfaceCode'] = this.surfaceList.filter(surf => surf.name == this.courtDetails.Surface)[0].code
    this.courtDetails["StartTime"] = startDays;
    this.courtDetails["EndTime"] = endDays;
    this.courtDetails.ParentClubkey = this.parentClubKey;
    this.courtDetails.UpdatedDate = <string>new Date().getTime().toString();
    this.courtDetails.ActivityKey = this.selectedActivity;
    this.courtDetails.ClubKey = this.selectedClub;
    for (let i = 0; i < this.allActivityArr.length; i++) {
      if (this.allActivityArr[i].$key == this.courtDetails.ActivityKey) {
        this.courtDetails.ActivityName = this.allActivityArr[i].ActivityName;
      }
    }
    for (let i = 0; i < this.allClub.length; i++) {
      if (this.allClub[i].FirebaseId == this.courtDetails.ClubKey) {
        this.courtDetails.ClubName = this.allClub[i].ClubName;
      }
    }

    if (this.validate()) {
      if (this.courtDetails.Days.split(",").length > 0) {
        // ===== OLD CODE: direct Firebase update (commented out) =====
        // let key = this.courtDetails['$key']
        // delete this.courtDetails['$key']
        // console.log(this.courtDetails)
        // this.responseDetails = this.fb.update(key,"/Court/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/", this.courtDetails);
        // if (this.responseDetails != undefined) {
        //   let message = "Successfully updated";
        //   this.commonService.toastMessage(message, 2500, ToastMessageType.Success);
        //   this.navCtrl.pop();
        // }

        // ===== NEW CODE: call backend updateCourtV2 API (courtbooking/updateCourtV2) =====
        // NOTE: updateCourtV2 resolves the court by its PostgreSQL Id (courtId).
        // courtDetails.Id must be present on the court object passed in via navParams.
        const updateData = {
          name: this.courtDetails.CourtName,
          surface: this.courtDetails.Surface,
          surface_code: this.courtDetails.SurfaceCode,
          court_type: this.courtDetails.CourtType,
          flood_light: this.courtDetails.FloodLight === 'Yes',
          shared: this.courtDetails.Shared === 'Yes',
          status: this.courtDetails.Status,
          available_days: this.courtDetails.Days,
          available_starttime: this.courtDetails['StartTime'],
          available_endtime: this.courtDetails['EndTime'],
          comments: this.courtDetails.Comments || '',
          floor: this.courtDetails.Floor || '',
          table_capacity: Number(this.courtDetails.Capcity) || 0
        };
        const updateCourtV2Payload = {
          courtId: this.courtDetails.Id,
          parentClubKey: this.parentClubKey,
          clubKey: this.selectedClub,
          activityKey: this.selectedActivity,
          updateData: updateData,
          parentclub_id: this.sharedservice.getPostgreParentClubId(),
          device_id: this.sharedservice.getDeviceId() || 'web',
          device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
          app_type: AppType.ADMIN_NEW,
          updated_by: this.sharedservice.getLoggedInUserId() || "admin",
        };
        if (!this.courtDetails.Id) {
          this.commonService.toastMessage("Court ID missing — please close and re-open this court to retry.", 3500, ToastMessageType.Error);
          return;
        }
        this.commonService.showLoader('Please wait...');
        this.httpService.post(API.UPDATE_COURT_V2, updateCourtV2Payload, null, 1).subscribe(
          (res: any) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage("Successfully updated", 2500, ToastMessageType.Success);
            this.navCtrl.pop();
          },
          (err) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage("Failed to update court", 2500, ToastMessageType.Error);
          }
        );
      } else {
        this.commonService.toastMessage("Invalid Details", 3000, ToastMessageType.Error);
      }
    } else {
      this.commonService.toastMessage("Invalid Details", 3000, ToastMessageType.Error);
    }
   // console.log(this.courtDetails);
  }

}
