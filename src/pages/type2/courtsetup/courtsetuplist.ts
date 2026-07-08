import { Component, ViewChild, Renderer2 } from "@angular/core";
import {
  NavController,
  PopoverController,
  LoadingController,
  ToastController,
  ActionSheetController,
  FabContainer,
} from "ionic-angular";
import { ThemeService } from "../../../services/theme.service";
import { SharedServices } from "../../services/sharedservice";
import { FirebaseService } from "../../../services/firebase.service";
import { CommonService } from "../../../services/common.service";
import { Storage } from "@ionic/storage";
import { Events } from "ionic-angular";
import { LanguageService } from "../../../services/language.service";
import {
  ClubVenueDto,
  GetParentClubVenuesRequestDto,
  GetParentClubVenuesResponseDto,
} from "../../../shared/dtos/club.dto";
import { AppType } from "../../../shared/constants/module.constants";
import { API } from "../../../shared/constants/api_constants";
import { GraphqlService } from "../../../services/graphql.service";
import gql from "graphql-tag";
import { ClubActivityInput } from "../../../shared/model/club.model";
import { IonicPage } from "ionic-angular";
import { HttpService } from "../../../services/http.service";
@IonicPage()
@Component({
  selector: "courtsetuplist-page",
  templateUrl: "courtsetuplist.html",
  providers: [GraphqlService],
})
export class Type2CourtSetupList {
  LangObj: any = {}; //by vinod
  isShowPaymentModal: boolean = false;
  themeType: number;
  parentClubKey: string;
  allClub: ClubVenueDto[] = [];
  selectedClubKey: any;
  allCourtSetup = [];
  menus: Array<{
    DisplayTitle: string;
    OriginalTitle: string;
    MobComponent: string;
    WebComponent: string;
    MobIcon: string;
    MobLocalImage: string;
    MobCloudImage: string;
    WebIcon: string;
    WebLocalImage: string;
    WebCloudImage: string;
    MobileAccess: boolean;
    WebAccess: boolean;
    Role: number;
    Type: number;
    Level: number;
  }>;
  allActivityArr = [];
  selectedActivity: any;
  IsTable: boolean = false;
  isDarkTheme: boolean = true; // 🌗 Default dark theme
  @ViewChild("fab") fab: FabContainer;

  constructor(
    public events: Events,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public navCtrl: NavController,
    public sharedservice: SharedServices,
    private langService: LanguageService,
    public fb: FirebaseService,
    public popoverCtrl: PopoverController,
    public commonService: CommonService,
    private httpService: HttpService,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private graphqlService: GraphqlService,
  ) {
    this.themeType = sharedservice.getThemeType();
    this.menus = sharedservice.getMenuList();

    storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getAllClub();
        }
    });
  }

  ionViewDidLoad() {
    this.getLanguage();
    this.events.subscribe("language", (res) => {
      this.getLanguage();
    });
  }

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
    const pageElement = document.querySelector("courtsetuplist-page");
    if (pageElement) {
      isDark
        ? this.renderer.removeClass(pageElement, "light-theme")
        : this.renderer.addClass(pageElement, "light-theme");
    }
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
      this.fab.close();
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent,
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  //   gotoAssignMembershipPage() {
  //     this.navCtrl.push(Type2AssignMembership);
  //   }

  onClubChange() {
    this.getAllActivity();
    //this.getAllCourtSetup();
  }

  getAllActivity() {
    // Activities are now fetched via the GraphQL getAllActivityByVenue resolver
    // (mirrors createschoolsession). The Firebase activity key is mapped to `$key`
    // so the template dropdown and the downstream /Court/ lookup keep working.
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
            // getAllCourtSetup() uses selectedActivity in the Firebase /Court/ path.
            // `ActivityKey` is the unique Firebase activity key; `FirebaseActivityKey`
            // is empty/duplicate and would make every ion-option share the same value.
            this.allActivityArr = activities.map((a: any) => ({
              ...a,
              $key: a.ActivityKey,
            }));
            // Default-select the first activity. Deferring to the next tick lets the
            // ion-select options (*ngFor over allActivityArr) render first, otherwise
            // Ionic 3's ion-select does not reflect a programmatically set value.
            setTimeout(() => {
              this.selectedActivity = this.allActivityArr[0].$key;
              if (this.selectedActivity == "-MCMaUe_FtFh1RZuIqtG") {
                this.IsTable = true;
              }
              this.getAllCourtSetup();
            }, 0);
          } else {
            this.allActivityArr = [];
            this.showToast("no activities found", 2500);
          }
        },
        (error) => {
          this.allActivityArr = [];
          console.error("Error in fetching activities:", error);
        },
      );
  }

  getAllClub() {
    // this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
    //   if (data4.length > 0) {
    //     this.allClub = data4;
    //     this.selectedClubKey = this.allClub[0].$key;
    //     this.checkPaymentSetup();
    //     this.getAllActivity();
    //   }
    // })
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
            if (this.allClub[i].FirebaseId === res[j].$key) {
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

  gotoCourtSetupPage(fab: FabContainer) {
    fab.close();
    this.isShowPaymentModal = false;
    this.navCtrl.push("Type2CourtSetupHome");
  }
  gotoBooking(fab: FabContainer) {
    fab.close();
    this.isShowPaymentModal = false;
    this.navCtrl.push("BookingsetupPage");
  }
  gotoPriceBand(fab: FabContainer) {
    fab.close();
    this.isShowPaymentModal = false;
    this.navCtrl.push("PricebandPage");
  }

  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      position: "bottom",
    });
    toast.present();
  }

  getAllCourtSetup() {
    if (this.selectedActivity == "-MCMaUe_FtFh1RZuIqtG") {
      this.IsTable = true;
    }
    this.fb
      .getAll(
        "/Court/" +
          this.parentClubKey +
          "/" +
          this.selectedClubKey +
          "/" +
          this.selectedActivity +
          "/",
      )
      .subscribe((data) => {
        this.allCourtSetup = [];
        if (data.length > 0) {
          this.allCourtSetup = data.filter((court) => court.IsActive);

          // Resolve Postgres IDs needed by GET_ALL_COURTS_WITH_POSTGRE.
          // selectedClubKey and selectedActivity are Firebase keys;
          // the API expects Postgres venue + activity IDs.
          const venueObj = (this.allClub || []).find(
            (c: any) => c.FirebaseId === this.selectedClubKey || c.$key === this.selectedClubKey
          );
          const postgresVenueId: string = venueObj ? (venueObj.Id || '') : '';

          if (!postgresVenueId) {
            console.warn('Could not resolve Postgres venue ID; courts will not have Id enriched');
            return;
          }

          // Resolve Postgres activity ID via CLUB_ACTIVITIES for this venue.
          const parentClubId = this.sharedservice.getPostgreParentClubId();
          this.httpService.post(
            API.CLUB_ACTIVITIES,
            { parentclubId: parentClubId, clubId: postgresVenueId,
              device_type: this.sharedservice.getPlatform() == 'android' ? 1 : 2,
              app_type: 10 },
            null, 1
          ).subscribe({
            next: (actRes: any) => {
              const clubActivities: any[] = (actRes && actRes.data && actRes.data.club_activities) || [];
              // Match selected Firebase activity key → Postgres activity ID
              const activityMatch = clubActivities.find(
                (ca: any) => ca.activity_key === this.selectedActivity
              );
              const postgresActivityId: string = activityMatch
                ? (activityMatch.activity && (activityMatch.activity.Id || activityMatch.activity.id)) || ''
                : '';

              if (!postgresActivityId) {
                console.warn('Could not resolve Postgres activity ID; courts will not have Id enriched');
                return;
              }

              // Now call with Postgres IDs
              const params = {
                parentClubId: parentClubId,
                clubId: postgresVenueId,
                activityId: postgresActivityId,
              };
              this.httpService.get(API.GET_ALL_COURTS_WITH_POSTGRE, params, null, 1).subscribe({
                next: (res: any) => {
                  const pgCourts: any[] = (res && res.data) ? res.data : [];
                  this.allCourtSetup = this.allCourtSetup.map(court => {
                    const pg = pgCourts.find(
                      (c: any) => c.firebasekey === court.$key || c.firebase_key === court.$key
                    );
                    return pg ? { ...court, Id: pg.id } : court;
                  });
                },
                error: () => {
                  console.warn('Could not enrich courts with Postgres Id');
                }
              });
            },
            error: () => {
              console.warn('Could not resolve Postgres activity ID for court enrichment');
            }
          });
        }
      });
  }

  editCourt() {}

  presentActionSheet(Details) {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Modify Setup",
      buttons: [
        {
          text: "Edit",
          handler: () => {
            console.log("Archive clicked");
            //  this.navCtrl.push('EditpricebandPage',{pricebandDetails:pricebandDetails})
            this.navCtrl.push("Type2CourtSetupHome", { Details: Details });
          },
        },
        // {
        //   text: 'Close',
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
