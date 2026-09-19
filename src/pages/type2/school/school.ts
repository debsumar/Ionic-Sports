import { Component, Renderer2 } from '@angular/core';
import { Events, IonicPage, NavController, PopoverController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';

@IonicPage()
@Component({
  selector: 'school-page',
  templateUrl: 'school.html'
})
export class Type2School {
  themeType: number;
  isDarkTheme: boolean = true;
  parentClubKey: string;
  schools: any;
  clubs: any;
  selectedClub: any;
  menus: Array<{
    DisplayTitle: string;
    OriginalTitle: string;
    MobComponent: string;
    WebComponent: string;
    MobIcon: string;
    MobLocalImage: string;
    MobCloudImage: string;
    WebLocalImage: string;
    WebIcon: string;
    WebCloudImage: string;
    MobileAccess: boolean;
    WebAccess: boolean;
    Role: number;
    Type: number;
    Level: number;
  }>;
  platform: string = '';

  private themeChangeHandler = (isDark: boolean) => this.applyTheme(isDark);

  constructor(
    public commonService: CommonService,
    public navCtrl: NavController,
    public sharedservice: SharedServices,
    public fb: FirebaseService,
    public popoverCtrl: PopoverController,
    private renderer: Renderer2,
    private storage: Storage,
    private events: Events
  ) {
    this.platform = this.sharedservice.getPlatform();
    this.themeType = sharedservice.getThemeType();
    this.menus = sharedservice.getMenuList();
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (const club of val.UserInfo) {
        if (val.$key != '') {
          this.parentClubKey = club.ParentClubKey;
          this.getSchoolLists();
        }
      }
    });
  }

  getSchoolLists() {
    const schools$Obs = this.fb
      .getAll('/School/Type2/' + this.parentClubKey + '/')
      .subscribe((data) => {
        schools$Obs.unsubscribe();
        this.schools = data;
        console.table(this.schools);
      });
  }

  ionViewWillEnter() {
    this.storage
      .get('dashboardTheme')
      .then((isDarkTheme) => {
        const isDark =
          isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true;
        this.applyTheme(isDark);
      })
      .catch(() => this.applyTheme(true));

    this.events.subscribe('theme:changed', this.themeChangeHandler);
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed', this.themeChangeHandler);
  }

  applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const pageElement = document.querySelector('school-page');
    if (pageElement) {
      if (isDark) {
        this.renderer.removeClass(pageElement, 'light-theme');
        this.renderer.addClass(pageElement, 'dark-theme');
      } else {
        this.renderer.removeClass(pageElement, 'dark-theme');
        this.renderer.addClass(pageElement, 'light-theme');
      }
    }
  }

  ionViewDidLoad() {
    this.commonService.screening('Type2School');
  }

  presentPopover(myEvent) {
    const popover = this.popoverCtrl.create('PopoverPage');
    popover.present({ ev: myEvent });
  }

  gotoAddSchool() {
    this.navCtrl.push('Type2AddSchool');
  }

  gotoaddnewschool() {
    this.navCtrl.push('AddnewSchool');
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot('Dashboard');
  }
}
