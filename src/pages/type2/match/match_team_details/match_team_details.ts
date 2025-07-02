import { Component } from "@angular/core";
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams, AlertController, ModalController } from "ionic-angular";
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
import { MatchType } from "../../../../shared/utility/enums";
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
})
export class MatchTeamDetailsPage {
  activeType: boolean = true;



  match: MatchModelV2;
  history: any;

  InvitationResponseInput = {
    MatchId: "",
    MemberKey: "",
    ParticipationStatus: 0,
    InviteStatus: 3,
  };
  parentClubKey: string;
  isCanEditTeams: boolean = false;
  isTeamParticipantsAvail: boolean = true;
  isHistory = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    private graphqlService: GraphqlService
  ) {



    this.match = this.navParams.get("match");
    this.isHistory = this.navParams.get('isHistory')
    if (!this.isHistory) {
      this.isHistory = false
    }

    console.log(this.match);

    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey

      }
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad MatchTeamDetailsPage");

  }

  getFormattedDate(date: any) {
    return moment(+date).format("DD MMM YYYY, hh:mm A");
  }

  formatMatchStartDate(date) {
    return moment(date, "YYYY-MM-DD HH:mm").local().format("DD-MMM-YYYY hh:mm A");
  }






  changeType(val) {
    this.activeType = val;
    // this.invitedType = !val;
    // this.activeType ? this.getActiveTeams() : this.getInvitedPlayers();
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
