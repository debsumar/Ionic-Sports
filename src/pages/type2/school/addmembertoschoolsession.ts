import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams, ViewController, AlertController, Checkbox } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from 'graphql-tag';
import { Storage } from "@ionic/storage";
import { GraphqlService } from '../../../services/graphql.service';
//import { UserModel } from '../match/models/match.model';
import { ISession_MemberEnrols, SchoolDetails } from './schoolsession.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UsersModel } from '../../../shared/model/users_list.model';

@IonicPage()
@Component({
  selector: 'addmembertoschoolsession-page',
  templateUrl: 'addmembertoschoolsession.html',
})

export class Type2AddMemberSchoolSession {
  private searchTerms = new Subject<string>();
  schoolSession: SchoolDetails;
  themeType: number;
  loading: any;
  clubs = [];
  members:UsersModel[]=[];
  filteredMembers:UsersModel[]=[];
  parentClubKey = '';
  allMemebers = [];
  // OldSessionDetails: any;
  selectedMembersForTheSession = [];
  newSelectedMemberArray = [];

  schoolSessionForMember = {
    AmountDue: "0.00",
    AmountPaid: "0.00",
    ActivityCategoryKey: '',
    ActivityKey: '',
    ActivitySubCategoryKey: '',
    AmountPayStatus: "Due",
    AutoEnrolment: true,
    BookingButtonText: '',
    ClubKey: '',
    CoachKey: '',
    CoachName: '',
    Comments: '',
    CreatedBy: '',
    CreatedDate: 0,
    Days: '',
    Duration: '',
    EndDate: '',
    FinancialYearKey: '',
    GroupSize: '',
    IsActive: true,
    IsExistActivityCategory: false,
    IsExistActivitySubCategory: false,
    Key: '',
    NumberOfWeeks: 0,
    ParentClubKey: '',
    PayByDate: '',
    PaymentType: '',
    ReserveButtonText: '',
    SchoolKey: '',
    SchoolName: '',
    SessionFee: '',
    SessionName: '',
    SessionType: '',
    StartDate: '',
    StartTime: '',
    TermKey: '',
    UpdatedBy: '',
    UpdatedDate: 0,
    AllowChildCare: true
  };
  
  venus_user_input:UsersListInput = {
    parentclub_id:"",
    club_id:"",
    search_term:"",
    limit:18,
    offset:0,
    member_type:1
  }
  schoolSesEnrolDets: SchoolSesEnrolDets = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    get_payments: false,
    school_session_id: '',
    parent_fireabse_id: '',
    updated_by: '',
    enrol_users: []
  }

  constructor(public commonService: CommonService, private alertCtrl: AlertController, public storage: Storage,
    public loadingCtrl: LoadingController,private graphqlService: GraphqlService,
    public fb: FirebaseService,
    public navParams: NavParams, public navCtrl: NavController,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController) {
    this.themeType = this.sharedservice.getThemeType();
    this.schoolSession = <SchoolDetails>this.navParams.get('SchoolSession');

    //console.log("school session data is:", this.schoolSession);
    
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey; //firebase parentclubid
        this.schoolSesEnrolDets.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.schoolSesEnrolDets.school_session_id = this.schoolSession.id;
        this.schoolSesEnrolDets.updated_by = val.$key;
        this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
      //  this.schoolSesEnrolDets.MemberKey = val.$key;
        this.getParentClubUsers(1)//first time call to get users
        //this.getClubList();
      }
    });

    this.searchTerms.pipe(
      //filter(search_term => search_term.length > 2), // Filter out search terms with length less than 2
      debounceTime(400), // Wait for 500ms after the user stops typing
      distinctUntilChanged() // Only emit if the search term has changed
    ).subscribe(search_term => {
      // Call your API here using the term
      this.venus_user_input.offset = 0
      this.venus_user_input.limit = 18;
      
      if(search_term){
        this.venus_user_input.search_term = search_term!='' ? search_term:"";
      }else{
        this.venus_user_input.search_term = '';
      }
      this.getParentClubUsers(2);
    });

    this.newSelectedMemberArray = [];
    
   
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

  getClubList() {
    // this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
    //   this.clubs = this.commonService.convertFbObjectToArray(data);
    //   this.getMemberListsForEdit();
    // });
    //console.table(this.selectedMembersForTheSession);
  }

  doInfinite(infiniteScroll) {
    this.venus_user_input.offset += this.venus_user_input.limit + 1;
    //this.search_term = "";
    this.getParentClubUsers(1);
    setTimeout(() => {
      infiniteScroll.complete();
    }, 200);
  }

  getParentClubUsers = (type:number) => {
    this.allMemebers = [];
    //this.commonService.showLoader("Please wait");
    console.log("time started")
    console.time();
    const userQuery = gql`
    query getAllMembersByParentClubNMemberType($list_input:UsersListInput!) {
      getAllMembersByParentClubNMemberType(userInput:$list_input){
            Id
            FirebaseKey
            FirstName
            LastName
            ClubKey
            IsChild
            DOB
            EmailID
            EmergencyContactName
            EmergencyNumber
            Gender
            MedicalCondition
            ParentClubKey
            ParentKey
            PhoneNumber
            IsEnable
            IsActive
            PromoEmailAllowed
      }
    }
  `;
    this.graphqlService.query(userQuery,{list_input:this.venus_user_input},0)
      .subscribe(({ data }) => {
        console.timeEnd();
        console.log("time ended")
        console.log("member data" + JSON.stringify(data["getAllMembersByParentClubNMemberType"]));
        this.members =[];
        //this.members = data["getAllMembersByParentClubNMemberType"] as UsersModel[];
        if(data["getAllMembersByParentClubNMemberType"].length > 0){
          this.members = data["getAllMembersByParentClubNMemberType"].map((member: UsersModel) => ({
            ...member,
            isSelected: false,
            isAlreadExisted: false
          }));
        }
       
        if(type === 2){
          this.filteredMembers = JSON.parse(JSON.stringify(this.members))
        }else{
          this.filteredMembers = [...this.filteredMembers,...JSON.parse(JSON.stringify(this.members))];
        }
       // console.log("Getting Staff Data", this.members);
        this.checkForExistingUsers();
        //this.commonService.hideLoader();
      }, (err) => {
        this.commonService.toastMessage("Users fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      });

  }

  //find existing users in sessions and make them disable
  checkForExistingUsers() {
    this.schoolSession.session_member.forEach((enrolled_member:ISession_MemberEnrols) => {
      const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member.member.Id);
      if (matchingMember) {
        matchingMember['isSelected'] = true;
        matchingMember['isAlreadExisted'] = true;
      }
    });
    this.schoolSesEnrolDets.enrol_users.forEach((enrolled_member) => {
      const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member);
      if (matchingMember) {
        matchingMember['isSelected'] = true;
        //matchingMember['isAlreadExisted'] = true;
      }
    });
    console.table(this.filteredMembers);
  }

  //when member selected or deselected
  toggleMember(member:UserModel,cbox:Checkbox){
    // let isPresent = false;
    if (this.schoolSesEnrolDets.enrol_users.length > 0) {
      const userIndex = this.schoolSesEnrolDets.enrol_users.findIndex(userId => userId === member.Id);
      if (userIndex == -1) { //if user not found then push
        if(this.checkCapacityAvailability()){
          this.schoolSession.capacity_left--;
          this.schoolSesEnrolDets.enrol_users.push(member.Id)
        }else{
          if (cbox.checked){
            cbox.checked = false;
            this.commonService.toastMessage("Group size is full",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            //event.srcEvent.stopPropagation();
            return 
          } 
        }
      }else{
        this.schoolSesEnrolDets.enrol_users.splice(userIndex,1);
        this.schoolSession.capacity_left++;
      }
    }
    else if(this.schoolSesEnrolDets.enrol_users.length == 0) {
      if(this.checkCapacityAvailability()){
        this.schoolSession.capacity_left--;
        this.schoolSesEnrolDets.enrol_users.push(member.Id)
      }else{
        if (cbox.checked){
          cbox.checked = false;
          this.commonService.toastMessage("Group size is full",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          //event.srcEvent.stopPropagation();
          return 
        } 
      }
    }
  }

  //check capacity available or not
  checkCapacityAvailability(){
    if(this.schoolSession.capacity_left > 0){
      return true;
    }
    return false;
  }


 
  updateMemberList() {
    let confirm = this.alertCtrl.create({
      title: 'Add Member',
      message: 'Are you sure you want to add member?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
           this.saveMember();
          }
        }
      ]
    });
    confirm.present();

  }

  
  initializeItems() {
    this.members = this.allMemebers;
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();
    // set val to the value of the searchbar
    let val = ev.target.value;
    const searchTerm = ev.target.value;
    this.searchTerms.next(searchTerm);
    // if the value is an empty string don't filter the items
    
  }


  
  update(member) {
    this.navCtrl.push("UpdatePaymentDetails", { SelectedMember: member, SessionDetails: this.schoolSession });
  }

  //Add member in school-session
  saveMember() {
    this.commonService.showLoader("Please wait");
    this.schoolSesEnrolDets.get_payments = false;
    this.schoolSesEnrolDets.ActionType = 1;
    this.schoolSesEnrolDets.AppType = 1;
   
    console.log(JSON.stringify(this.schoolSesEnrolDets));

    const add_member_to_school = gql`
    mutation updateSchoolSesUserEnrolStatus($session_enrol_members: SchoolSesEnrolDets!) {
      updateSchoolSesUserEnrolStatus(session_enrol_members: $session_enrol_members){
        status
        enrolled_ids
      }
    }` 
    
    const variables = {session_enrol_members:this.schoolSesEnrolDets}

    this.graphqlService.mutate(add_member_to_school,variables,0).subscribe(
      result => {
        this.commonService.hideLoader();
        // Handle the result
        //console.log(`member__res:${result}`);
        this.commonService.toastMessage( "Members  added successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        this.commonService.updateCategory("update_scl_session_list");
        this.navCtrl.pop();
      },
      error => {
        // Handle errors
        this.commonService.hideLoader();
        console.error(error);
        this.commonService.toastMessage("Player Addition failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    );
   
  }

  
}




export class SchoolSesEnrolDets {
  ParentClubKey: string
  ClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  DeviceType: number
  get_payments: boolean
  school_session_id: string
  parent_fireabse_id: string
  enrol_users: string[]
  updated_by: string
}

export class UserModel {
  Id: string;
  Name: string;

  Gender: string;
  DOB: string;
  FirebaseKey: string;
}





//@InputType
export class VenueUsersInput{
    parentclubkey:string;
    clubkey:string;
    searchterm:string;
    limit:number;
    offset:number;
}

export class UsersListInput{//this one is new for new nextgen backend
  parentclub_id:string;
  club_id:string;
  search_term?:string;
  limit?:number;
  offset?:number;
  member_type?:number
  action_type?:number
}
  
  //@ObjectType()
  export class VenueUsers {
    venue_users: VenueUser[];
    total_users:number;
  }
  
  export class VenueUser  {
    Id: string;
    parent_firstname: string;
    parent_lastname: string;
    DOB: string;
    clubkey: string;
    parentFirebaseKey: string;
    email: string;
    phone_number:string;
    childcount: number;
    is_enable: boolean;
    is_coach: boolean;
    handicap: number;
    is_gold_member: boolean;
    allow_court_booking: boolean;
    membership_Id: string;
    vehicleRegNo1: string;
    vehicleRegNo2: string;
    Gender: string;
    medical_condition: string;
    parent_status:boolean; 
    media_consent:boolean;
    SignUpUnder?: number;
    SignedUpType?: number;
    emergency_number?: string;
  }
  
  //@ObjectType()
  export class Club  {
    Id: string;
    City: string;
    ClubContactName: string;
    ClubName: string;
    ClubShortName: string;
    CountryName: string;
    PostCode: string;
    ContactPhone:string;
    ClubDescription:string;
    sequence:number;
    FirebaseId: string;
  }
  //@ObjectType()
export class FamilyMember  {
  Id:string
  FirstName: string;
  LastName: string;
  EmailID: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
  ParentClubKey: string;
  ClubKey: string;
  IsChild: boolean;
  EmergencyContactName: string;
  EmergencyNumber: any;
  MedicalCondition: string;
  ParentKey: string;
  PhoneNumber: any;
  IsEnable: boolean;
  IsActive: boolean;
  PromoEmailAllowed: boolean;
  MediaConsent: boolean;
  SpecialNeeds: boolean;
  SpecialNeedsDesc:string;
  ChildSchoolMeals: boolean;
  ChildSchool: string;
  IncludeInLeaderBoard: boolean;
  Handicap: number;
  SetupName?:string
  CurrentPayment?:string;
  Validity?:string;
  IsSelect?:boolean
}
export class FamilyMemberInput{
  ParentClubKey:string;
  MemberKey:string;
  AppType:number;
  DeviceType:number; //Which app {1:Android,2:IOS,3:Web,4:API}
  ActionType:number //to get from postgre
}


export class AddMemberDTO{
  ParentClubId:string;
  MemberType:number; //to know member,holidaycamp or schoolmember
  VenueId:string;
  FirstName:string;
  LastName:string;
  MiddleName:string;
  DOB:string;
  Email:string;
  Password:string;
  Phone:string;
  Gender:string;
  Emergency_Contact_Name:string;
  Emergency_Contact_Number:string;
  Medical_Condition:string;
  
  // @Field(type => String,{ nullable: false })
  // Referral:string;
  Source:string; //ask can we store
  IsAcceptedTermsAndConditions:boolean;
  IsEnable:boolean; // to know mwmber or non-member
  IsChild:boolean;
  PromoEmailAllowed:boolean;
  NotificationEmailAllowed:boolean;
  IsTakenConcentForm:boolean;
  parent_id:string; //while reg family member
  vehicle_reg_no1:string; // required while profile update
  vehicle_reg_no2:string; // required while profile update

  // @Field(type => Int,{ nullable: true })
  // KidsLoginFlag:number; //can be used when family_member registers

  // @Field(type => String,{ nullable: true })
  // UserID:string; //required while apkids user

  // @Field(type => String,{ nullable: true })
  // MembershipID:string; // required while profile update
  is_childspl_needs:boolean;
  childspl_needs_desc:string;
  child_schoolmeals_paid:boolean;
  child_school:string;
  is_includein_leaderboard:boolean;
  is_child_had_disability:boolean;

  // @Field({ nullable: true})
  // allow_court_booking:boolean;

  // @Field({ nullable: true})
  // is_coach:boolean;

  // @Field({ nullable: true})
  // is_gold_member:boolean; //requires from admin profile update
  SignedUpType:number;
}


export class EnrolledMember {
  id: string
  is_active: boolean
  family_member: FamilyMember;
}

export class MemberShipUser {
  id: string

  membership_name: string
  min_member: 1
  max_member: 1
  membership_disclaimer: string
  monthly: boolean
  monthly_price: string
  yearly: boolean
  yearly_price: string
  description: string
  stripe_product_id: string
  stripe_monthly_plan_id: string
  stripe_yearly_plan_id: string
  stripe_connected_account_id: string
  status: number
  amount_to_show: string
  membership_packages: MemberShipPackage[]
  membership_package: MemberShipPackage;
}



export class MemberShipPackage {


  id: string
  latest_payment_date: string
  subscription_status: number
  membership_renewal_date: string
  membership_type: number
  cancellation_date: string
  stripe_subscription_id: string
  amount: string
  trial_period_days: string
  stripe_connected_account: string
  stripe_customer_id: string
  renewal_date: string
  enrolled_count: number
  enrollment_date: string
  start_date: string
  admin_fees: string
  membership_type_text: string
  one_time_discount: string
}

export class MemberShips {
  memberships: MemberShipData[];

}

export class MemberShipData {
  membership_name:string;
  id: string
  monthly: boolean
  yearly: boolean
  membership_tier: MemberShipTier
  membership_member_count: number
  plan: Plan
  membership_package: MembershipPackage
  enrolled_members: EnrolledMember[]
  membership_setup?:any;
}


export class MembershipPackage {
  id: string;
  subscription_status:number;
  membership_expiry_date:string;
  latest_payment_date:string
}

export class Plan {
  amount_to_show: string
  absolute_amount: string
  plan_name: string
  plan_id: string
}

export class MemberShipTier {
  id: string
  is_active: boolean
  name: string
}

export interface EnrolInput {

  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  user_ids: string[];
  parent_id: string;
  membership_id: string;
  membership_package_id: string;
  plan_type: number;
  start_month: string;


}

export interface MemberShipInput {

  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  membership_id: string;
  membership_package_id?:string

}

export class Months {
  month: number
  year: number
  date: string
  isSelect?: boolean
}

export interface RemoveUserFromMembership {

  parentclubId: string,
  clubId: string,
  activityId: string,
  memberId: string,
  action_type: 0,
  device_type: 0,
  app_type: 0,
  device_id: string,
  updated_by: string,
  membership_id: string,
  membership_package_id: string,
  membership_package_item_id: string,
  parent_id: string

}

export interface BookingSummaryInput {
  parentclubId: string,
  clubId: string,
  activityId: string,
  memberId: string,
  action_type: number,
  device_type: number,
  app_type: number,
  device_id: string,
  updated_by: string,
  membership_package_id: string
}

export class BookingDetails {
  booking_payment_text: {
    text: string
  }
  booking_payment_summary: {

    line_items: [
      {
        item_id: string,
        item_name: string,
        amount: string,
        amount_currency: string
      }
    ],
    membership_name: string,

    total_membership_amount: string,
    total_membership_amount_currency: string,
    discounts: [],
    one_time_discount_fee:string;
    discount_amount: string,
    discount_amount_currency: string,
    total_discount_amount_currency: string,
    total_discount_amount: string,
    admin_fees: string,
    admin_fees_currency: string,
    one_time_fee: string,
    one_time_fee_currency: string,
    total_net_payment_amount: string,
    total_net_payment_amount_currency: string
  }

}


export class ModifyMemberShipAdminFees {
  parentclubId: string
  clubId: string
  activityId: string
  memberId: string
  action_type: number
  device_type: number
  app_type: number
  device_id: string
  updated_by: string
  membership_package_id: string
  amount: string
  admin_fees: string
  start_date: string
  end_date: string
}

export class FamilyMemberModel {
  Id: string
  FirstName: string
  LastName: string
  member_enrolled: false
  IsSelect?:boolean
}