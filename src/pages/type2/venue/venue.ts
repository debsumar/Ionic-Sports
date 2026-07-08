import { CommonService, ToastMessageType, ToastPlacement } from './../../../services/common.service';
import { Component, Renderer2 } from '@angular/core';
import { NavController, PopoverController, AlertController, ActionSheetController, Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import gql from "graphql-tag";
import { GraphqlService } from "../../../services/graphql.service";
import { IonicPage } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../shared/dtos/club.dto';
import { AppType } from '../../../shared/constants/module.constants';
import { API } from '../../../shared/constants/api_constants';
import { HttpService } from '../../../services/http.service';
import { ThemeService } from '../../../services/theme.service';
@IonicPage()
@Component({
  selector: 'venue-page',
  templateUrl: 'venue.html'
})

export class Type2Venue {
  themeType: number;
  clubs:ClubVenueDto[] =[];
  x: any;
  reOrderToggle = false;
  parentClubKey: any;
  postgre_parentclub_id: string = "";
  navText: string = "Re-order";
  isDarkTheme: boolean = true; // 🌗 Default dark theme
;
  constructor(public alertCtrl: AlertController, public http: HttpClient, 
    private commonService:CommonService, 
    public storage: Storage, 
    public actionSheetCtrl: ActionSheetController, 
    public navCtrl: NavController, 
    public sharedservice: SharedServices,
     public fb: FirebaseService, 
     public popoverCtrl: PopoverController,
     private graphqlService: GraphqlService,
     private httpService: HttpService,
     private renderer: Renderer2,
     private themeService: ThemeService,
     public events: Events
     ) {
    // Resolve themeType synchronously so the navbar exists in the very first
    // change-detection cycle. Setting it later (in ionViewWillEnter) caused
    // Ionic 3 to measure an empty header and not re-apply the top padding to
    // the scroll-content, which made the first list item appear under the
    // navbar on some loads.
    this.themeType = this.sharedservice.getThemeType();
  }

  ionViewWillEnter() {
    // 🌗 Theme setup
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
    this.events.subscribe('theme:changed', (isDark) => this.applyTheme(isDark));

    this.themeType = this.sharedservice.getThemeType();
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          if (val.UserType == "2") {
            this.clubs = [];
            this.parentClubKey = club.ParentClubKey
            this.storage.get('postgre_parentclub').then((postgre_parentclub) => {
              if (postgre_parentclub) {
                this.postgre_parentclub_id = postgre_parentclub.Id;
              }
              this.getClubList();
            });
            // this.fb.getAll("/Club/Type2/" + club.ParentClubKey).subscribe((data) => {
            //   this.clubs = [];
            //   for (let i = 0; i < data.length; i++) {
            //     if (data[i].IsEnable) {
            //       this.clubs.push(data[i]);
            //     }
            //   }
            //   if (this.clubs[0].Sequence)
            //   this.clubs = this.commonService.sortingObjects(this.clubs, 'Sequence')
            // });
          }
        }
    }).catch(error => {
      // alert("Errr occured");
      this.storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        //for (let club of val.UserInfo)
        if (val.$key != "") {
          // this.fb.getAll("/Club/" + club.ParentClubKey).subscribe((data) => {
          //   this.clubs = data;
          //  console.log(this.clubs);
          // });
        }
      });
    });


  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  showSelected() {
    alert();
  }
  addVenue() {
    this.navCtrl.push("Type2AddVenue", { venuePageClubArr: this.clubs });
  }
  presentActionSheet(club) {
    // this.myIndex = -1;
    let actionSheet
    // if (this.platform.is('android')) {
    actionSheet = this.actionSheetCtrl.create({
      buttons: [{
        text: 'Edit',
        //icon: 'pen',
        handler: () => {
          this.navCtrl.push("Type2EditVenue", { venue: club });

        },
      },
      {
        text: 'Assign Activity',
        //icon: 'pen',
        handler: () => {
          this.navCtrl.push("AssignActivityPage", { venue: club });
        },
      },
      {
        text: 'Delete Venue',
        //icon: 'pen',
        handler: () => {
          this.navCtrl.push("DeleteVenue", { venue: club, parentclub:this.parentClubKey });
        },
      }]
    })

    actionSheet.present();
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }



  removeVenueAlert() {
    let confirm = this.alertCtrl.create({
      title: 'Remove Alert',
      message: 'Do you really want to remove this venue?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            // this.loading.present();
            // this.asyncAwait();
            // this.loading = this.loadingCtrl.create({
            //     content: 'Please wait...'
            // });
            // this.loading.present().then(() => {
            //     this.notify();
            //     this.loading.dismiss();
            //     //this.navCtrl.pop();
            // });

          }
        }
      ]
    });
    confirm.present();

  }
  enableReorder() {
    this.reOrderToggle = !this.reOrderToggle;
    this.navText = this.reOrderToggle ? "Done" : "Re-order";
  }

  reorderItems(indexes) {
    // if (indexes.from != 0) {
    let element = this.clubs[indexes.from];
    this.clubs.splice(indexes.from, 1);
    this.clubs.splice(indexes.to, 0, element);
    let club_seq_input = [];
    for (let tabIndex = 0; tabIndex < this.clubs.length; tabIndex++) {
      club_seq_input.push({club_firebasekey:this.clubs[tabIndex].FirebaseId,postgre_id:this.clubs[tabIndex].Id,sequence:tabIndex})
      this.fb.update(this.clubs[tabIndex].FirebaseId, "/Club/Type2/" + this.parentClubKey, { Sequence: tabIndex });
    }
    this.updatePostgreVenue(club_seq_input);
    // } 
    // else {
    //     let message = "You can not reorder the first element.";
    //     this.showToast(message, 3000);
    // }
  }

  updatePostgreVenue(club_input) {
    this.commonService.showLoader("Please wait");
    const seq_payload = {
      club_sequnce:club_input
    }
    const mutation = gql`
      mutation updateClubSequence($club_seq_input: ClubSequnceInput!) {
        updateClubSequence(clubSequnceInput: $club_seq_input) 
      }
    `;
    this.graphqlService
      .mutate(mutation, { club_seq_input: seq_payload }, 0)
      .subscribe(
        (res: any) => {
          this.commonService.hideLoader();
          console.log("venue data" + res.data["updateClubSequence"]);
          let message = "Venues reorderd successfully."
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success);
          this.getClubList();
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Venue reorderd failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  }



  getClubList() {
    const body: GetParentClubVenuesRequestDto = {
          parentclub_id: this.sharedservice.getPostgreParentClubId(),
          app_type: AppType.ADMIN_NEW,
          device_type: this.sharedservice.getPlatform() == 'android' ? 1 : 2,
          device_id: this.sharedservice.getDeviceId() || 'web',
          updated_by: this.sharedservice.getLoggedInUserId()
      };
    
        this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
          next: (res: GetParentClubVenuesResponseDto) => {
            this.clubs = res.data as ClubVenueDto[];
            console.table(`all_clubs:${JSON.stringify(this.clubs)}`);
          },
          error: (err) => {
            this.clubs = [];
          }
        });
  }

  // 🌗 Theme: load persisted preference and apply
  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      const isDark = isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true;
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    }).catch(() => this.applyTheme(true));
  }

  // 🌗 Theme: toggle light-theme class on the page element
  applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const pageElement = document.querySelector('venue-page');
    if (pageElement) {
      isDark ? this.renderer.removeClass(pageElement, 'light-theme')
             : this.renderer.addClass(pageElement, 'light-theme');
    }
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

}
