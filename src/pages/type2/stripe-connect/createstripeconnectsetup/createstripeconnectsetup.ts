import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { CommonService } from '../../../../services/common.service';
import * as $ from 'jquery';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Generated class for the CreatestripeconnectsetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createstripeconnectsetup',
  templateUrl: 'createstripeconnectsetup.html',
})
export class CreatestripeconnectsetupPage {
  instructions_arry:Array<any>=[
    {text:"Select Venue(s) and Activity(ies)"},
    {text:"Enter a name for future reference"},
    {text:"Click on the Link Stripe Account"},
    {text:"Login using your existing Stripe Account or Open a New Stripe Account"},
    {text:"Follow the instructions on the Stripe page"},
    {text:"Once done successfully your Stripe account is ready for accepting payment for the selected venue(s) and activity(ies)"}
  ];
  setupDetails:any;
  setupSet: Set<any> = new Set();
  allClub: Array<any>;
  parentClubKey: any;
  isSelectAll: boolean = false;
  previousParams: any = '';
  activityList: any = [];
  selectedActivity: any;
  divheight: number = 0;
  height: number = 80.8;
  widthofact=0;
  stripeConfigDetails:any = {};
  setupObj = {
    setupType:'',
    name:'',
    parentclubKey: '',
    data:[]
  }
  constructor(private toastCtrl:ToastController,private iab: InAppBrowser,public navCtrl: NavController, public comonService: CommonService, storage: Storage, public fb: FirebaseService, public navParams: NavParams) {
    this.setupDetails = this.navParams.get('setupDetails')
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getClubList()
          this.getStripeConfig();
        }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatestripeconnectsetupPage');

  }

  selectActivity(club, activity) {
    club.Activity.forEach(club => {
      if (club.ActivityName == activity.ActivityName) {
        club.isSelect = !club.isSelect
      }
    });

  }
  selectVenue(event) {

    if (this.previousParams == 'All' && event != 'All') {
      this.isSelectAll = false
      this.allClub.forEach(club => {
        if (club.ClubName == event.ClubName) {
          club.isSelect = true
        } else {
          club.isSelect = false
        }
      });
    } else if (event == 'All') {
      this.isSelectAll = !this.isSelectAll
      this.allClub.forEach(club => {
        if (this.isSelectAll) {
          club.isSelect = true;
        } else {
          club.isSelect = false;
        }

      });

    } else {
      this.allClub.forEach(club => {
        if (club.ClubName == event.ClubName) {
          club.isSelect = !club.isSelect
        }
      });
    }

    if (event == 'All') {
      this.previousParams = event
      this.allClub.forEach(element => {
        this.getActivity(element.$key)
      });
     
    } else {
      this.previousParams = event.ClubName
    }
    this.getActivity(event.$key)

  }
  getStripeConfig(){
    this.fb.getAllWithQuery('ActivityPro',{orderByKey:true,equalTo:"StripeConfigDetails"}).subscribe((data)=>{
      this.stripeConfigDetails = data[0];
    })
  }

  getActivity(clubkey) {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + clubkey + "/").subscribe((data) => {
      this.activityList = [];
      if (data.length > 0) {
        this.activityList = data;
        this.activityList.forEach(activity => {
          activity['ClubKey'] = clubkey
          activity['isSelect'] = false

        });
        this.allClub.forEach(venue => {
          if (venue.$key == clubkey) {
            venue['Activity'] = this.activityList
          }
          if (this.divheight <= this.activityList.length && venue.isSelect) {
            this.divheight = this.activityList.length
          }
        });

        this.divCalculate()
      }

    })

  }

  divCalculate() {
    this.height = 80.8;
    this.widthofact = $("#ionslide").width() / 1.2
    console.log( $("ionslide").width())
    if (this.divheight == 1) {
      this.height = 109.8;    
    } 
    // else if (this.divheight == 2) {
    //   this.height = this.height + 2 * 33;
    // } else if (this.divheight == 3) {
    //   this.height = this.height + 3 * 33;
    // } else if (this.divheight == 4) {
    //   this.height = this.height + 4 * 33;
    // } else if (this.divheight == 5) {
    //   this.height = this.height + 5 * 33;
    // } else if (this.divheight == 6) {
    //   this.height = this.height + 6 * 33;
    // }else if (this.divheight == 7) {
    //   this.height = this.height + 7 * 33;
    // }
    else{
      this.height = this.height + this.divheight * 33;
    }
  
  }



  getClubList() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      if (data.length > 0) {
        this.allClub = data;
      }
    })
  }
  addSetupMenu(setup) {
    if (this.setupSet.has(setup)) {
      this.setupSet.delete(setup)
    } else {
      this.setupSet.add(setup);
    }
  }
  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
  addSetup(){
    this.setupObj.parentclubKey = this.parentClubKey;
    this.setupObj.setupType = this.setupDetails.SetupName;
    let reqObj = [];
    this.allClub.forEach((club)=>{
      if(club.isSelect){
        let obj = {

          clubKey:club.$key,
          activityKey:''
        }
        let selectedActivity = 0;
        if(club.Activity){
          club.Activity.forEach((activity)=>{
            if(activity.isSelect){
              selectedActivity++;
              obj['activityKey'] += activity.$key +" ";
            }
          });
        }
        if(selectedActivity > 0){
          reqObj.push(obj)
        }
      }
     
    })
    // let selectedClubs:Array<any> = this.allClub.filter((club)=>{
    //   if(club.isSelect != undefined && club.isSelect){
    //     return true;
    //   }else{
    //     return false;     
    //   }
    // });
    this.setupObj.data = reqObj;
    if(this.setupObj.name != "" && this.setupObj.name){ 
      if(reqObj.length > 0){
      // this.stripeConfigDetails.ClientId = "ca_FmNovlkp34sE0FGQ2jQe68tbkywu8kBi";
        const stateKey = this.fb.saveReturningKey('StripeConnectAccountStates',{data:JSON.stringify(this.setupObj)});
        const browser = this.iab.create(`${this.stripeConfigDetails.AuthURL}&scope=read_write&client_id=${this.stripeConfigDetails.ClientId}&state=${stateKey}`,'_blank');
        browser.on('exit').subscribe(() => {
         this.navCtrl.pop();
      }, err => {
        this.navCtrl.pop();
      });
      }else{
        this.showToast('Please select atleast a venue and activity')
      }
    }else{
      this.showToast("Please enter account name")
    }
 

  }
  accountNameHint() {
    let message = "Please enter a description of the Stripe account for the selected Venue and Activities for future reference";
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000
    });
    toast.present();
  }
}


