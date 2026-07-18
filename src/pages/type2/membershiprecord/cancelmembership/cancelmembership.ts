import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { HttpService } from '../../../../services/http.service';
import { MemberShipInput } from '../../member/model/member';
import { API } from '../../../../shared/constants/api_constants';

@IonicPage()
@Component({
  selector: 'page-cancelmembership',
  templateUrl: 'cancelmembership.html',
  providers: [HttpService]
})
export class CancelMembershipPage {
  platformType: any;
  ClubKey: any;
  ParentClubKey: any;
  currencycode: any;
  membership: any;
  memberDetails: any;
  memberofSameMembership: any = [];
  subscriptionList: any[];
  lastPaymentDate: any = '';
  cancelText = '';
  loading: any;
  nodeUrl: string;
  cancel_input: MemberShipInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    membership_id: ''
  };
  membership_info: ICancelMembership;

  // THEME
  isDarkTheme: boolean = true;

  constructor(
    public navCtrl: NavController,
    public storage: Storage,
    public sharedservice: SharedServices,
    public comonService: CommonService,
    public navParam: NavParams,
    public httpService: HttpService,
    public events_subscription: Events,
  ) {
    this.membership_info = this.navParam.get('cancellation_obj');
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
    });
    this.storage.get('postgre_parentclub').then((postgre_parentclub) => {
      this.cancel_input.parentclubId = postgre_parentclub.Id;
      this.cancel_input.memberId = this.membership_info.member_id;
      this.cancel_input.membership_id = this.membership_info.membership_id;
      this.cancel_input.membership_package_id = this.membership_info.membership_package_id;
    });
  }

  ionViewWillEnter() {
    this.loadTheme();
  }

  ionViewWillLeave() {
    this.events_subscription.unsubscribe('theme:changed');
  }

  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme !== null ? isDarkTheme : true;
      this.applyTheme();
    }).catch(() => {
      this.isDarkTheme = true;
      this.applyTheme();
    });
    this.events_subscription.subscribe('theme:changed', (isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme();
    });
  }

  applyTheme() {
    const el = document.querySelector('page-cancelmembership');
    if (el) {
      if (this.isDarkTheme) {
        el.classList.remove('light-theme');
        document.body.classList.remove('light-theme');
      } else {
        el.classList.add('light-theme');
        document.body.classList.add('light-theme');
      }
    } else {
      setTimeout(() => {
        const retryEl = document.querySelector('page-cancelmembership');
        if (retryEl) {
          if (this.isDarkTheme) {
            retryEl.classList.remove('light-theme');
          } else {
            retryEl.classList.add('light-theme');
          }
        }
      }, 100);
    }
  }

  cancel() {
    if (this.cancelText.toLowerCase() === 'cancel') {
      try {
        this.comonService.commonAlter('Cancel Membership', 'Are you sure want to cancel membership?', async () => {
          this.httpService.post(`${API.CANCEL_MEMBERSHIP}`, this.cancel_input)
            .subscribe(data => {
              console.log(data);
              this.comonService.toastMessage('Membership cancelled', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              this.comonService.updateCategory('update_user_memberships_list');
              this.navCtrl.pop();
            }, error => {
              if (error) {
                this.comonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
            });
        });
      } catch (err) {
        this.comonService.toastMessage('Please try again / contact support team', 2500, ToastMessageType.Error);
      }
    } else {
      this.comonService.toastMessage("Please type 'CANCEL'...", 2500, ToastMessageType.Error);
    }
  }
}

export interface ICancelMembership {
  membership_name: string;
  expiry_date: string;
  last_payment_date: string;
  membership_id: string;
  member_id: string;
  membership_package_id: string;
}
