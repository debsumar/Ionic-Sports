import { Component } from '@angular/core';
import { LoadingController, AlertController, ToastController, NavController, FabContainer, Platform, ViewController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { Http, Headers, RequestOptions } from '@angular/http';;
import * as $ from 'jquery';
import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { ActionSheetController } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
@IonicPage()
@Component({
    selector: 'notification-page',
    templateUrl: 'notification.html'
})

export class Type2notification {
    //content:Content;
    returnKey: any;
    parentClubEmail: string;
    parentClubName: string;
    clubShortName: "";
    clubName: "";
    themeType: number; 
    isAndroid: boolean = false;
    parentClubKey: any;
    selectedTab: string = "Recents";
    clubs: any;
    selectedClub: any;
    memberList = [];
    MemberListsForDeviceToken = [];
    activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };
    selectedCoachName: any;
    session = [];
    selectedSession: "";
    notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
    notificationObjForSesion = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
    emailObj = { Message: "", Subject: "" };
    isEmail = true;
    selectedActivityType = "";
    selectedCoach = "";
    types = [];
    coachs = [];
    sessionList = [];
    selectectedSessionObj = { Member: [] };
    allSessionMembers = [];
    currentSessionDetails: any;
    currentSessionMembers = [];
    numberOfPeopleToSend = 0;
    recentNotificationList = [];
    loading: any;
    parentClubDetails: any;
    // androidDeviceTokens = [];
    // iOSDeviceTokens = [];
    deviceToken = [];
    blockIndex = -1;
    tempNotification = [];
    notification = [];
    currentLastIndex = 30;
    notificationCountDevider = 0;
    notificationCountreminder = 0;


    copiedText: any = "";

    checkMemberKeySet:Set<String> = new Set();
    constructor(private clipboard: Clipboard, public actionSheetCtrl: ActionSheetController, public viewController: ViewController, public commonService: CommonService, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private toastCtrl: ToastController, private http: Http, public fb: FirebaseService, private storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
        // this.loading = this.loadingCtrl.create({
        //     content: 'Please wait...'
        // });
        // this.loading.present();
        this.themeType = sharedservice.getThemeType();
        this.isAndroid = platform.is('android');
    }
    ionViewDidLoad() {
        this.storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
                this.parentClubName = val.Name;
                this.parentClubEmail = val.EmailID;

                this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
                    this.parentClubDetails = data[0];

                    this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone + "\n" + this.parentClubDetails.ParentClubAdminEmailID;


                });

    
                this.getAllNotification();
            }
        });
    }
    ionViewDidEnter(){
       this.ionViewDidLoad();
    }
    getAllNotification() {
        let x = this.fb.getAllWithQuery("/Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", { orderByKey: true }).subscribe((data) => {
            this.notification = data;
            if (this.notification.length >= 30) {
                this.tempNotification = JSON.parse(JSON.stringify(data)).slice(this.notification.length - 31, this.notification.length);
                this.currentLastIndex = 30;
                this.notificationCountDevider = (this.notification.length / 30) - 1;
                this.notificationCountreminder = this.notification.length % 30;
            } else {
                this.tempNotification = JSON.parse(JSON.stringify(data));
                this.currentLastIndex = this.tempNotification.length;

            }

            this.getNotification(this.tempNotification);
            x.unsubscribe();
        });
    }
    doInfinite(infiniteScroll) {
        if (this.currentLastIndex >= 30) {
            setTimeout(() => {
                if (this.notificationCountDevider > 0) {
                    this.tempNotification = JSON.parse(JSON.stringify(this.notification)).slice((30 * this.notificationCountDevider) - 30, (30 * this.notificationCountDevider) + 1);
                    this.notificationCountDevider--;
                    this.getNotification(this.tempNotification);

                } else if (this.notificationCountreminder > 0) {
                    this.tempNotification = JSON.parse(JSON.stringify(this.notification)).slice(1, this.notificationCountreminder + 1);
                    this.notificationCountreminder = 0;
                    this.getNotification(this.tempNotification);
                }
                console.log('Async operation has ended');
                infiniteScroll.complete();
            }, 10);
        }
    }

    getNotification(data) {
        data.reverse();
        let time;
        let x = data;
        for (let i = 0; i < x.length; i++) {
            data[i].ComposeOn = this.commonService.convertDatetoDDMMMBySpliting(data[i].ComposeOn);
            if (data[i].IsActive == true || data[i].IsActive == undefined) {
                this.recentNotificationList.push(data[i]);
            }
        }

        //this.recentNotificationList = data;
        if (data.length > 0) {
            for (let i = 0; i < this.recentNotificationList.length; i++) {
                if (this.navCtrl.isActive(this.viewController)) {
                    this.fb.update(this.recentNotificationList[i].$key, "/Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", { Status: "Read" })
                }

                let totalTimeInMiliSec = new Date().getTime() - new Date(this.recentNotificationList[i].CreatedTime).getTime();

                if (totalTimeInMiliSec >= 0 && totalTimeInMiliSec < 60000) {
                    time = totalTimeInMiliSec / 1000;
                    this.recentNotificationList[i].TimesAgo = Math.floor(time) + "sec";
                }
                else if (totalTimeInMiliSec >= 60000 && totalTimeInMiliSec < 3600000) {
                    time = totalTimeInMiliSec / 60000;
                    this.recentNotificationList[i].TimesAgo = Math.floor(time) + "min";
                }
                else if (totalTimeInMiliSec >= 3600000 && totalTimeInMiliSec < 86400000) {
                    time = totalTimeInMiliSec / 3600000;
                    this.recentNotificationList[i].TimesAgo = Math.floor(time) + "hr";
                }
                else if (totalTimeInMiliSec >= 86400000 && totalTimeInMiliSec < 2678400000) {
                    time = totalTimeInMiliSec / 86400000;
                    this.recentNotificationList[i].TimesAgo = Math.floor(time) + "day";
                }
                else if (totalTimeInMiliSec >= 2678400000 && totalTimeInMiliSec < 31536000000) {
                    time = totalTimeInMiliSec / 2678400000;
                    this.recentNotificationList[i].TimesAgo = Math.floor(time) + "month";
                } else if (totalTimeInMiliSec >= 31536000000) {
                    time = totalTimeInMiliSec / 31536000000;
                    this.recentNotificationList[i].TimesAgo = Math.floor(time) + "yr";
                }
            }
        }
    }

    //DONE
 
  







  

    cancel() {
        this.navCtrl.pop();
    }

    focusOutMessage() {

        this.emailObj.Subject = this.notificationObj.Message.split(/\s+/).slice(0, 4).join(" ");
        //this.emailObj.Message = this.notificationObj.Message;
    }




    showToast2(m: string, item) {
        let duration = 4000;
        let tm: any = "";

        let toast = this.toastCtrl.create({
            message: m,
            duration: duration,

            showCloseButton: true,
            closeButtonText: "Undo",
            position: 'bottom',

        });
        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
            let now = new Date().getSeconds();
            let toaststartTime = new Date(tm).getSeconds();
            let dura = 0;
            if (now > duration) {
                dura = now - duration;
            } else {
                dura = duration - now;
            }
            console.log(now);
            console.log(toaststartTime);
            if ((now - toaststartTime) < 4) {
                console.log('clicked');
                this.cancelDeleteNotification(item);
            }
        });
        toast.willEnter.subscribe(() => {
            tm = new Date();
        })
        // click: () => {
        //     item['IsActive'] = false;
        //     this.fb.update(item.$key,"/Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/",{IsActive:false});
        // }
        toast.present(

        );
    }
    cancelDeleteNotification(item) {
        item['IsActive'] = true;
        this.fb.update(item.$key, "/Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", { IsActive: true });
    }
    showToast(m: string) {

        let toast = this.toastCtrl.create({
            message: m,
            duration: 5000,

            position: 'bottom',
            showCloseButton: true,
           
        });

        toast.present();
    }

  


    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }


    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }






    showAlert(item) {
        this.navCtrl.push("NotificationDetails", { "NotificationDetail": item });
    }


    preContext = '';
    showBlock(index, data) {
        this.blockIndex = (this.blockIndex == index) ? -1 : index;
        this.preContext = JSON.parse(JSON.stringify(data));
    }









    copy(data) {
        this.clipboard.copy(data);
        this.showToast('Content Copied');
        console.log(this.clipboard.paste());
    }
    favorite(item) {
        console.log(item);
    }
    delete(item) {
        console.log(item);
        item['IsActive'] = false;
        this.fb.update(item.$key, "/Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", { IsActive: false });
        this.showToast2('Deleted', item);
    }
    goToNotificationContainer(fab:FabContainer,index:number){
        fab.close();
        this.navCtrl.push("ComposecontainerPage",{slideIndex:index});
    }
}