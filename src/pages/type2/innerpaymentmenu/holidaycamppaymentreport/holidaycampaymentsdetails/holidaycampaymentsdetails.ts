import { Component, Renderer2 } from '@angular/core';
import { Events, IonicPage, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';

import { HttpService } from '../../../../../services/http.service';
import {
  CommonService,
  ToastMessageType,
  ToastPlacement
} from '../../../../../services/common.service';
import { SharedServices } from '../../../../services/sharedservice';
import { API } from '../../../../../shared/constants/api_constants';
import { AppType, DeviceType } from '../../../../../shared/constants/module.constants';
import { CommonRestApiDto } from '../../../../../shared/model/common.model';

@IonicPage()
@Component({
  selector: 'page-holidaycampaymentsdetails',
  templateUrl: 'holidaycampaymentsdetails.html',
  providers: [HttpService]
})
export class HolidaycampaymentsdetailsPage {
  rows: HolidayCampSessionDetailRow[] = [];
  isLoaded: boolean = false;
  isDarkTheme: boolean = true;

  transactionId: string = '';
  transactionDate: string = '';
  amountPaid: number = 0;
  paidByText: string = '';
  campNames: string = '';

  private themeChangeHandler = (isDark: boolean) => this.applyTheme(isDark);

  constructor(
    private navParams: NavParams,
    private httpService: HttpService,
    private commonService: CommonService,
    private sharedservice: SharedServices,
    private storage: Storage,
    private events: Events,
    private renderer: Renderer2
  ) {}

  ionViewWillEnter() {
    this.loadTheme();
    this.events.subscribe('theme:changed', this.themeChangeHandler);
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed', this.themeChangeHandler);
  }

  ionViewDidLoad() {
    this.transactionId = this.navParams.get('transaction_id') || '';
    this.transactionDate = this.navParams.get('transaction_date') || '';
    this.amountPaid = parseFloat(this.navParams.get('amount_paid')) || 0;
    this.paidByText = this.navParams.get('paid_by_text') || '';
    this.campNames = this.navParams.get('camp_names') || '';
    this.getPaymentDetails();
  }

  private getPaymentDetails() {
    const navParentClubId = this.navParams.get('parentclubId');
    const navClubId = this.navParams.get('clubId');
    const payload: CommonRestApiDto & {
      updated_by: string;
      transaction_id: string;
      transaction_date: string;
    } = {
      parentclubId:
        navParentClubId !== undefined && navParentClubId !== null
          ? navParentClubId
          : this.sharedservice.getPostgreParentClubId(),
      clubId:
        navClubId !== undefined && navClubId !== null ? navClubId : '',
      activityId: '',
      memberId: this.sharedservice.getLoggedInId(),
      action_type: 4,
      device_type:
        this.sharedservice.getPlatform() === 'android'
          ? DeviceType.ANDROID
          : DeviceType.IOS,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId(),
      updated_by: this.sharedservice.getLoggedInId(),
      transaction_id: this.transactionId,
      transaction_date: this.transactionDate
    };

    this.commonService.showLoader();
    this.httpService
      .post<
        | { message: string; data: HolidayCampSessionDetailRow[] }
        | HolidayCampSessionDetailRow[]
      >(API.HOLIDAYCAMP_PAYMENT_DETAILS, payload)
      .subscribe({
        next: (res) => {
          const response: any = res;
          this.rows = Array.isArray(response)
            ? response
            : response && Array.isArray(response.data)
              ? response.data
              : [];
          this.isLoaded = true;
          this.commonService.hideLoader();
        },
        error: () => {
          this.rows = [];
          this.isLoaded = true;
          this.commonService.hideLoader();
          this.commonService.toastMessage(
            'Failed to fetch holiday camp payment details',
            3000,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      });
  }

  formatDate(value: string): string {
    return value && moment(value).isValid() ? moment(value).format('DD-MM-YYYY') : '';
  }

  private loadTheme() {
    this.storage
      .get('dashboardTheme')
      .then((isDarkTheme) => {
        this.applyTheme(
          isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true
        );
      })
      .catch(() => this.applyTheme(true));
  }

  private applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const pageElement = document.querySelector('page-holidaycampaymentsdetails');
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
}

export interface HolidayCampSessionDetailRow {
  member_name: string;
  transaction_date: string;
  transaction_id: string;
  session_name: string;
  session_date: string;
  coach_name: string;
  start_time: string;
  days: string;
  amount_paid: number;
  parentclub_id: string;
  camp_name: string;
  parentclub_name: string;
}
