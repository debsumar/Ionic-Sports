import { MenuController } from 'ionic-angular';
// import { Type2Member } from '../type2/member/member';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, Events, IonicPage } from 'ionic-angular';
import { SharedServices } from '../services/sharedservice';
// import { Dashboard } from '../dashboard/dashboard';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingController, ToastController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../services/common.service';
import { Keyboard } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { BookingMemberType } from './../../services/common.service';
@IonicPage()
@Component({
  selector: 'login-page',
  templateUrl: 'login.html'
})

export class Login {
  // backUrl = "assets/images/TopSplice.png"
  rootPage: any;
  themeType: number;
  usersList = [];
  coachUserList = [];
  user = {
    emailID: '',
    password: ''
  };


  isExist: boolean = false;
  isExistEmailID: boolean = false;
  isExistPassword: boolean = false;
  isKeyBoardOpen: boolean = false;
  loading: any;
  isEmailOpen: boolean = false;
  isPasswordOpen: boolean = false;
  
  sub:Subscription;
  coach$Obs:Subscription;
  subAdmin$Obs:Subscription;
  Apadmin$Obs:Subscription;
  constructor(public http: HttpClient, public plt: Platform, private keyboard: Keyboard, public commonService: CommonService, public loadingCtrl: LoadingController, public menuCtrl: MenuController, public toastCtrl: ToastController, public events: Events, public navCtrl: NavController, public fb: FirebaseService, public sharedservice: SharedServices, public storage: Storage) {
    this.menuCtrl.swipeEnable(false);
    this.themeType = sharedservice.getThemeType();
  }
  goToForgotPassword() {
    this.navCtrl.push("ForgotPassword");
  }

  validateUserInputForLogin(): boolean {
    if (this.user.emailID == "") {
      let message = "Please enter email id";
      this.showToast(message, 5000);

      return false;
    }
    else if (!this.validateEmail(this.user.emailID)) {
      let message = "Please enter correct email id";
      this.showToast(message, 5000);
      return false;
    }
    else if (this.user.password == "") {
      let message = "Please enter password";
      this.showToast(message, 5000);
      return false;
    }

    return true;
  }
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }


  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      position: 'bottom'
    });
    toast.present();
  }

  login() {

    let userData = [];
    let isExistFlag = false
    if (this.validateUserInputForLogin()) {
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present();
      this.user.emailID = ((this.user.emailID).trim()).toLowerCase();
      this.sub = this.fb.getAllWithQuery("User/", { orderByChild: 'EmailID', equalTo: this.user.emailID }).subscribe((data) => {
        //const loggedinkey = '-LycWrA_OLN75p6j-RFI';
        //const loggedinkey = '-KuAlAXTl7UQ2hFp4ljQ';
      //this.sub = this.fb.getAllWithQuery(`User/`, { orderByKey: true, equalTo: loggedinkey }).subscribe((data) => { 
        userData = data;
        if (data.length > 0) {
          isExistFlag = true;
          if (this.user.password == data[0].Password) {
            let userinfo: Array<any>;
            this.storage.set('isLogin', true);
            this.storage.set('LoginWhen', 'first');
            userinfo = this.commonService.convertFbObjectToArray(data[0].UserInfo);
            data[0].UserInfo = userinfo;
            //delete data[0].Web
            this.storage.set('userObj', JSON.stringify(data[0]));
            this.storage.set('memberType', BookingMemberType.ADMIN);
            this.sharedservice.setLoggedInType(BookingMemberType.ADMIN);
            this.storage.set('UserKey', JSON.stringify(data[0].$key));
            this.sharedservice.setUserData(data[0]);
            this.events.publish('user:loginsuccessfully', data[0], Date.now());
            // this.checkAndStoreDeviceToken("fgzOgNOrktw:APA91bHb3DSGr2DcR50zyC6_7DtjCwNGl-8Ib4ZjMgqpBXLGedox4Rya9eCKFzmlbKtTJhFHi7xJ81Ijpt3vmM3i01CxrHUk1rEU8REiuxmVpIbwg53AB5CIcy314BVVQN-MStGZfse7",userinfo[0],"admin");
            if (this.sharedservice.getDeviceToken() != "") {
              //let returnKey = this.fb.saveReturningKey("DeviceToken/ParentClub/" + data[0].UserInfo[0].ParentClubKey, { DeviceToken: this.sharedservice.getDeviceToken() });
              //this.storage.set('UserTokenKey', returnKey);
              this.checkAndStoreDeviceToken(this.sharedservice.getDeviceToken(), userinfo[0], "admin");
            }
            this.sub.unsubscribe();
            if (this.themeType == 2) {
              this.navCtrl.setRoot("Dashboard");
              this.commonService.toastMessage("Logged in successfully...",1000,ToastMessageType.Success,ToastPlacement.Bottom);
            }
           
          } else {
            let message = "Invalid User ID or Password";
            this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
          }
        }
        else if (data.length == 0) {
        this.coach$Obs =   this.fb.getAllWithQuery("User/Coach/", { orderByChild: 'EmailID', equalTo: this.user.emailID }).subscribe((response) => {
            userData = response;
            if (response.length > 0 && (response[0].IsActive == undefined || response[0].IsActive)) {
              isExistFlag = true;
              if (this.user.password == response[0].Password) {
                let userinfo: Array<any>;
                this.storage.set('isLogin', true);
                this.storage.set('LoginWhen', 'first');
                userinfo = this.commonService.convertFbObjectToArray(response[0].UserInfo);
                response[0].UserInfo = userinfo;
                this.storage.set('userObj', JSON.stringify(response[0]));
                this.storage.set('memberType', BookingMemberType.COACH);
                this.sharedservice.setLoggedInType(BookingMemberType.COACH);
                this.storage.set('UserKey', JSON.stringify(response[0].$key));
                this.sharedservice.setUserData(response[0]);
                this.events.publish('user:loginsuccessfully', response[0], Date.now());
                if (this.sharedservice.getDeviceToken() != "") {
                  let userInfo = this.commonService.convertFbObjectToArray(response[0].UserInfo);
                  // let returnKey = this.fb.saveReturningKey("DeviceToken/Coach/" +userInfo[0].ParentClubKey+"/"+userInfo[0].CoachKey, { DeviceToken: this.sharedservice.getDeviceToken() });
                  this.checkAndStoreDeviceToken(this.sharedservice.getDeviceToken(), userinfo[0], "coach");
                  // this.storage.set('UserTokenKey', returnKey);
                }
                this.coach$Obs.unsubscribe();
                if (this.themeType == 2) {
                  this.navCtrl.setRoot("Dashboard");
                  this.commonService.toastMessage("Logged in successfully...",1000,ToastMessageType.Success,ToastPlacement.Bottom);
                }
              } else {
                let message = "Invalid User ID or Password";
                this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
              }
            }
            else if (data.length == 0) {   
              this.subAdmin$Obs = this.fb.getAllWithQuery("User/SubAdmin/", { orderByChild: 'EmailID', equalTo: this.user.emailID }).subscribe((subAdminresponce) => {
                if (subAdminresponce.length > 0) {
                  isExistFlag = true;
                  if (this.user.password == subAdminresponce[0].Password && (subAdminresponce[0].IsActive == undefined || subAdminresponce[0].IsActive)) {
                    let userinfo: Array<any>;
                    this.storage.set('isLogin', true);
                    this.storage.set('LoginWhen', 'first');
                    userinfo = this.commonService.convertFbObjectToArray(subAdminresponce[0].UserInfo);
                    subAdminresponce[0]["SignedUpUnder"] = 6; //this  is to,when updating a password from popover page, we don't know the user node is stored where.,
                      //because sometimes subadmin can be member and he's node we'll be in SubAdmin node,So we have to check while reset password
                    subAdminresponce[0].UserInfo = userinfo;
                    this.storage.set('userObj', JSON.stringify(subAdminresponce[0]));
                    this.storage.set('memberType', BookingMemberType.SUBADMIN);
                    this.sharedservice.setLoggedInType(BookingMemberType.SUBADMIN);
                    this.storage.set('UserKey', JSON.stringify(subAdminresponce[0].$key));
                    this.sharedservice.setUserData(subAdminresponce[0]);
                    this.events.publish('user:loginsuccessfully', subAdminresponce[0], Date.now());
                    this.subAdmin$Obs.unsubscribe();
                    if (this.themeType == 2) {
                      this.navCtrl.setRoot("Dashboard");
                      this.commonService.toastMessage("Logged in successfully...",1000,ToastMessageType.Success,ToastPlacement.Bottom);
                    }
                  }else {
                    let message = "Invalid User ID or Password";
                    this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
                  }
                }else if (subAdminresponce.length == 0) {
                  this.Apadmin$Obs = this.fb.getAllWithQuery("User/APAdmin/", { orderByChild: 'EmailID', equalTo: this.user.emailID }).subscribe((AppAdminresponce) => {
                    if (AppAdminresponce.length > 0) {
                      isExistFlag = true;
                      if (this.user.password == AppAdminresponce[0].Password) {
                        this.storage.set('isAppAdminLogin', true);
                        this.sharedservice.setAdminStatus(true);
                        this.storage.set('APadminDetails', this.user.emailID)
                        //this.storage.set('LoginWhen', 'first');
                        this.navCtrl.setRoot("AppadmindashboardPage");
                        this.commonService.toastMessage("Logged in successfully...",1000,ToastMessageType.Success,ToastPlacement.Bottom);
                        this.Apadmin$Obs.unsubscribe();
                      }else {
                        let message = "Invalid User ID or Password";
                        this.showToast(message, 3000);
                      }
                    }else if(AppAdminresponce.length == 0){
                      let message = "Invalid User ID or Password";
                      this.commonService.toastMessage(message,3000,ToastMessageType.Error,ToastPlacement.Bottom);
                    } 
                  });
                }
                
              })
            } 
          });
        }
        loading.dismiss().catch(() => { });
      });
    }        















    // this.coachUserList.forEach(element => {
    //   this.usersList.push(element);
    // });
    // let userinfo: Array<any>;

    // this.user.emailID = ((this.user.emailID).trim()).toLowerCase();
    // if (this.validateUserInputForLogin()) {
    //   let flag = true;
    //   for (let element of this.usersList) {
    //     if (element.EmailID != undefined) {
    //       if (element.EmailID.toLowerCase() == (this.user.emailID).trim() && element.Password == this.user.password) {
    //         if (element.CoachStatus == 1 || element.CoachStatus == undefined) {
    //           this.isExist = true;
    //           this.storage.set('isLogin', true);
    //           userinfo = this.convertFbObjectToArray(element.UserInfo);
    //           element.UserInfo = userinfo;
    //           this.storage.set('userObj', JSON.stringify(element));
    //           this.storage.set('UserKey', JSON.stringify(element.$key));
    //           //devicetoken store in fb
    //           //Not needed as of now

    //           // if (element.RoleType == "2" && element.UserType == "2") {
    //           //   this.fb.saveReturningKey("DeviceToken/" + userinfo[0].ParentClubKey + "/Token/", { DeviceToken: this.sharedservice.getDeviceToken() });
    //           // }

    //           this.events.publish('user:loginsuccessfully', element, Date.now());
    //           if (this.themeType == 2) {
    //             this.navCtrl.setRoot("Dashboard");
    //             this.showToast("You have successfully logged in.", 2000);
    //           }
    //           else {
    //             // this.navCtrl.setRoot(Type2Member);
    //           }
    //         }
    //         else {
    //           flag = false;
    //           break;
    //         }
    //       }
    //     }
    //   }

    //   if (!flag) {
    //     var message = "Your membership has been disabled. Please call our office";
    //     this.showToast(message, 3000);
    //     return false;
    //   }



    //   if (!this.isExist) {
    //     for (let element of this.usersList) {
    //       if (element.EmailID != undefined) {
    //         if (element.EmailID.toLowerCase() == this.user.emailID) {
    //           this.isExistEmailID = true;
    //           break;
    //         }
    //       }
    //     }
    //     for (let element of this.usersList) {
    //       if (element.Password == this.user.password) {
    //         this.isExistPassword = true;
    //         break;
    //       }
    //     }
    //     if (this.isExistEmailID) {
    //       this.isExistEmailID = false;
    //       this.isExistPassword = false;
    //       this.isExist = false;
    //       var message = "Invalid userid/password";
    //       this.showToast(message, 5000);
    //     }
    //     else if (this.isExistPassword) {
    //       //  alert("It seems,You have not registered yet.");

    //       this.isExistEmailID = false;
    //       this.isExistPassword = false;
    //       this.isExist = false;

    //       var message = "Invalid userid/password";
    //       this.showToast(message, 5000);
    //     }
    //     else {
    //       //  alert("It seems,You have not registered yet.");
    //       this.isExistEmailID = false;
    //       this.isExistPassword = false;
    //       this.isExist = false;
    //       var message = "It seems,You have not registered yet.";
    //       this.showToast(message, 5000);

    //     }
    //   }

    // }


  }
  checkDeviceToken() {

  }
  checkAndStoreDeviceToken(token, userData, type) {
    if (this.sharedservice.getOnesignalPlayerId()) {
      let key = userData.ParentClubKey;
      if (type == 'coach') {
        key = userData.Key
      }
      this.commonService.saveDeviceDetsforNotify(key)
    }

  }


  goToContactUs(){
    this.navCtrl.push('LoginContactUs')
  }


  ionViewWillLeave() { //unsbscribe all subscription to avoid all unnecessary data leaks
    //The Subscription object also has a closed property that one can use to check if the stream was already unsubscribed (completed or had an error).
    if(this.sub && !this.sub.closed){
      this.sub.unsubscribe();
    }
    if(this.subAdmin$Obs && !this.subAdmin$Obs.closed){
      this.subAdmin$Obs.unsubscribe();
    }
    if(this.coach$Obs && !this.coach$Obs.closed){
      this.coach$Obs.unsubscribe();
    }
    if(this.Apadmin$Obs && !this.Apadmin$Obs.closed){
      this.Apadmin$Obs.unsubscribe();
    }
    
  }

}

