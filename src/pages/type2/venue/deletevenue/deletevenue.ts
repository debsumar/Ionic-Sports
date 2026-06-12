import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { Component, Renderer2 } from '@angular/core';
import { NavController, PopoverController, AlertController, ActionSheetController, NavParams, Events } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { ThemeService } from '../../../../services/theme.service';

@IonicPage()
@Component({
  selector: 'deletevenue-page',
  templateUrl: 'deletevenue.html'
})

export class DeleteVenue {
 nestUrl: any;
  venue: any;
  DeleteChecked = false
  deleteText = ''
  firebase_parentclub_key: string = '';
  totalMember = 0
  isDarkTheme: boolean = true; // 🌗 Default dark theme
  constructor(public alertCtrl: AlertController, public navParam: NavParams, public http: HttpClient, private commonService:CommonService, public storage: Storage, public actionSheetCtrl: ActionSheetController, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController, private httpService: HttpService,
    private renderer: Renderer2, private themeService: ThemeService, public events: Events) {
    this.venue = this.navParam.get('venue')
    this.firebase_parentclub_key = this.navParam.get('parentclub')
    this.storage.get('memberDetails').then((details) => {
      let countArray = details.club.filter(club => club.club == this.venue.clubid)
      if (countArray.length > 0){
        this.totalMember = countArray[0].member_count
      }else{
        this.totalMember = 0
      }
      
    });
  }

  ionViewWillEnter() {
    this.nestUrl = this.sharedservice.getnestURL()
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
    const pageElement = document.querySelector('deletevenue-page');
    if (pageElement) {
      isDark ? this.renderer.removeClass(pageElement, 'light-theme')
             : this.renderer.addClass(pageElement, 'light-theme');
    }
  }

  delete(){
    if (this.deleteText != 'DELETE'){
      this.commonService.toastMessage("Type 'DELETE' in input field", 3000, ToastMessageType.Error)
    }else {
      // if (this.venue.$key){
      //   this.fb.update(this.venue.$key, "/Club/Type2/" + this.parentclub, {IsEnable: false, IsActive: false})
      // }
      this.deleteVenue()
    }
  }

  async deleteVenue() {
    //delete firebase first then delete from postgres, so that if firebase deletion fails, we can stop the process and avoid data inconsistency
     await this.fb.update(this.venue.FirebaseId,"/Club/Type2/" + this.firebase_parentclub_key + "/", {IsEnable: false, IsActive: false})
      const body = {
          parentclub_id: this.sharedservice.getPostgreParentClubId(),
          club_id:this.venue.Id,
          app_type: AppType.ADMIN_NEW,
          device_type: this.sharedservice.getPlatform() == 'android' ? 1 : 2,
          device_id: this.sharedservice.getDeviceId() || 'web',
          updated_by: this.sharedservice.getLoggedInUserId(),
        };
    this.httpService.post(API.DELETE_VENUE, body, null, 1).subscribe((res) => {
      if (res['data']){
        this.commonService.toastMessage('Deletion Successful', 2000, ToastMessageType.Success)
        this.navCtrl.pop()
      }
    },err => {
        this.commonService.toastMessage('Deletion Failed', 2000, ToastMessageType.Error)
    })
  }

}
