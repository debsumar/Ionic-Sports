import { Component } from "@angular/core";
import { Apollo } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import gql from "graphql-tag";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import { type } from "os";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../services/common.service";
import { Storage } from "@ionic/storage";
import { FirebaseService } from "../../../services/firebase.service";
import { SharedServices } from "../../services/sharedservice";
import { MatchModel } from "./models/match.model";
import * as moment from "moment";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../services/graphql.service";
import { MatchType } from "../../../shared/utility/enums";
/**
 * Generated class for the MatchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-match",
  templateUrl: "match.html",
})
export class MatchPage {
  fetchMatchesInput: FetchMatchesInput = {
    FetchType: 4,
    user_postgre_metadata: {
      UserParentClubId: ""
    }
  };
  matches: MatchModel[] = [];
  filteredMatches: MatchModel[] = [];
  searchInput = "";
  // FetchUserInput: FetchUserInput = {
  //   MemberKey: "-KubtWoLbO-XNPV_TGSZ",
  //   ParentClubKey: "",
  //   ParticipationStatus: 0,
  // };
  today = moment().format("DD-MM-YYYY");
  Today: number = 0;
  isPublish: boolean = true;
  isPending: boolean = true;

  // sum: number = 0;
  // totalMatches = this.matches.filter((element) => {
  //   this.sum = this.sum + element.MatchStartDate.length;
  //   console.log(this.sum);
  // });
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    private graphqlService: GraphqlService,
  ) {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "matchlist") {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            // this.FetchUserInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
          }
          this.getMatches();
          // this.getUserDetails();
        });
      }
    });

    this.fetchMatchesInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
  }

  ionViewWillEnter() {
    console.log("MatchPage");
    // this.navCtrl.push("CreatematchPage");

    // this.FetchMatchesInput.ParentClubKey = this.navParams.get(
    //   "selectedParentCubKey"
    // );

    // this.storage.get("userObj").then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.FetchMatchesInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
    //     this.FetchUserInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
    //   }
    //   this.getMatches();
    //   this.getUserDetails();
    // });
  }

  gotoDashboard() {
    this.navCtrl.push("Dashboard");
  }
  gotoMatchdetailsPage(match) {
    match.MatchType == MatchType.TEAM ?
      this.navCtrl.push("MatchTeamDetailsPage", { match: match }) :
      this.navCtrl.push("MatchdetailsPage", {
        match: match,
        // selectedmatchId: match.Id,
        // selectedmemberkey: this.FetchMatchesInput.MemberKey,
      });
  }

  //getting matches
  getMatches = () => {
    this.commonService.showLoader("Fetching matches...");
    const matchesQuery = gql`
      query fetchMatches($fetchMatchesInput: FetchMatchesInput!) {
        fetchMatches(fetchMatchesInput: $fetchMatchesInput) {
          Id
          IsActive
          IsEnable
          CreatedAt
          CreatedBy
          Activity {
            Id
            ActivityName
          }
          Result {
            ResultStatus
            Winner {
              Id
            }
          }
          MatchVisibility
          GameType
          MatchType
          PaymentType
          ResultStatus
          MatchStatus
          VenueName
          Details
          MatchStartDate
          Capacity
          MatchTitle
          Hosts {
            Name
          }
          Teams {
            Id
            TeamName
            TeamPoint
            ResultStatus
            Participants {
              User {
                FirstName
                LastName
                FirebaseKey
              }
            }
          }
        }
      }
    `;

    this.graphqlService.query(matchesQuery, { fetchMatchesInput: this.fetchMatchesInput }, 0).subscribe((res: any) => {
      this.commonService.hideLoader();
      this.matches = res.data.fetchMatches;
      this.matches = this.matches.sort(function (a, b) {
        return moment(b.MatchStartDate, "YYYY-MM-DD hh:mm").diff(
          moment(a.MatchStartDate, "YYYY-MM-DD hh:mm")
        );
      });
      this.filteredMatches = JSON.parse(JSON.stringify(this.matches));

      let today = moment().format("YYYY-MM-DD");
      this.Today = this.matches.filter((match) => {
        let match_createdAt = moment(
          match.MatchStartDate,
          "YYYY-MM-DD"
        ).format("YYYY-MM-DD");

        return moment(today).isSame(match_createdAt);
      }).length;
    },
      (error) => {
        //this.commonService.hideLoader();
        this.commonService.toastMessage("Fetching failed for match", 2500, ToastMessageType.Error);
        console.error("Error in fetching:", error);
        if (error.graphQLErrors) {
          console.error("GraphQL Errors:", error.graphQLErrors);
          for (const gqlError of error.graphQLErrors) {
            console.error("Error Message:", gqlError.message);
            console.error("Error Extensions:", gqlError.extensions);
          }
        }
        if (error.networkError) {
          console.error("Network Error:", error.networkError);
        }
      })


    // this.apollo
    //   .query({
    //     query: matchesQuery,

    //     fetchPolicy: "network-only",
    //     variables: {
    //       fetchMatchesInput: this.FetchMatchesInput,
    //     },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       console.log("matches data" + JSON.stringify(data["fetchMatches"]));
    //       this.commonService.hideLoader();
    //       this.matches = data["fetchMatches"];
    //       this.matches = this.matches.sort(function (a, b) {
    //         return moment(b.MatchStartDate, "YYYY-MM-DD hh:mm").diff(
    //           moment(a.MatchStartDate, "YYYY-MM-DD hh:mm")
    //         );
    //       });
    //       this.filteredMatches = JSON.parse(JSON.stringify(this.matches));

    //       let today = moment().format("YYYY-MM-DD");
    //       this.Today = this.matches.filter((match) => {
    //         let match_createdAt = moment(
    //           match.MatchStartDate,
    //           "YYYY-MM-DD"
    //         ).format("YYYY-MM-DD");

    //         return moment(today).isSame(match_createdAt);
    //       }).length;
    //     },
    //     (err) => {
    //       this.commonService.hideLoader();
    //       console.log(JSON.stringify(err));
    //       this.commonService.toastMessage(
    //         "Failed to fetch matches",
    //         2500,
    //         ToastMessageType.Error,
    //         ToastPlacement.Bottom
    //       );
    //     }
    //   );
  };

  formatMatchStartDate(date) {
    //return moment(+date, "YYYY-MM-DD hh:mm:ss").format("DD-MMM-YYYY, hh:mm");
    return moment(date, "YYYY-MM-DD HH:mm").format("DD-MMM-YYYY, hh:mm A");
  }

  gotoCreateMatch() {
    this.navCtrl.push("CreatematchPage");
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    // this.initializeItems();
    // set val to the value of the searchbar
    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != "") {
      this.filteredMatches = this.matches.filter((item) => {
        if (item.MatchTitle != undefined) {
          if (item.MatchTitle.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        if (item.Activity.ActivityName != undefined) {
          if (
            item.Activity.ActivityName.toLowerCase().indexOf(
              val.toLowerCase()
            ) > -1
          )
            return true;
        }
        if (item.Hosts[0].Name != undefined) {
          if (item.Hosts[0].Name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        // if (item.Hosts.Name != undefined) {
        //   return item.Hosts.Name.toLowerCase().indexOf(val.toLowerCase()) > -1;
        // }
      });
    } else this.initializeItems();
  }

  initializeItems() {
    this.filteredMatches = this.matches;
  }

  //   getUserDetails = () => {
  //     const userQuery = gql`
  //       query getUserStats($ladderInput: FetchUserInput!) {
  //         getUserStats(ladderInput: $ladderInput) {
  //           TotalMatches
  //           Wins
  //           rank
  //         }
  //       }
  //     `;
  //     this.apollo
  //       .query({
  //         query: userQuery,
  //         fetchPolicy: "network-only",
  //         variables: {
  //           ladderInput: this.FetchUserInput,
  //         },
  //       })
  //       .subscribe(
  //         ({ data }) => {
  //           console.log("user data" + JSON.stringify(data["getUserStats"]));
  //           this.commonService.hideLoader();
  //           this.users = data["getUserStats"];
  //         },
  //         (err) => {
  //           this.commonService.hideLoader();
  //           console.log(JSON.stringify(err));
  //           this.commonService.toastMessage(
  //             "Failed to fetch User Details",
  //             2500,
  //             ToastMessageType.Error,
  //             ToastPlacement.Bottom
  //           );
  //         }
  //       );
  //   };
}

export class FetchMatchesInput {
  FetchType: number;
  user_postgre_metadata: {
    UserParentClubId: string
  }
}

export class FetchUserInput {
  ParentClubKey: String;
  MemberKey: String;
  ParticipationStatus: number;
}
