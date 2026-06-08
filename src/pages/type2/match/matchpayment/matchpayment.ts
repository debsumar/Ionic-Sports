import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { HttpService } from '../../../../services/http.service';
import { GetIndividualMatchParticipantModel, AllMatchData } from '../../../../shared/model/match.model';
import { API } from '../../../../shared/constants/api_constants';
import { TransactionType } from '../../../../shared/utility/enums';
import { AppType } from '../../../../shared/constants/module.constants';

@IonicPage()
@Component({
  selector: 'page-matchpayment',
  templateUrl: 'matchpayment.html',
  providers: [HttpService]
})
export class MatchpaymentPage {

  parentClubKey: any;
  themeType: number;
  userData: any;
  selectedMemberDetails: GetIndividualMatchParticipantModel;
  selectedMatchDetails: AllMatchData;

  paymentMode: any[];
  UpdatedBy: string = "";
  isDarkTheme: boolean = false;

  payment_update_input = {
    user_payment: {
      amount: "",
      payment_mode: null,
      payment_status: null,
      comments: ""
    }
  };

  commonInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    transaction_type: 0
  };

  constructor(
    private commonService: CommonService,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public storage: Storage,
    public navCtrl: NavController,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private httpService: HttpService,
  ) {
    this.themeType = sharedservice.getThemeType();
    this.userData = sharedservice.getUserData();

    this.selectedMemberDetails = <GetIndividualMatchParticipantModel>navParams.get('SelectedMember');
    this.selectedMatchDetails = <AllMatchData>navParams.get('MatchDetails');

    this.commonInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.commonInput.activityId = this.selectedMatchDetails.activityId;
    this.commonInput.app_type = AppType.ADMIN_NEW;
    this.commonInput.updated_by = this.sharedservice.getLoggedInUserId();
    this.commonInput.transaction_type = TransactionType.LEAGUE_TEAM;

    if (this.selectedMemberDetails.amount_pay_status != 0) {
      this.payment_update_input.user_payment.amount = parseFloat(this.selectedMemberDetails.paid_amount).toFixed(2);
      this.payment_update_input.user_payment.payment_mode = Number(this.selectedMemberDetails.paidby);
      this.payment_update_input.user_payment.comments = "";
    } else {
      this.payment_update_input.user_payment.comments = "Payment received. Thanks!";
      this.payment_update_input.user_payment.amount = parseFloat(this.selectedMemberDetails.amount_due).toFixed(2);
    }
    this.payment_update_input.user_payment.payment_status = this.selectedMemberDetails.amount_pay_status;

    if (this.selectedMemberDetails.payment_comments) {
      this.payment_update_input.user_payment.comments = this.selectedMemberDetails.payment_comments;
    }

    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.UpdatedBy = this.sharedservice.getLoggedInId();
      }
    });

    this.getPaymentMode();
  }

  cancel() {
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    this.storage.get('dashboardTheme').then((v) => this.isDarkTheme = v !== null ? v : true);
  }

  validateAmount(ev: any) {
    var re: any = /^[0-9]+\.[0-9]+$/;
    return re.test(ev.target.value);
  }

  confirmationPaymentAlert() {
    let confirm = this.alertCtrl.create({
      title: 'Update Payment',
      message: 'Are you sure you want to update the payment details?',
      buttons: [
        { text: 'No', handler: () => { } },
        { text: 'Yes', handler: () => { this.updatePayment(); } }
      ]
    });
    confirm.present();
  }

  getPaymentMode() {
    this.httpService.post(API.GET_MATCH_PAYMENT_METHODS, this.commonInput).subscribe({
      next: (res: any) => {
        this.paymentMode = res["data"];
      }
    });
  }

  updatePayment() {
    if (!this.paymentStatus()) return;
    const d = new Date();
    const input = {
      ParticipationId: this.selectedMemberDetails.id,
      PaymentStatus: Number(this.payment_update_input.user_payment.payment_status),
      PaymentMode: Number(this.payment_update_input.user_payment.payment_mode),
      Amount: this.payment_update_input.user_payment.amount,
      Comments: this.payment_update_input.user_payment.comments,
      UpdatedBy: this.UpdatedBy,
      PaymentDate: new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString()
    };
    this.commonService.showLoader("Please wait");
    this.httpService.post(API.UPDATE_TEAM_MATCH_PARTICIPANT_PAYMENT, input).subscribe({
      next: () => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Payment updated successfully", 2500, ToastMessageType.Success);
        this.navCtrl.pop();
      },
      error: (err) => {
        this.commonService.hideLoader();
        console.error(err);
        this.commonService.toastMessage("Payment updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({ ev: myEvent });
  }

  paymentStatus() {
    if (this.payment_update_input.user_payment.amount == undefined || this.payment_update_input.user_payment.amount == "") {
      this.commonService.toastMessage("Please enter the amount", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    if (this.payment_update_input.user_payment.payment_mode == undefined || this.payment_update_input.user_payment.payment_mode == null) {
      this.commonService.toastMessage("Please select payment mode", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else if (this.payment_update_input.user_payment.payment_status == undefined) {
      this.commonService.toastMessage("Please select payment status", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else if (this.payment_update_input.user_payment.comments == "") {
      this.commonService.toastMessage("Please enter comments", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else {
      return true;
    }
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
}
