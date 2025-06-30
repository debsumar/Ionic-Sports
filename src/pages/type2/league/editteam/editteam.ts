import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import moment from "moment";
import gql from 'graphql-tag';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { ClubVenue } from '../models/venue.model';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { EditTeamsForParentClubModel, TeamsForParentClubModel } from '../models/team.model';
import { Activity } from '../models/activity.model';
import { GraphqlService } from '../../../../services/graphql.service';

/**
 * Generated class for the EditteamPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editteam',
  templateUrl: 'editteam.html',
})
export class EditteamPage {


  publicType: boolean = true;
  clubVenues: ClubVenue[] = [];
  privateType: boolean = true;
  parentClubTeamEdit: ParentClubTeamEdit = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    teamId: "",
    teamDetailsInput: {
      activityCode: "",
      venueKey: "",
      venueType: 0,
      ageGroup: "",
      teamName: "",
      shortName: "",
      teamStatus: 0,
      teamVisibility: 0,
      teamDescription: ""
    }
  }

  venueDetailsInput: VenueDetailsInput = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    VenueKey: ""
  }

  allactivity = [];
  types = [];
  venueKey: string;
  editTeams: TeamsForParentClubModel;
  // team:EditTeamsForParentClubModel;
  team: TeamsForParentClubModel;
  activities: Activity[] = [];


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public commonService: CommonService,
    public popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private apollo: Apollo,
    private graphqlService: GraphqlService,

  ) {
    this.team = this.navParams.get("team");
    console.log(this.team);
    this.publicType = this.team.teamVisibility == '0' ? true : false
    console.log(this.team);
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubTeamEdit.teamId = this.team.id;
        this.parentClubTeamEdit.ParentClubKey =
          val.UserInfo[0].ParentClubKey;
        this.parentClubTeamEdit.MemberKey = val.$key;
        this.venueDetailsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.venueDetailsInput.MemberKey = val.$key;
        this.getClubVenues();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditteamPage');
  }

  ionViewWillEnter() {
    console.log("ionViewDidLoad EditteamPage");

  }

  gotoHome() {
    this.navCtrl.push("Dashboard");
  }

  changeType(val) {

    this.publicType = val == 'public' ? true : false;
    this.parentClubTeamEdit.teamDetailsInput.teamVisibility = val == 'private' ? 1 : 0;
  }

  selectClubName() {
    const cluubIndex = this.clubVenues.findIndex(
      (club) => club.ClubKey === this.parentClubTeamEdit.teamDetailsInput.venueKey,
    );
    this.parentClubTeamEdit.teamDetailsInput.venueKey =
      cluubIndex > -1 ? this.clubVenues[cluubIndex].ClubName : "";
  }


  //getting venues
  getClubVenues = () => {
    this.commonService.showLoader("Please wait...");
    const clubVenuesQuery = gql`
      query getAllClubVenues($ParentClub: String!) {
        getAllClubVenues(ParentClub: $ParentClub) {
          ClubName
          ClubKey
          LocationType
        }
      }
    `;
    this.graphqlService.query(
      clubVenuesQuery,
      { ParentClub: this.parentClubTeamEdit.ParentClubKey },
      1
    ).subscribe(({ data }) => {
      this.commonService.hideLoader();
      console.log(
        "teams data" + JSON.stringify(data["getAllClubVenues"])
      );
      this.commonService.hideLoader();
      this.clubVenues = data["getAllClubVenues"];
      console.log("alll venues:", this.clubVenues)

      if (this.clubVenues.length > 0) {

        this.venueKey = this.team.venueKey;
        console.log("venue :", this.venueKey)
        this.parentClubTeamEdit.teamDetailsInput.venueKey = this.clubVenues[0].ClubKey;
        this.parentClubTeamEdit.teamDetailsInput.venueType = this.clubVenues[0].LocationType;
        this.getActivity();
      }
      console.log("activity", this.clubVenues);

    },
      (error) => {
        this.commonService.toastMessage(
          "Club venue fetch failed",
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom
        );
      }
    )
  };

  getActivity() {
    //this.commonService.showLoader("Please wait...");
    this.venueDetailsInput.VenueKey = this.venueKey;
    // this.venueDetailsInput.VenueKey=this.parentClubTeamEdit.teamDetailsInput.venueKey

    console.log("venueKey for activity", this.venueDetailsInput.VenueKey);
    const activityQuery = gql`
      query getAllActivityByVenue($venueDetailsInput: VenueDetailsInput!) {
        getAllActivityByVenue(venueDetailsInput: $venueDetailsInput) {

              ActivityCode
              ActivityName
              ActivityKey
        }
      }
    `;
    this.graphqlService.query(
      activityQuery,
      { venueDetailsInput: this.venueDetailsInput },
      1
    ).subscribe(({ data }) => {
      this.commonService.hideLoader();
      console.log(
        "activity data" + JSON.stringify(data["getAllActivityByVenue"])
      );
      this.commonService.hideLoader();
      this.activities = data["getAllActivityByVenue"];
      if (this.activities.length > 0) {
        this.parentClubTeamEdit.teamDetailsInput.activityCode = String(this.activities[0].ActivityCode);
        console.log("activity code is:", this.parentClubTeamEdit.teamDetailsInput.activityCode)


      }
      console.log("activity", this.clubVenues);

    },
      (error) => {
        this.commonService.toastMessage(
          "Activity fetch failed",
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom
        );
      }
    )
  }

  //Mutation for updating the team
  updateTeamDetails = async () => {
    console.log(JSON.stringify(this.parentClubTeamEdit));
    this.parentClubTeamEdit.teamDetailsInput.venueKey = this.venueKey;

    this.parentClubTeamEdit.teamDetailsInput.teamVisibility = this.parentClubTeamEdit.teamDetailsInput.teamVisibility;
    this.parentClubTeamEdit.teamDetailsInput.teamDescription = this.team.teamDescription;
    this.parentClubTeamEdit.teamDetailsInput.teamName = this.team.teamName;
    this.parentClubTeamEdit.teamDetailsInput.shortName = this.team.shortName;
    this.parentClubTeamEdit.teamDetailsInput.ageGroup = this.team.ageGroup;
    this.parentClubTeamEdit.teamDetailsInput.activityCode = String(this.team.activity.ActivityCode);
    this.parentClubTeamEdit.teamId = this.team.id;

    const updateMut = gql`
         mutation modifyParentClubTeam($teamEditInput: ParentClubTeamEdit!){
        modifyParentClubTeam(teamEditInput:$teamEditInput)
      }
    `;

    const variables = { teamEditInput: this.parentClubTeamEdit };

    await this.graphqlService.mutate(updateMut, variables, 0).subscribe((res: any) => {
      this.commonService.hideLoader();
      this.commonService.toastMessage(
        "Team updated successfully",
        2500,
        ToastMessageType.Success,
        ToastPlacement.Bottom
      );
      this.editTeams = res["modifyParentClubTeam"];
      console.log("editTeam data" + res["modifyParentClubTeam"]);
      // this.commonService.updateCategory("teamlist");
      this.navCtrl.pop().then(() => this.navCtrl.pop());

    },
      (error) => {
        this.commonService.hideLoader();
        console.log(JSON.stringify(error));
        this.commonService.toastMessage(
          "Team updation failed",
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom
        );
      }
    );

  }

  //age group hint
  ageGroupHint() {
    let message = "Enter age group separated by comma (,) e.g. 12U, 14U etc.";
    this.showToast(message, 5000);
  }

  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: "bottom",
    });
    toast.present();
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent,
    });
  }
} // ✅ Corrected closing bracket for the class

export class ParentClubTeamEdit {
  ParentClubKey: String
  MemberKey: String
  AppType: number
  ActionType: number;
  teamId: String;
  teamDetailsInput: {
    activityCode: String
    venueKey: String
    venueType: number
    ageGroup: String
    teamName: String
    shortName: String
    teamStatus: number
    teamVisibility: number
    teamDescription: String;
  }
}


export class VenueDetailsInput {
  ParentClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  VenueKey: string;
}