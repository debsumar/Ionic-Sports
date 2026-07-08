import { Component, Renderer2 } from '@angular/core';
import { NavController, PopoverController, LoadingController, Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { ThemeService } from '../../../services/theme.service';
@IonicPage()
@Component({
    selector: 'courtbooklist-page',
    templateUrl: 'courtbooklist.html'
})

export class Type2CourtBookList {
    themeType: number;
    isDarkTheme: boolean = true;
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
    courtBookTab: string = "recurring";
    allClub = [];
    selectedClub: any;
    allActivityArr = [];
    selectedActivity: any;
    allCourtArr = [];
    selectedCoat: any;
    allBookedCourtArr = [];
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, public storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
         public fb: FirebaseService, public popoverCtrl: PopoverController,
         private renderer: Renderer2, private themeService: ThemeService, public events: Events) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
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
        this.loadTheme();
        this.themeService.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
        this.events.subscribe('theme:changed', (isDark) => this.applyTheme(isDark));
    }

    ionViewWillLeave() {
        this.events.unsubscribe('theme:changed');
    }

    async loadTheme() {
        const isDarkTheme = await this.storage.get('dashboardTheme');
        const isDark = isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true;
        this.isDarkTheme = isDark;
        this.applyTheme(isDark);
    }

    applyTheme(isDark: boolean) {
        this.isDarkTheme = isDark;
        const pageElement = document.querySelector('courtbooklist-page');
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
  

    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

    gotoCourtSetupHome() {
        if (this.courtBookTab == "recurring") {
            this.navCtrl.push("Type2RecurringCourtBook");
        }
        else if (this.courtBookTab == "oneoff") {
            this.navCtrl.push("Type2OneoffCourtBook");
        }
    }

    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            //alert();
            if (data.length > 0) {
                this.allClub = data;
                this.selectedClub = data[0].$key;
                this.getAllActivity();
            }
        })
    }

    onClubChange() {
        this.getAllActivity();
    }

    getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.allActivityArr = [];
            if (data.length > 0) {
                this.allActivityArr = data;
                this.selectedActivity = data[0].$key;
                this.getAllCourt();
            }
        })
    }

    getAllCourt() {
        this.fb.getAll("/Court/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/").subscribe((data) => {
            this.allCourtArr = [];
            if (data.length > 0) {
                this.allCourtArr = data;
                this.selectedCoat = data[0].$key;
                this.getBookedCourt();
            }
        })
    }

    getBookedCourt() {
        let coatKey = this.selectedCoat;
        this.fb.getAll("/CourtBooking/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/" + coatKey + "/").subscribe((data) => {
            this.allBookedCourtArr = [];
            if (data.length > 0) {
                this.allBookedCourtArr = data;
            }
        })
    }

    setDate(inputDate) {
        var date = new Date(inputDate);
        return date.getDate() + '/' + ((date.getMonth()) + 1) + '/' + date.getFullYear();
    }

    detailCourtBooking() {
    }

    editCourtBooking(){
    }

    cancelCourtBooking(){
    }
    

}
