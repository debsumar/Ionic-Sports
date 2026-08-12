import { Component, Renderer2 } from '@angular/core';
import { NavController, PopoverController, NavParams, Events } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import {IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { ThemeService } from '../../../../services/theme.service';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType, DeviceType } from '../../../../shared/constants/module.constants';
@IonicPage()
@Component({
    selector: 'addnewvenue-page',
    templateUrl: 'addnewvenue.html',
    providers: [HttpService]
})
export class AddNewVenue {
    selectedVenue: any;
    VisibleatSignUpPage = 1;
    selectedParentClub: string;
    postgre_parentclub_id: string = '';
    themeType: number;
    country=[]
    clubObj = {
        ClubID: '',
        ParentClubID: '',
        ClubAdminEmailID: '',
        ClubAdminPassword: 'tttttt',
        ClubName: '',
        ClubShortName: '',
        ClubDescription: '',
        Location:'',
        WebsiteUrl:'',
        ClubContactName: '',
        Country:'',
        CountryName:'',
        ContactPhone: '',
        FirstLineAddress: '',
        SecondLineAddress: '',
        State: '',
        City: '',
        PostCode: ''
    };

    userObj = { EmailID: '', Name: '', Password: '', RoleType: '', Type: '', UserType: '' };
    userInfoObj = { ParentClubKey: '', ClubKey: '' };
    userInfoObj2 = {
        ParentClubKey: "",
        ClubKey: "",
        OriginalClubKey:"",
        OriginalParentClubKey:""
    }
    selectedParentClubKey: any;
    clubKey:any;
    userresponseDetals:any;
    userKey:any;
    responseDetails:any;
    userType: any;
    userresponseDetails: Promise<any>;
    isDarkTheme: boolean = true; // 🌗 Default dark theme
    
    constructor(public storage: Storage, public comonService: CommonService, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController,
      private renderer: Renderer2, private themeService: ThemeService, public events: Events, private httpService: HttpService) {
      
      this.themeType = sharedservice.getThemeType();
      this.postgre_parentclub_id = this.sharedservice.getPostgreParentClubId() || '';
      storage.get('postgre_parentclub').then((postgre_parentclub) => {
        if (!this.postgre_parentclub_id && postgre_parentclub && postgre_parentclub.Id) {
          this.postgre_parentclub_id = postgre_parentclub.Id;
        }
      });
      storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        this.userType = val.UserType;
        this.selectedParentClub = val.UserInfo[0].ParentClubKey;  
        this.getCountry();
      }).catch(error => {
       // alert("Errr occured");
      });
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
    async loadTheme() {
      const isDarkTheme = await this.storage.get('dashboardTheme');
      const isDark = isDarkTheme !== null ? isDarkTheme : true;
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    }

    // 🌗 Theme: toggle light-theme class on the page element
    applyTheme(isDark: boolean) {
      this.isDarkTheme = isDark;
      const pageElement = document.querySelector('addnewvenue-page');
      if (pageElement) {
        isDark ? this.renderer.removeClass(pageElement, 'light-theme')
               : this.renderer.addClass(pageElement, 'light-theme');
      }
    }

    getCountry(){
        this.fb.getAll("Countries/").subscribe(data =>{
            if(data.length > 0){
                this.country = this.comonService.convertFbObjectToArray(data);
                this.country = this.comonService.sortingObjects(this.country,'CountryName')
            }
        })
    }

    countryAssign(){
        this.country.forEach(eachCountry =>{
            if (eachCountry.CountryCode == this.clubObj.Country){
                this.clubObj['CountryName'] = eachCountry.CountryName
            }
         })
       
    }

    save(){
        if (!this.validateClubInfoForReg()) {
            return;
        }
        if (!this.postgre_parentclub_id) {
            this.comonService.toastMessage("Parent club details are unavailable", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            return;
        }

        this.selectedParentClubKey = "-LpjWofUo9B3zwzF_iKb"
        this.clubObj.ClubAdminEmailID = this.clubObj.ClubName+"01@gmail.com"

        this.clubKey = this.fb.getNewKey("/Club/Type1/" + this.selectedParentClubKey + "/");
        const type2ClubKey = this.fb.getNewKey("/Club/Type2/" + this.selectedParentClub + "/");
        const payload = {
            FirebaseId: type2ClubKey,
            ParentClubID: this.postgre_parentclub_id,
            ClubName: this.clubObj.ClubName ? String(this.clubObj.ClubName) : '',
            ClubShortName: this.clubObj.ClubShortName ? String(this.clubObj.ClubShortName) : '',
            ClubContactName: this.clubObj.ClubContactName ? String(this.clubObj.ClubContactName) : '',
            City: this.clubObj.City ? String(this.clubObj.City) : '',
            State: this.clubObj.State ? String(this.clubObj.State) : '',
            CountryName: this.clubObj.CountryName ? String(this.clubObj.CountryName) : '',
            PostCode: this.clubObj.PostCode ? String(this.clubObj.PostCode) : '',
            FirstLineAddress: this.clubObj.FirstLineAddress || '',
            SecondLineAddress: this.clubObj.SecondLineAddress || '',
            ContactPhone: this.clubObj.ContactPhone ? String(this.clubObj.ContactPhone) : '',
            ClubDescription: this.clubObj.ClubDescription || '',
            MapUrl: this.clubObj.Location || '',
            WebsiteUrl: this.clubObj.WebsiteUrl || '',
            ClubAdminEmailID: this.clubObj.ClubAdminEmailID,
            Country: this.clubObj.Country || '',
            OriginalClubKey: this.clubKey,
            device_type: this.sharedservice.getPlatform() === 'android' ? DeviceType.ANDROID : DeviceType.IOS,
            app_type: AppType.ADMIN_NEW,
            device_id: this.sharedservice.getDeviceId() || 'web',
            updated_by: this.sharedservice.getLoggedInUserId() || 'admin',
        };

        this.comonService.showLoader();
        this.httpService.post(API.CREATE_CLUB, payload, undefined, 1).subscribe(
            () => {
                this.comonService.hideLoader();
                this.fb.update(this.clubKey, "/Club/Type1/" + this.selectedParentClubKey + "/", this.clubObj);

                this.userObj.EmailID = this.clubObj.ClubAdminEmailID;
                this.userObj.Name = this.clubObj.ClubName;
                this.userObj.Password = 'tttttt';
                this.userObj.RoleType = "3";
                this.userObj.Type = 'Type1';
                this.userObj.UserType = "1";

                this.userresponseDetals = this.fb.saveReturningKey("/User", this.userObj);
                if (this.userresponseDetals != undefined) {
                    this.userInfoObj.ParentClubKey = this.selectedParentClubKey
                    this.userInfoObj.ClubKey = this.clubKey
                    this.userKey = this.fb.saveReturningKey("/User/" + this.userresponseDetals + "/UserInfo/", this.userInfoObj);
                    if (this.userKey != undefined) {
                        this.responseDetails = this.fb.update(this.clubKey, "/Club/Type1/" + this.selectedParentClubKey + "/", { UserKey: this.userresponseDetals });
                    }
                }

                if (this.userType == "2") {
                    this.userObj.EmailID = this.clubObj.ClubAdminEmailID;
                    this.userObj.Name = this.clubObj.ClubName;
                    this.userObj.Password = this.clubObj.ClubAdminPassword;
                    this.userObj.RoleType = "3";
                    this.userObj.Type = "2";
                    this.userObj.UserType = "2";

                    this.userresponseDetails = this.fb.saveReturningKey("/User/", this.userObj);
                    if (this.userresponseDetails != undefined) {
                        this.userInfoObj2.ParentClubKey = this.selectedParentClub;
                        this.userInfoObj2.ClubKey = type2ClubKey;
                        this.userInfoObj2.OriginalClubKey = this.clubKey;
                        this.userInfoObj2.OriginalParentClubKey=this.selectedParentClubKey;

                        this.fb.saveReturningKey("/User/" + this.userresponseDetails + "/UserInfo/", this.userInfoObj);
                    }
                    this.responseDetails = this.fb.saveReturningKey("/Club/Type1/" + this.selectedParentClub +"/"+this.clubKey+ "/Type2Child", {ParentClubKey:this.selectedParentClub,Clubkey:type2ClubKey});
                }
                this.showPopover();
                this.navCtrl.pop().then(() => this.navCtrl.pop());
            },
            () => {
                this.comonService.hideLoader();
                this.comonService.toastMessage("Venue creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
        );
    }

    showPopover() {
        const detailedMessage = `
            <p>Congratulations! You have added a new venue successfully!</p>
            <p>Please complete the following steps now before start using this venue:</p>
            <ol>
            <li>Assign an ‘Activity’ to the venue. For example: Tennis, Football. Click on the venue and use the menu to add an activity for the newly added venue.</li>
            <li>Assign a coach to the venue. Setup—>Manage Team.</li>
            <li>Connect a Stripe account for the new venue and activity combination.</li>
            </ol>
            <p><strong>NOTE:</strong> Without the above steps, sessions cannot be created for the new venue.</p>
        `;
        this.comonService.alertWithText("", detailedMessage, "Okay, got it!");
    }

    cancelVenue() {
        this.navCtrl.pop();
    }

    validateClubInfoForReg(): boolean {
        if (this.clubObj.ClubName == "") {
            this.comonService.toastMessage("Enter Club Name",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.ClubShortName == "") {
            this.comonService.toastMessage("Enter Club ShortName",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.ClubDescription == "") {
            this.comonService.toastMessage("Enter Club Description",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.FirstLineAddress == "") {
            this.comonService.toastMessage("Enter First Line Address",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.State == "") {
            this.comonService.toastMessage("Enter State",2500,ToastMessageType.Error);
        
            return false;
        }
        else if (this.clubObj.City == "") {
            this.comonService.toastMessage("Enter City",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.PostCode == "") {
            this.comonService.toastMessage("Enter Post Code",2500,ToastMessageType.Error);
            return false;
        }
        return true;
    }
    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }
}