import { Component } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import moment from "moment";
import { Storage } from "@ionic/storage";

import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import gql from "graphql-tag";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../../services/graphql.service";
import {
  LeagueFetchInput,
  LeaguesForParentClubModel,
  ParentClubTeamFetchInput,
  UserDeviceMetadataField,
  UserPostgreMetadataField,
} from "../../league/models/league.model";
import { FetchAllMatchesInput, MatchModel } from "../models/match.model";
import { TeamsForParentClubModel } from "../../league/models/team.model";
import {
  AllMatchData,
  MatchModelV3,
} from "../../../../shared/model/match.model";
import { AppType } from "../../../../shared/constants/module.constants";
import { HttpService } from "../../../../services/http.service";
import { API } from "../../../../shared/constants/api_constants";
import { ThemeService } from "../../../../services/theme.service";

/**
 * Generated class for the MatchhistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-matchhistory",
  templateUrl: "matchhistory.html",
  providers: [HttpService],
})
export class MatchhistoryPage {
  activeIndex: number = 0;
  fetchAllMatchesRes: MatchModelV3;
  fetchMatchesInput = {
    user_postgre_metadata: {
      UserParentClubId: "",
    },
    FetchType: 5,
  };
  fetchAllMatchesInput: FetchAllMatchesInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    created_by: "",
    FetchType: 0,
  };
  matches: MatchModel[] = [];
  filteredMatchlist: AllMatchData[] = [];
  matchlist: AllMatchData[] = [];
  filteredMatches: MatchModel[] = [];
  ParentClubTeam: TeamsForParentClubModel[] = [];
  teamsForParentClub: TeamsForParentClubModel[] = [];
  filteredteams: TeamsForParentClubModel[] = [];
  leaguesForParentClub: LeaguesForParentClubModel[] = [];
  filteredleagues: LeaguesForParentClubModel[] = [];

  ParentClubTeamFetchInput: ParentClubTeamFetchInput = {
    user_postgre_metadata: new UserPostgreMetadataField(),
    user_device_metadata: new UserDeviceMetadataField(),
  };

  LeagueFetchInput: LeagueFetchInput = {
    user_postgre_metadata: new UserPostgreMetadataField(),
    user_device_metadata: new UserDeviceMetadataField(),
  };
  isDarkTheme: boolean = false;
  private subscriptions: any[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public graphqlService: GraphqlService,
    private httpService: HttpService,
    private themeService: ThemeService
  ) {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "match_history") {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            // this.FetchMatchesInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
            this.fetchMatchesInput.user_postgre_metadata.UserParentClubId =
              this.sharedservice.getPostgreParentClubId();
            this.fetchAllMatchesInput = new FetchAllMatchesInput();
            this.fetchMatchesInput.user_postgre_metadata.UserParentClubId =
              this.sharedservice.getPostgreParentClubId();
            this.fetchAllMatchesInput.parentclubId =
              this.sharedservice.getPostgreParentClubId();
            this.fetchAllMatchesInput.memberId =
              this.sharedservice.getLoggedInUserId();
            this.fetchAllMatchesInput.action_type = 0;
            this.fetchAllMatchesInput.app_type = AppType.ADMIN_NEW;
            this.fetchAllMatchesInput.device_type =
              this.sharedservice.getPlatform() == "android" ? 1 : 2;
            this.fetchAllMatchesInput.FetchType = 3; //3 is to fetch past matches
            this.changeType(0); // Default to leagues
          }
        });
      }
    });
  }

  
  ionViewWillEnter() {
    console.log("MatchhistoryPage - ionViewWillEnter");

    // Load and apply theme immediately
    this.loadTheme();

    // Subscribe to theme changes
    const themeSubscription = this.themeService.isDarkTheme$.subscribe(
      (isDark) => {
        console.log("MatchHistory page - theme service change:", isDark);
        this.isDarkTheme = isDark;
        this.applyTheme(isDark);
      }
    );
    this.subscriptions.push(themeSubscription);
  }

  ionViewDidEnter() {
    console.log("MatchHistory page - ionViewDidEnter");

    // Apply theme again after view is fully loaded with multiple attempts
    setTimeout(() => {
      this.forceThemeCheck();
    }, 50);

    setTimeout(() => {
      this.forceThemeCheck();
    }, 200);

    setTimeout(() => {
      this.forceThemeCheck();
    }, 500);

    setTimeout(() => {
      this.forceThemeCheck();
    }, 1000);
  }

  ionViewDidLoad() {
    console.log("MatchHistory page - ionViewDidLoad");

    // Force theme application on load
    setTimeout(() => {
      this.loadTheme();
    }, 100);
  }

  ionViewWillLeave() {
    // Cleanup subscriptions
    this.subscriptions.forEach((sub) => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];
  }

  private applyTheme(isDark: boolean): void {
    console.log(
      "MatchHistory page - applying theme:",
      isDark ? "dark" : "light"
    );

    // Force apply theme immediately and with retries
    const applyThemeToElement = () => {
      const historyElement = document.querySelector("page-matchhistory");

      if (historyElement) {
        if (isDark) {
          historyElement.classList.remove("light-theme");
          document.body.classList.remove("light-theme");
        } else {
          historyElement.classList.add("light-theme");
          document.body.classList.add("light-theme");
        }
        console.log(
          "MatchHistory page - theme applied successfully:",
          isDark ? "dark" : "light"
        );
        return true;
      }
      return false;
    };

    // Try to apply immediately
    if (!applyThemeToElement()) {
      // If not found, retry multiple times
      let retryCount = 0;
      const maxRetries = 5;

      const retryApply = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`MatchHistory page - retry ${retryCount}/${maxRetries}`);

          if (!applyThemeToElement()) {
            setTimeout(retryApply, 100 * retryCount); // Increasing delay
          }
        } else {
          console.warn(
            "MatchHistory page - failed to apply theme after all retries"
          );
        }
      };

      setTimeout(retryApply, 50);
    }
  }

  private loadTheme(): void {
    this.storage
      .get("dashboardTheme")
      .then((isDarkTheme) => {
        console.log(
          "MatchHistory page - loaded theme from storage:",
          isDarkTheme
        );

        // If theme is null/undefined, default to dark theme
        const isDark =
          isDarkTheme !== null && isDarkTheme !== undefined
            ? isDarkTheme
            : true;

        console.log(
          "MatchHistory page - applying theme:",
          isDark ? "dark" : "light"
        );
        this.isDarkTheme = isDark;
        this.applyTheme(isDark);
      })
      .catch((error) => {
        console.log("MatchHistory page - error loading theme:", error);
        this.isDarkTheme = true;
        this.applyTheme(true); // Default to dark theme
      });
  }

  // Force theme check method
  private forceThemeCheck(): void {
    console.log("MatchHistory page - forcing theme check");

    // Check multiple sources for theme
    this.storage.get("dashboardTheme").then((storageTheme) => {
      console.log("MatchHistory page - storage theme:", storageTheme);

      // Also check if body has light-theme class
      const bodyHasLightTheme = document.body.classList.contains("light-theme");
      console.log(
        "MatchHistory page - body has light theme:",
        bodyHasLightTheme
      );

      // Determine final theme
      let isDark = true;
      if (storageTheme !== null && storageTheme !== undefined) {
        isDark = storageTheme;
      } else if (bodyHasLightTheme) {
        isDark = false;
      }

      console.log(
        "MatchHistory page - force applying theme:",
        isDark ? "dark" : "light"
      );
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  changeType(index: number) {
    console.log("LeagueTeamListing changing type to:", index);

    // ✅ Set activeIndex immediately to avoid timing issues
    this.activeIndex = index;

    // 📡 Also update the service for other components
    //this.leagueService.setActiveLeagueType(index);

    // 🎯 Load appropriate data based on selection
    if (index === 0) {
      this.getLeaguesForParentClub();
    } else {
      this.fetchAllMatches();
    }
  }

  //function to get the list of league
  getLeaguesForParentClub = () => {
    // this.commonService.showLoader("Fetching Leagues...");
    this.LeagueFetchInput.user_postgre_metadata.UserParentClubId =
      this.sharedservice.getPostgreParentClubId();
    this.LeagueFetchInput.user_device_metadata.UserAppType = 0;
    this.LeagueFetchInput.user_device_metadata.UserActionType = 2; // 2 is to fetch past leagues
    this.LeagueFetchInput.user_device_metadata.UserDeviceType =
      this.sharedservice.getPlatform() == "android" ? 1 : 2;
    const leaguesforparentclubQuery = gql`
      query getLeaguesForParentClub($ParentClubDetails: LeagueFetchInput!) {
        getLeaguesForParentClub(ParentClubDetails: $ParentClubDetails) {
          id
          created_at
          created_by
          updated_at
          is_active
          league_name
          activity {
            ActivityName
            ActivityCode
          }
          league_category_text
          league_category
          league_age_group
          start_date
          end_date
          league_visibility
          league_type_text
          club {
            Id
            ClubName
            FirebaseId
          }
          league_visibility
        }
      }
    `;
    this.graphqlService
      .query(
        leaguesforparentclubQuery,
        { ParentClubDetails: this.LeagueFetchInput },
        0
      )
      .subscribe(
        (res: any) => {
          // this.commonService.hideLoader();
          this.leaguesForParentClub = res.data.getLeaguesForParentClub;
          this.filteredleagues = JSON.parse(
            JSON.stringify(this.leaguesForParentClub)
          );
        },
        (error) => {
          // this.commonService.hideLoader();
          this.commonService.toastMessage(
            "Fetching failed for leagues",
            2500,
            ToastMessageType.Error
          );
          console.error("Error in fetching:", error);
        }
      );
  };

  fetchAllMatches() {
    this.commonService.showLoader("Fetching matches...");

    this.httpService
      .post(`${API.FetchAllMatches}`, this.fetchAllMatchesInput)
      .subscribe(
        (res: any) => {
          if (res) {
            this.commonService.hideLoader();
            this.fetchAllMatchesRes = res.data;
            this.matchlist = this.fetchAllMatchesRes.AllMatches;
            console.log("FetchAllMatches RESPONSE", JSON.stringify(res.data));
            this.filteredMatchlist = JSON.parse(JSON.stringify(this.matchlist));
          } else {
            console.log("error in fetching");
          }
        },
        (error) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage(
            error.error.message,
            3000,
            ToastMessageType.Error
          );
        }
      );
  }

  gotoLeaguedetailsPage(league: LeaguesForParentClubModel) {
    this.navCtrl.push("LeaguedetailsPage", {
      league_id: league.id,
    });
  }

  gotoMatchdetailsPage(match: AllMatchData) {
    // Navigate to match details page
    this.navCtrl.push("MatchdetailsPage", {
      match: match,
    });
  }

  getLeagueSearch(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != "") {
      this.filteredleagues = this.leaguesForParentClub.filter((item) => {
        if (item.league_name != undefined) {
          if (item.league_name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        if (item.activity.ActivityName != undefined) {
          if (
            item.activity.ActivityName.toLowerCase().indexOf(
              val.toLowerCase()
            ) > -1
          )
            return true;
        }
        if (item.club.ClubName != undefined) {
          if (item.club.ClubName.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
      });
    }
  }

  getFilterEvents(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() !== "") {
      this.filteredMatchlist = this.matchlist.filter((item) => {
        if (
          item.MatchTitle &&
          item.MatchTitle.toLowerCase().indexOf(val.toLowerCase()) > -1
        )
          return true;
        if (
          item.ActivityName &&
          item.ActivityName.toLowerCase().indexOf(val.toLowerCase()) > -1
        )
          return true;
        if (
          item.homeUserName &&
          item.homeUserName.toLowerCase().indexOf(val.toLowerCase()) > -1
        )
          return true;
        if (
          item.awayUserName &&
          item.awayUserName.toLowerCase().indexOf(val.toLowerCase()) > -1
        )
          return true;
        return false;
      });
    } else {
      this.initializeMatches();
    }
  }

  initializeMatches() {
    this.filteredMatchlist = this.matchlist;
  }

  initializeItems() {
    this.filteredleagues = this.leaguesForParentClub;
  }
}
