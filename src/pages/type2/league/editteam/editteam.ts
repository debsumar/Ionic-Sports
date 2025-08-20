import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, NavController, NavParams, PopoverController, ToastController } from 'ionic-angular';
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
import { TeamImageUploadService } from '../../team/team_image_upload/team_image_upload.service';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera';
import { IClubDetails } from '../../../../shared/model/club.model';

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
  providers: [TeamImageUploadService]
})
export class EditteamPage {
  img_url: string = "";

  publicType: boolean = true;
  clubs: IClubDetails[] = [];
  privateType: boolean = true;
  postgre_parentclubId: string;

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
      teamStatus: 0,
      teamVisibility: 0,
      teamDescription: "",
      logo_url: ''
    },
    shortName: ""
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
    public actionSheetCtrl: ActionSheetController,

    private imageUploadService: TeamImageUploadService,
    private camera: Camera,
    public sharedService: SharedServices,

  ) {
    this.team = this.navParams.get("team");
    console.log(this.team);
    this.publicType = this.team.teamVisibility == '0' ? true : false
    console.log(this.team);
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.postgre_parentclubId = this.sharedService.getPostgreParentClubId();

        this.parentClubTeamEdit.teamId = this.team.id;
        this.parentClubTeamEdit.ParentClubKey =
          val.UserInfo[0].ParentClubKey;
        this.parentClubTeamEdit.MemberKey = val.$key;
        this.venueDetailsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.venueDetailsInput.MemberKey = val.$key;
        this.parentClubTeamEdit.teamDetailsInput.logo_url = this.team.logo_url
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

  async selectTeamLogo() {
    // this.sponsorIndex = index;
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Choose File',
      buttons: [{
        text: 'Camera',
        role: 'destructive',
        icon: 'ios-camera',
        handler: () => {
          console.log('clicked');
          this.CaptureImage(this.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Gallery',
        icon: 'ios-image',
        handler: () => {
          //console.log('Share clicked');
          this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          //console.log('Cancel clicked');
        }
      }
      ]
    });
    await actionSheet.present();
  }

  async CaptureImage(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 70,
      sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      //mediaType: this.camera.MediaType.PICTURE
    };

    try {
      const imageData = await this.camera.getPicture(options);
      //const mimeType = sourceType === this.camera.EncodingType.JPEG ? 'image/jpeg' : 'image/png';
      this.img_url = imageData.startsWith('data:image/jpeg;base64,') ? imageData : `data:image/jpeg;base64,${imageData}`;
      this.prepareAndUpload();
    } catch (error) {
      console.log(`err:${JSON.stringify(error)}`);
      this.commonService.toastMessage("Error capturing image", 2500, ToastMessageType.Error);
    }
  }
  async prepareAndUpload() {
    try {
      this.commonService.showLoader("Uploading image...");

      const uniqueFileName = `${this.postgre_parentclubId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpeg`;
      // Step 1: Get presigned URL from server
      const presignedUrl = await this.imageUploadService.getPresignedUrl(uniqueFileName, 'team', 'ap-dev-league');

      // Step 2: Upload the image to S3 using presigned URL
      this.imageUploadService.uploadImage(presignedUrl[0].url, this.img_url).then(() => {
        this.commonService.hideLoader();
        const imageUrl = `${this.sharedService.getCloudfrontURL()}/team/${uniqueFileName}`;
        console.log(`uploadedurl:${this.sharedService.getCloudfrontURL()}/team/${uniqueFileName}`);
        this.parentClubTeamEdit.teamDetailsInput.logo_url = imageUrl;
        this.commonService.toastMessage("Image(s) uploaded successfully", 2500, ToastMessageType.Success);
      }).catch((err) => {
        console.log(`err:${JSON.stringify(err)}`);
        this.commonService.hideLoader();
        this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
      })

    } catch (error) {
      this.commonService.hideLoader();
      console.log(`err1:${JSON.stringify(error)}`);
      this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
    }
  }

  selectClubName() {
    const clubIndex = this.clubs.findIndex(
      (club) => club.FirebaseId === this.parentClubTeamEdit.teamDetailsInput.venueKey,
    );
    this.parentClubTeamEdit.teamDetailsInput.venueKey =
      clubIndex > -1 ? this.clubs[clubIndex].ClubName : "";
  }


  //getting venues using getVenuesByParentClub API
  getClubVenues = () => {
    this.commonService.showLoader("Please wait...");
    const clubs_input = {
      parentclub_id: this.postgre_parentclubId,
      user_postgre_metadata: {
        UserMemberId: this.sharedService.getLoggedInId()
      },
      user_device_metadata: {
        UserAppType: 0,
        UserDeviceType: this.sharedService.getPlatform() == "android" ? 1 : 2
      }
    }
    const clubVenuesQuery = gql`
      query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
        getVenuesByParentClub(clubInput:$clubs_input){
          Id
          ClubName
          FirebaseId
          MapUrl
          sequence
        }
      }
    `;
    this.graphqlService.query(
      clubVenuesQuery,
      { clubs_input: clubs_input },
      0
    ).subscribe(({ data }) => {
      this.commonService.hideLoader();
      console.log(
        "venues data" + JSON.stringify(data["getVenuesByParentClub"])
      );
      this.clubs = data["getVenuesByParentClub"] as IClubDetails[];
      console.log("all venues:", this.clubs)

      if (this.clubs.length > 0) {
        // Find venue by matching Id from team.club
        const selectedVenue = this.clubs.find(venue =>
          venue.Id === this.team.club.Id
        );

        if (selectedVenue) {
          this.venueKey = selectedVenue.FirebaseId;
          this.parentClubTeamEdit.teamDetailsInput.venueKey = selectedVenue.FirebaseId;
          this.parentClubTeamEdit.teamDetailsInput.venueType = 1;
        } else {
          // Fallback to first venue
          this.venueKey = this.clubs[0].FirebaseId;
          this.parentClubTeamEdit.teamDetailsInput.venueKey = this.clubs[0].FirebaseId;
          this.parentClubTeamEdit.teamDetailsInput.venueType = 1;
        }
        this.getActivity();
      }
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
      // console.log("activity", this.clubVenues);

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

    // Find the club using FirebaseId and set the Postgres clubId
    const club = this.clubs.find(club => club.FirebaseId === this.venueKey);
    if (club) {
      // Ensure we're using the Postgres ID for the club
      console.log("Using Postgres club ID:", club.Id);
    }

    this.parentClubTeamEdit.teamDetailsInput.teamVisibility = this.parentClubTeamEdit.teamDetailsInput.teamVisibility;
    this.parentClubTeamEdit.teamDetailsInput.teamDescription = this.team.teamDescription;
    this.parentClubTeamEdit.teamDetailsInput.teamName = this.team.teamName;
    this.parentClubTeamEdit.teamDetailsInput.ageGroup = this.team.ageGroup;
    this.parentClubTeamEdit.teamDetailsInput.activityCode = String(this.team.activity.ActivityCode);
    this.parentClubTeamEdit.teamId = this.team.id;

    // Debug the short_Name value
    console.log("Team short_Name value:", this.team.short_name);

    // Set shortName only at the root level
    // If short_Name is undefined or null, use a default value to ensure it's included in the payload
    this.parentClubTeamEdit.shortName = this.team.short_name || "DefaultShortName";

    // Log the final object to verify shortName is set in both places
    console.log("Final parentClubTeamEdit object:", JSON.stringify(this.parentClubTeamEdit));
    const updateMut = gql`
         mutation modifyParentClubTeam($teamEditInput: ParentClubTeamEdit!){
        modifyParentClubTeam(teamEditInput:$teamEditInput)
      }
    `;

    // Log the exact variables being sent to the mutation
    // console.log("GraphQL mutation variables:", JSON.stringify(variables));

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
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number;
  teamId: string;
  shortName: string
  teamDetailsInput: {
    activityCode: string
    venueKey: string
    venueType: number
    ageGroup: string
    teamName: string
    teamStatus: number
    teamVisibility: number
    teamDescription: string;
    logo_url: string;
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