import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2Venue } from '../venue/venue';
// import { Dashboard } from './../../dashboard/dashboard';

import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { ReportModel_V1 } from '../../../../shared/model/report.model';
import { API } from '../../../../shared/constants/api_constants';
import { HttpService } from '../../../../services/http.service';
import { c } from '@angular/core/src/render3';
@IonicPage()
@Component({
    selector: 'addnewvenue-page',
    templateUrl: 'addnewvenue.html',
    providers: [HttpService]

})
export class AddNewVenue {
    createClubInput: CreateClubInput = {
        City: '',
        ClubContactName: '',
        ClubName: '',
        ClubShortName: '',
        CountryName: '',
        PostCode: '',
        State: '',
        parentClubId: '',
        FirebaseId: '',
        MapUrl: '',
        MapLatitude: '',
        ContactPhone: '',
        FirstLineAddress: '',
        SecondLineAddress: '',
        ClubAdminEmailId: '',
        ClubAdminPassword: '',
        sequence: 0,
        ClubDescription: '',
        MapLongitude: '',
        visible_at_signup: 0,
        shop_pickup_location: 0
    }
    selectedVenue: any;
    VisibleatSignUpPage = 1;
    selectedParentClub: string;
    themeType: number;
    country = []
    tempClubObj = {  //type2 club
        City: "",
        ClubAdminEmailID: "",
        ClubAdminPassword: "",
        ClubContactName: "",
        ClubDescription: "",
        Location: '',
        Country: '',
        CountryName: '',
        ClubID: "",
        ClubName: "",

        ClubShortName: "",
        ContactPhone: "",
        FirstLineAddress: "",
        ParentClubID: "",
        PostCode: "",
        VisibleatSignUpPage: 1,
        SecondLineAddress: "",
        State: "",
        WebsiteUrl: '',
        Type: "",
        OriginalClubKey: "",
        IsActive: true,
        IsEnable: true,
        CreatedDate: 0,
        CreatedBy: 'Parent Club',
        ParentClubKey: "",
        OriginalParentClubKey: ""

    };

    userObj = { EmailID: '', Name: '', Password: '', RoleType: '', Type: '', UserType: '' };
    userInfoObj = { ParentClubKey: '', ClubKey: '' };
    userInfoObj2 = {
        ParentClubKey: "",
        ClubKey: "",
        OriginalClubKey: "",
        OriginalParentClubKey: ""
    }
    selectedParentClubKey: any;
    clubKey: any;
    userresponseDetals: any;
    userKey: any;
    responseDetails: any;
    userType: any;
    userresponseDetails: Promise<any>;

    constructor(storage: Storage, public commonService: CommonService, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController, private httpService: HttpService,
    ) {

        this.themeType = sharedservice.getThemeType();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            this.userType = val.UserType;
            this.selectedParentClub = val.UserInfo[0].ParentClubKey;
            this.createClubInput.parentClubId = this.sharedservice.getPostgreParentClubId();
            this.createClubInput.ClubAdminEmailId = this.createClubInput.ClubName + "01@gmail.com"

            this.userObj.EmailID = this.createClubInput.ClubAdminEmailId;
            this.userObj.Name = this.createClubInput.ClubName;
            this.userObj.Password = 'tttttt';
            this.userObj.RoleType = "3";
            this.userObj.Type = 'Type1';
            this.userObj.UserType = "1";
            this.getCountry();
        }).catch(error => {
            // alert("Errr occured");
        });
    }

    getCountry() {
        this.fb.getAll("Countries/").subscribe(data => {
            if (data.length > 0) {
                this.country = this.commonService.convertFbObjectToArray(data);
                this.country = this.commonService.sortingObjects(this.country, 'CountryName')
                console.log("Country List", this.country);
                console.log("countries", JSON.stringify(this.country)) // Default to
            }
        })
    }

    countryAssign() {
        this.country.forEach(eachCountry => {
            if (eachCountry.CountryCode == this.createClubInput.CountryName) {
                this.createClubInput.CountryName = eachCountry.CountryName
                console.log("Country Name", this.createClubInput.CountryName);
            }
        })

    }

    add() {
        if (this.validateClubInfoForReg()) {
            this.httpService.post(`${API.CREATE_CLUB}`, this.createClubInput).subscribe((res: any) => {
                if (res) {
                    // this.createClubRes = res.data;
                    console.log("CREATE_CLUB RESPONSE", JSON.stringify(res.data));
                } else {
                    console.log("error in fetching",)
                }
            }, error => {
                this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error,);
            });
        }
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
        this.commonService.alertWithText("", detailedMessage, "Okay, got it!");
    }

    cancelVenue() {
        this.navCtrl.pop();
    }

    validateClubInfoForReg(): boolean {
        if (this.createClubInput.ClubName == "") {
            this.commonService.toastMessage("Enter Club Name", 2500, ToastMessageType.Error);
            return false;
        }
        else if (this.createClubInput.ClubShortName == "") {
            this.commonService.toastMessage("Enter Club ShortName", 2500, ToastMessageType.Error);
            return false;
        }
        else if (this.createClubInput.ClubDescription == "") {
            this.commonService.toastMessage("Enter Club Description", 2500, ToastMessageType.Error);
            return false;
        }
        else if (this.createClubInput.FirstLineAddress == "") {
            this.commonService.toastMessage("Enter First Line Address", 2500, ToastMessageType.Error);
            return false;
        }
        else if (this.createClubInput.State == "") {
            this.commonService.toastMessage("Enter State", 2500, ToastMessageType.Error);

            return false;
        }
        else if (this.createClubInput.City == "") {
            this.commonService.toastMessage("Enter City", 2500, ToastMessageType.Error);
            return false;
        }
        else if (this.createClubInput.PostCode == "") {
            this.commonService.toastMessage("Enter Post Code", 2500, ToastMessageType.Error);
            return false;
        }
        return true;
    }
    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }
}
export class CreateClubInput {
    City: string;
    ClubContactName: string;
    ClubName: string;
    ClubShortName: string;
    CountryName: string;
    PostCode: string;
    State: string;
    parentClubId: string;
    FirebaseId: string;
    MapUrl: string;
    MapLatitude: string;
    ContactPhone: string;
    FirstLineAddress: string;
    SecondLineAddress: string;
    ClubAdminEmailId: string;
    ClubAdminPassword: string;
    sequence: number;
    ClubDescription: string;
    MapLongitude: string;
    visible_at_signup: number;
    shop_pickup_location: number;
}
