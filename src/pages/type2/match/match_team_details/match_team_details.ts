import { Component, ViewChild } from "@angular/core";
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams, AlertController, ModalController, FabContainer } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../../../services/sharedservice";
import { FirebaseService } from "../../../../services/firebase.service";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { Apollo } from "apollo-angular";
import moment from "moment";
import gql from "graphql-tag";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../../services/graphql.service";
import { error } from "console";
import { MatchModelV2 } from "../../../../shared/model/match.model";
import { LeagueMatchActionType, MatchType } from "../../../../shared/utility/enums";
import { API } from "../../../../shared/constants/api_constants";
import { HttpService } from "../../../../services/http.service";
import { AppType } from "../../../../shared/constants/module.constants";
import { TeamsForParentClubModel } from "../../league/models/team.model";
/**
 * Generated class for the MatchTeamDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-match_team_details",
  templateUrl: "match_team_details.html",
  providers: [HttpService]

})
export class MatchTeamDetailsPage {
  @ViewChild('fab') fab: FabContainer;
  currencyDetails: any;
  activeType: boolean = true;
  selectedHomeTeamText: string;
  selectedAwayTeamText: string;

  match: MatchModelV2;
  parentClubKey: string;
  activitySpecificTeamsRes: TeamsForParentClubModel[] = [];
  selectedTeam: TeamsForParentClubModel;
  getActivitySpecificTeamInput: GetActivitySpecificTeamInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: ""
  }
  updateTeamInput: UpdateTeamInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    LeagueId: "",
    MatchId: "",
    HomeParticipantId: "",
    AwayParticipantId: "",
    HomeParentclubTeamIdId: "",
    AwayParentclubTeamIdId: ""
  }


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    private graphqlService: GraphqlService,
    private httpService: HttpService,

  ) {
    this.match = this.navParams.get("match");
    console.log('MATCH OBJ' + this.match);
    //  this.selectedHomeTeamText = this.matchObj.homeusername != null ? this.matchObj.homeusername : 'Home Team';
    // this.selectedAwayTeamText = this.matchObj.awayusername != null ? this.matchObj.awayusername : 'Away Team';
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    });
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey
        this.getActivitySpecificTeamInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.getActivitySpecificTeamInput.memberId = this.sharedservice.getLoggedInId();
        this.getActivitySpecificTeamInput.action_type = LeagueMatchActionType.MATCH;
        this.getActivitySpecificTeamInput.app_type = AppType.ADMIN_NEW;
        this.getActivitySpecificTeamInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.getActivitySpecificTeamInput.activityId = this.match.Activity.Id;

        this.updateTeamInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        this.updateTeamInput.memberId = this.sharedservice.getLoggedInId();
        this.updateTeamInput.action_type = LeagueMatchActionType.MATCH;;
        this.updateTeamInput.app_type = AppType.ADMIN_NEW;
        this.updateTeamInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
        this.updateTeamInput.LeagueId = ''
        this.updateTeamInput.MatchId = this.match.Id;
        this.getActivitySpecificTeam();
      }
    });
  }

  closeFab() {
    if (this.fab) {
      this.fab.close();
    }
  }
  ionViewDidLoad() {
    console.log("ionViewDidLoad MatchTeamDetailsPage");
  }
  formatMatchStartDate(date) {
    return moment(date, "YYYY-MM-DD HH:mm").local().format("DD-MMM-YYYY hh:mm A");
  }

  showAvailableTeams(isHomeTeam: boolean): void {
    this.closeFab();
    if (this.activitySpecificTeamsRes.length > 0) {
      // console.log(this.leagueParticipantForMatchRes);
      let alert = this.alertCtrl.create();
      alert.setTitle(`Select Team`);

      for (let userIndex = 0; userIndex < this.activitySpecificTeamsRes.length; userIndex++) {
        alert.addInput({
          type: 'radio',
          label: this.activitySpecificTeamsRes[userIndex].teamName,
          value: this.activitySpecificTeamsRes[userIndex].id,
          checked: isHomeTeam ? this.activitySpecificTeamsRes[userIndex].teamName == this.selectedHomeTeamText : this.activitySpecificTeamsRes[userIndex].teamName == this.selectedAwayTeamText
        });
      }

      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: (selectedVal) => {
          console.log('Selected Value:', selectedVal);
          if (!selectedVal) {
            this.commonService.toastMessage("Please select a team", 3000, ToastMessageType.Info);
            return false; // prevent alert from dismissing          
          }
          this.selectedTeam = this.activitySpecificTeamsRes.find(team => team.id === selectedVal);
          if (isHomeTeam) {
            if (selectedVal === this.selectedAwayTeamText) {
              this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
            } else {
              this.selectedHomeTeamText = this.selectedTeam.teamName;
              this.updateTeamInput.HomeParentclubTeamIdId = selectedVal;
              this.updateTeamInput.AwayParentclubTeamIdId = ""; //setting the deafult val to ""
            }
          } else {
            if (selectedVal === this.selectedHomeTeamText) {
              this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
            } else {
              this.selectedAwayTeamText = this.selectedTeam.teamName;
              this.updateTeamInput.AwayParentclubTeamIdId = selectedVal;
              this.updateTeamInput.HomeParentclubTeamIdId = ""; //setting the deafult val to ""
            }
          }
          this.updateTeam();
        }
      });

      alert.present();

    } else {
      this.commonService.toastMessage("No teams available", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  //tab change
  changeType(val: boolean) {
    // this.sections.forEach(section => section.items = []); // Clear the sections array
    this.activeType = val !== undefined ? val : !this.activeType;
    this.getActivitySpecificTeam();

    // if (this.activeType && this.matchObj.home_team_id !== null) {
    //   this.getLeagueMatchParticipant(1);
    // } else if (!this.activeType && this.matchObj.away_team_id !== null) {
    //   this.getLeagueMatchParticipant(1);
    // }
    // this.getFilteredSections();
    // console.log('leagueTeamPlayerStatusType:', this.leagueMatchParticipantInput.leagueTeamPlayerStatusType);
  }

  //to fetch list of avilable teams
  getActivitySpecificTeam() {
    this.httpService.post(`${API.GET_ACTIVIY_SPECIFIC_TEAM}`, this.getActivitySpecificTeamInput).subscribe((res: any) => {
      if (res) {
        this.activitySpecificTeamsRes = res.data;
        console.log("GET_ACTIVIY_SPECIFIC_TEAM RESPONSE", JSON.stringify(res.data));
      } else {
        console.log("error in fetching",)
      }
    }, error => {
      this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error,);
    });
  }

  updateTeam() {
    this.commonService.showLoader("Updating...");
    this.httpService.post(`${API.Update_League_Fixture}`, this.updateTeamInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        var res = res.message;
        console.log("Update_League_Fixture RESPONSE", JSON.stringify(res));
        this.commonService.toastMessage(res, 3000, ToastMessageType.Success);
        // this.getLeagueMatchParticipant(1);
      } else {
        console.log("error in Update_League_Fixture",)
      }
    },
      (err) => {
        this.commonService.hideLoader();
        if (err.error && err.error.message) {
          this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error,);
        } else {
          this.commonService.toastMessage("Failed to update fixture", 3000, ToastMessageType.Error,);
        }
      }
    );
  }




  deleteConfirm() {
    let match_delete_alert = this.alertCtrl.create({
      title: "Do you want to delete the match?",
      buttons: [
        {
          text: "Delete",
          // icon: "checkmark",
          handler: () => {
            this.delete();
          },
        },
        {
          text: "No",
          role: "cancel",
          // icon: "close",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });

    match_delete_alert.present();
  }



  delete() {

    this.commonService.showLoader("Please wait...");
    try {


      const delete_Match = gql`
       mutation deleteMatch($deleteMatchInput: DeleteMatchInput!) {
        deleteMatch(deleteMatchInput: $deleteMatchInput)
      }`
        ;
      const deleteVariable = { deleteMatchInput: { ParentClubKey: this.parentClubKey, MatchId: this.match.Id } }

      this.graphqlService.mutate(delete_Match, deleteVariable, 1).subscribe((response) => {
        this.commonService.hideLoader();
        const message = "match deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.commonService.updateCategory("matchlist");
        this.navCtrl.pop().then(() => this.navCtrl.pop().then());

      }, (err) => {
        this.commonService.hideLoader();
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("match deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {

      console.error("An error occurred:", error);

    }
  }

}

export class GetActivitySpecificTeamInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}

export class UpdateTeamInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  LeagueId: string;
  MatchId: string;
  HomeParticipantId: string;
  AwayParticipantId: string;
  HomeParentclubTeamIdId: string;
  AwayParentclubTeamIdId: string;
}
