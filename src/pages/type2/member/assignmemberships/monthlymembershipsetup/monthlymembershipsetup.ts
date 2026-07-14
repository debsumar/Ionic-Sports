import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController ,Platform } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { FirebaseService } from '../../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';

/**
 * Generated class for the MemberprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-monthlymembershipsetup',
    templateUrl: 'monthlymembershipsetup.html',
    providers: [HttpService]
})
export class MonthlyMembershipSetupPage {
    selectedClubKey: any;
    ParentClubKey: any;
  
    currencyDetails: any;
   
    MemberKey: any;
    Key: any;
    IsThereAnyActiveSetup = false;
   
    selectedMember: any[];
    AllSetups: any[];
    eachSetup: any;

    clubKey: any;
    amount;
    monthArr: any;
    PaymentOptionkey: any;
    setupKey: any;
    email: any;
    selectedmember:any;
    loading: any;
    constructor(public fb: FirebaseService,
        public alertCtrl: AlertController,
        public comonService: CommonService,
        public navCtrl: NavController,
        public navParams: NavParams,
        public http: HttpClient,
        public actionSheetCtrl: ActionSheetController,
        storage: Storage,
        private httpService: HttpService,
    ) {
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
            this.eachSetup = this.navParams.get("setup")
            this.email = this.navParams.get("email")
            this.setupKey = this.navParams.get("setupKey")
            this.PaymentOptionkey = this.navParams.get("PaymentOptionkey")
            this.selectedmember = this.navParams.get('selectedmember')
            
            console.log(this.eachSetup)
        })
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
               // this.MemberKey = val.UserInfo[0].Key
                //this.getPrice(this.ParentClubKey);
                this.fetchMonth()
            }
          
        })
      
    }

    ionViewDidEnter() {    
    }
   
    fetchMonth(){
        try{
            // const params = new HttpParams()
            //     .set('clubKey', this.eachSetup.ClubKey)
            //     .set('parentClubKey', this.ParentClubKey);
            // this.httpService.get(API.LEGACY_MEMBERSHIP_MONTHLY_MONTHS, params, null, 2).subscribe(data =>{
            //     this.monthArr = data['data']
            //     this.monthArr.forEach(eachdata => {
            //         eachdata['isSelect'] = false
            //     });
                
            // })
        }catch(error){

        }
    }

   
    save(){
        let selectedmonth = this.monthArr.filter(month => month.isSelect)
        this.comonService.showLoader('Please wait')
        try{
            let memberKeys = []
            this.selectedmember.forEach(eachMember => {
                memberKeys.push(eachMember.key)
            });
            // this.httpService.post(API.LEGACY_MEMBERSHIP_ASSIGN_MONTHLY, {
            //     parentClubKey: this.ParentClubKey,
            //     clubKey: this.eachSetup.ClubKey,
            //     memberKeys: memberKeys,
            //     membershipSetupKey: this.setupKey,    
            //     startMonth: selectedmonth[0],
            //     email: this.email,
            //     paymentOptionKey: this.PaymentOptionkey   
            // }, null, 2).subscribe(data =>{
            //     this.comonService.hideLoader();
            //     console.log(data)
            //     if(data['status'] == 200){
            //         this.comonService.toastMessage('membership assigned successfully...', 2500,ToastMessageType.Success);
            //         this.navCtrl.pop().then(() => this.navCtrl.pop())
            //     }
                
            // },
            // error => {
            //     this.comonService.hideLoader();
            //     this.comonService.toastMessage(error.message, 2500,ToastMessageType.Error);
            // })
        }catch(error){
            this.comonService.hideLoader();
        }
    }
    
    selectMonth(mon){
        this.monthArr.forEach(month => {
            if(month.label){
                month.isSelect = false
            }
            if(mon.label == month.label){
                month.isSelect = true
            }
        });

    }

}
