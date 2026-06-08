import { Component, Renderer2 } from '@angular/core';
import { AlertController, NavParams, NavController, Platform, IonicPage, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SharedServices } from '../../../pages/services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { AppType, ModuleTypes } from '../../constants/module.constants';
import { HttpService } from '../../../services/http.service';
import { API } from '../../constants/api_constants';
import { ThemeService } from '../../../services/theme.service';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {
  isDarkTheme: boolean = true;
  notification_input = {
    parentClubId: '',
    userIds: [],
    heading: '',
    message: '',
    module_type: ModuleTypes.TERMSESSION
  };
  numberOfPeople = '0 People';
  userNames: string[] = [];
  recipients: { id: any; name: string; payStatus: number; selected: boolean }[] = [];
  isLeagueTeams: boolean = false;
  allSelected: boolean = true;

  constructor(
    public commonService: CommonService,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public navCtrl: NavController,
    public sharedservice: SharedServices,
    public storage: Storage,
    private httpService: HttpService,
    private themeService: ThemeService,
    private renderer: Renderer2,
    public events: Events
  ) {
    const user_ids = navParams.get('users') || [];
    const user_names = navParams.get('user_names') || [];
    const pay_status = navParams.get('pay_status') || [];
    this.isLeagueTeams = navParams.get('isLeagueTeams') || navParams.get('isMatchTeam') || false;
    this.notification_input.module_type = navParams.get('type');
    this.notification_input.heading = navParams.get('heading');
    this.notification_input.parentClubId = this.sharedservice.getPostgreParentClubId();
    this.userNames = user_names;
    this.recipients = user_names.map((name: string, i: number) => ({
      id: user_ids[i],
      name: name,
      payStatus: pay_status[i],
      selected: true
    }));
    this.updateRecipientCount();
  }

  ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.applyTheme(isDark);
    });
    this.events.subscribe('theme:changed', (isDark) => {
      this.applyTheme(isDark);
    });
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  async loadTheme() {
    const isDarkTheme = await this.storage.get('dashboardTheme');
    const isDark = isDarkTheme !== null ? isDarkTheme : true;
    this.applyTheme(isDark);
  }

  applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const el = document.querySelector('page-notifications');
    if (el) {
      isDark ? this.renderer.removeClass(el, 'light-theme')
             : this.renderer.addClass(el, 'light-theme');
    }
  }

  cancel() {
    this.navCtrl.pop();
  }

  toggleRecipient(r: { selected: boolean }) {
    r.selected = !r.selected;
    this.allSelected = this.recipients.length > 0 && this.recipients.every(item => item.selected);
    this.updateRecipientCount();
  }

  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    this.recipients.forEach(r => r.selected = this.allSelected);
    this.updateRecipientCount();
  }

  updateRecipientCount() {
    this.numberOfPeople = this.recipients.filter(r => r.selected).length + ' recipients';
  }

  getSelectedUserIds() {
    const ids = this.recipients
      .filter(r => r.selected)
      .map(r => r.id)
      .filter(id => id !== undefined && id !== null && id !== '');
    return Array.from(new Set(ids));
  }

  sendNotification() {
    let confirm = this.alertCtrl.create({
      title: 'Notification Alert',
      message: 'Are you sure you want to send the notification to the selected members?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => { this.notify(); } }
      ]
    });
    confirm.present();
  }

  notify() {
    if (this.notification_input.message === '') {
      this.commonService.toastMessage('Please enter the notification message', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    const selectedUserIds = this.getSelectedUserIds();
    if (selectedUserIds.length === 0) {
      this.commonService.toastMessage('Please select at least one recipient', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    const body = {
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || 'web',
      updated_by: this.sharedservice.getLoggedInUserId(),
      subject: this.notification_input.heading,
      message: this.notification_input.message,
      user_ids: selectedUserIds,
      module_type: this.notification_input.module_type,
      module_id: this.navParams.get('module_id'),
      sub_module_id: this.navParams.get('sub_module_id') || null,
      page_id: this.navParams.get('page_id'),
    };

    this.commonService.showLoader('Sending notification...');
    this.httpService.post(API.SEND_PUSH_NOTIFICATION, body, null, 1).subscribe({
      next: (res: any) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage('Notification sent successfully.', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
      },
      error: (err) => {
        this.commonService.hideLoader();
        console.error('Error sending notification:', err);
        this.commonService.toastMessage('Notification sent failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }
}
