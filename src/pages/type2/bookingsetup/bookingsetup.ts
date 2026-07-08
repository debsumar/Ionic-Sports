import { Component, Renderer2 } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  Events,
} from "ionic-angular";
import { FirebaseService } from "../../../services/firebase.service";
import { CommonService } from "../../../services/common.service";
import { Storage } from "@ionic/storage";
import { ActionSheetController } from "ionic-angular";
import { HttpService } from "../../../services/http.service";
import { SharedServices } from "../../services/sharedservice";
import { API } from "../../../shared/constants/api_constants";
import { AppType } from "../../../shared/constants/module.constants";
import {
  ClubVenueDto,
  GetParentClubVenuesRequestDto,
  GetParentClubVenuesResponseDto,
} from "../../../shared/dtos/club.dto";
import { ThemeService } from "../../../services/theme.service";
import { GraphqlService } from "../../../services/graphql.service";
import gql from "graphql-tag";
import { ClubActivityInput } from "../../../shared/model/club.model";
/**
 * Generated class for the BookingsetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-bookingsetup",
  templateUrl: "bookingsetup.html",
  providers: [GraphqlService],
})
export class BookingsetupPage {
  isShowPaymentModal: boolean = false;
  bookingSetupList = [];
  allActivityArr = [];
  allClub = [];
  parentClubKey = "";
  Nocourtavailable = "No Setup Available";
  selectedClubKey = "";
  selectedActivity = "";
  canCreate: boolean = false;
  isDarkTheme: boolean = true; // 🌗 Default dark theme
  constructor(
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public fb: FirebaseService,
    public commonService: CommonService,
    public storage: Storage,
    private httpService: HttpService,
    private sharedservice: SharedServices,
    private renderer: Renderer2,
    private themeService: ThemeService,
    public events: Events,
    private graphqlService: GraphqlService,
  ) {}

  ionViewWillEnter() {
    // 🌗 Theme setup
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe((isDark) =>
      this.applyTheme(isDark),
    );
    this.events.subscribe("theme:changed", (isDark) => this.applyTheme(isDark));
  }

  ionViewWillLeave() {
    this.events.unsubscribe("theme:changed");
  }

  // 🌗 Theme: load persisted preference and apply
  loadTheme() {
    this.storage
      .get("dashboardTheme")
      .then((isDarkTheme) => {
        const isDark =
          isDarkTheme !== null && isDarkTheme !== undefined
            ? isDarkTheme
            : true;
        this.isDarkTheme = isDark;
        this.applyTheme(isDark);
      })
      .catch(() => this.applyTheme(true));
  }

  // 🌗 Theme: toggle light-theme class on the page element
  applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const pageElement = document.querySelector("page-bookingsetup");
    if (pageElement) {
      isDark
        ? this.renderer.removeClass(pageElement, "light-theme")
        : this.renderer.addClass(pageElement, "light-theme");
    }
  }

  ionViewDidLoad() {
    this.storage
      .get("userObj")
      .then((val) => {
        val = JSON.parse(val);

        for (let user of val.UserInfo) {
          if (val.$key != "") {
            this.parentClubKey = user.ParentClubKey;
            this.getAllClub();
          }
        }
      })
      .catch((error) => {});
  }
  goToCreateBookingSetup() {
    this.isShowPaymentModal = false;
    let BookingObj = {};
    BookingObj["selectedClubKey"] = this.selectedClubKey;
    BookingObj["selectedActivity"] = this.selectedActivity;
    this.navCtrl.push("CreatesetupPage", { setupDetails: BookingObj });
  }

  getAllActivity() {
    // Activities are now fetched via the GraphQL getAllActivityByVenue resolver
    // (mirrors createschoolsession). The Firebase activity key is mapped to `$key`
    // so the template dropdown and the downstream getbookingSetupList() lookup keep working.
    this.allActivityArr = [];
    const club_activity_input: ClubActivityInput = {
      ParentClubKey: this.parentClubKey,
      ClubKey: this.selectedClubKey,
      VenueKey: this.selectedClubKey,
      AppType: 0, // 0-Admin
      DeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2, // 1-android,2-IOS
    };

    const clubs_activity_query = gql`
      query getAllActivityByVenue($input_obj: VenueDetailsInput!) {
        getAllActivityByVenue(venueDetailsInput: $input_obj) {
          ActivityCode
          ActivityName
          ActivityImageURL
          FirebaseActivityKey
          ActivityKey
        }
      }
    `;

    this.graphqlService
      .query(clubs_activity_query, { input_obj: club_activity_input }, 0)
      .subscribe(
        (res: any) => {
          const activities =
            (res && res.data && res.data.getAllActivityByVenue) || [];
          if (activities.length > 0) {
            // Preserve the existing contract: template binds to `$key` and
            // getbookingSetupList() uses selectedActivity in the Firebase path.
            // `ActivityKey` is the unique Firebase activity key; `FirebaseActivityKey`
            // is empty/duplicate and would make every ion-option share the same value.
            this.allActivityArr = activities.map((a: any) => ({
              ...a,
              $key: a.ActivityKey,
            }));
            this.selectedActivity = this.allActivityArr[0].$key;
            this.getbookingSetupList();
          } else {
            this.allActivityArr = [];
          }
        },
        (error) => {
          this.allActivityArr = [];
          console.error("Error in fetching activities:", error);
        },
      );
  }

  getAllClub() {
    const body: GetParentClubVenuesRequestDto = {
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      app_type: AppType.ADMIN_NEW,
      device_type: this.sharedservice.getPlatform() == "android" ? 1 : 2,
      device_id: this.sharedservice.getDeviceId() || "web",
      updated_by: this.sharedservice.getLoggedInUserId(),
    };

    this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
      next: (res: GetParentClubVenuesResponseDto) => {
        this.allClub = res.data.map((club: ClubVenueDto) => ({
          ...club,
          $key: club.FirebaseId,
          ClubKey: club.FirebaseId,
        }));
        if (this.allClub.length > 0) {
          this.selectedClubKey = this.allClub[0].FirebaseId;
          this.checkPaymentSetup();
          this.getAllActivity();
        }
      },
      error: (err) => {
        this.allClub = [];
        console.error("Error fetching clubs:", err);
      },
    });
  }

  //payment activity details
  checkPaymentSetup() {
    this.fb.getAll(`Activity/${this.parentClubKey}`).subscribe(
      (res) => {
        console.log(res);
        let showmodal: boolean = true;
        for (let i = 0; i < this.allClub.length; i++) {
          for (let j = 0; j < res.length; j++) {
            if (this.allClub[i].$key === res[j].$key) {
              for (let key in res[j]) {
                if (key != "$key") {
                  res[j][key].PaymentSetup =
                    this.commonService.convertFbObjectToArray(
                      res[j][key].PaymentSetup,
                    );
                  console.log(res[j][key].PaymentSetup);
                  for (let l = 0; l < res[j][key].PaymentSetup.length; l++) {
                    if (res[j][key].PaymentSetup[l].IsActive) {
                      console.log(res[j][key].PaymentSetup[l].SetupType);
                      if (
                        res[j][key].PaymentSetup[l].PaymentGatewayName ==
                          "StripeConnect" &&
                        res[j][key].PaymentSetup[l].SetupType == "Court Booking"
                      ) {
                        // console.log("matched");
                        // console.log(`${res[j][key].PaymentSetup[l].IsActive}:${res[j][key].PaymentSetup[l].PaymentGatewayName}:${res[j][key].PaymentSetup[l].SetupType}`);
                        showmodal = false;
                        this.isShowPaymentModal = false;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        this.isShowPaymentModal = showmodal;
      },
      (err) => {
        console.log(err);
      },
    );
  }

  //custom component for payment setup redirect
  GotoPaymentSetup() {
    this.isShowPaymentModal = false;
    //let setup = { SetupName: 'Court Booking', DisplayName:'Court Booking', ImageUrl: "assets/images/tennis-court.svg" }
    this.navCtrl.push("StripeConnectPage");
  }

  skip() {
    this.isShowPaymentModal = false;
  }

  getbookingSetupList() {
    this.fb
      .getAllWithQuery(
        "StandardCode/BookingSetup/" +
          this.parentClubKey +
          "/" +
          this.selectedActivity,
        { orderByChild: "ClubKey", equalTo: this.selectedClubKey },
      )
      .subscribe((data) => {
        this.bookingSetupList = data;
        this.canCreate = this.bookingSetupList.length >= 1 ? false : true;
      });
  }
  ionViewDidEnter() {
    this.ionViewDidLoad();
  }
  presentActionSheet(selectedSetup) {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Modify setup",
      buttons: [
        {
          text: "Edit",
          handler: () => {
            this.navCtrl.push("EditbookingPage", {
              setupDetails: selectedSetup,
            });
          },
        },
        // {
        //   text: 'Cancel',
        //   role: 'cancel',
        //   handler: () => {
        //     console.log('Cancel clicked');
        //   }
        // }
      ],
    });

    actionSheet.present();
  }
}
