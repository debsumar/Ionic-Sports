import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { AlertController, IonicPage, LoadingController, NavController, NavParams, PopoverController, ToastController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { GraphqlService } from '../../../../services/graphql.service';
import { LeagueMatch, Locations, MatchEditInput } from '../models/location.model';
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';
import { LeagueParticipantModel } from '../models/league.model';
import { HttpService } from '../../../../services/http.service';
import { error } from 'console';
import moment from 'moment';
/**
 * Generated class for the UpdateleaguematchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-updateleaguematch',
  templateUrl: 'updateleaguematch.html',
  providers: [HttpService]
})
export class UpdateleaguematchPage {
  min: any;
  max: any;
  startTime: string;
  publicType: boolean = true;
  privateType: boolean = true;
  locations: Locations[];
  participantData: LeagueParticipantModel[];

  filteredPrimaryParticipants: LeagueParticipantModel[];
  filteredSecondaryParticipants: LeagueParticipantModel[];


  match: string;

  data: LeagueMatch;
  start_date: string;
  start_time: string;

  inputObj: MatchEditInput = {
    fixture_id: '',
    match_id: '',
    homeparticipant_id: '',
    awayparticipant_id: '',
    start_date: '',
    round: 0,
    match_title: '',
    location_id: '',
    match_visibility: 0,
    match_description: ''
  }

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,
    private sharedService: SharedServices,
    private toastCtrl: ToastController,
    private httpService: HttpService
  ) {
    this.min = new Date().toISOString();
    this.max = "2049-12-31";


    this.data = this.navParams.get("match");

    console.log("data is:", this.data);

    this.publicType = this.data.match_visibility == 0 ? true : false;
    this.inputObj.homeparticipant_id = this.data.home_team_id ? this.data.home_team_id : this.data.home_participant_id;
    this.inputObj.awayparticipant_id = this.data.away_team_id ? this.data.away_team_id : this.data.away_participant_id;
    //const [start_date, start_time] = this.data.start_date.split(' ');
    // this.start_date = this.formatDateString(start_date);
    // this.start_time = start_time;
    // Ensure the string contains a space to split correctly
    const [date, time] = this.data.start_date.split(',');


    this.start_date = this.formatDateString(date)
    this.start_time = time;

    console.log('start date is', this.start_date);
    console.log('start time is', this.start_time);
    this.getLocationForParentClub();
    this.getParticipants();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateleaguematchPage');
  }

  changeType(val) {
    this.publicType = val == 'public' ? true : false;
    this.inputObj.match_visibility = val == 'private' ? 1 : 0;
  }

  formatDateString(inputDate: string): string {
    // Define the input date format
    const inputFormat = 'DD-MMM-YYYY';

    // Parse the input date
    const parsedDate = moment(inputDate, inputFormat);

    // Check if the date is valid
    if (!parsedDate.isValid()) {
      throw new Error(`Invalid date format: ${inputDate}`);
    }

    // Format the date to 'YYYY-MM-DD'
    return parsedDate.format('YYYY-MM-DD');
  }

  getLocationForParentClub() {
    const ParentClubLocationInput = {
      parentclub_id: this.sharedservice.getPostgreParentClubId()
    }
    const getLocation = gql`
    query getLocationByParentClub($locationInput: ParentClubLocationInput!){
      getLocationByParentClub(locationInput:$locationInput){
        id
        address1
        address2
        city
        map_latitude
        map_longitude
        map_url
        name
        note
        post_code
        website_url
        is_bar_available
        is_wc_available
        is_drinking_water
        is_resturant
        is_disabled_friendly
        is_baby_change
        is_parking_available
      }
    }`;
    this.graphqlService.query(getLocation, { locationInput: ParentClubLocationInput }, 0)
      .subscribe((res: any) => {
        //  this.commonService.hideLoader();
        this.locations = res.data.getLocationByParentClub;
        if (this.locations.length > 0) {
          // this.leagueCreationInput.league.location = this.locations[0].id;
        }
      },
        (error) => {
          this.commonService.toastMessage("Locations fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
        })
  }


  getParticipants() {
    const parentclubId = this.sharedservice.getPostgreParentClubId();
    let leagueId = this.data.league_id;
    const GetLeagueParticipantInput = {
      user_postgre_metadata: {
        UserParentClubId: parentclubId
      },
      leagueId: leagueId
    }
    const participantsStatusQuery = gql`
    query getLeagueParticipants($leagueParticipantInput: GetLeagueParticipantInput!) {
      getLeagueParticipants(leagueParticipantInput:$leagueParticipantInput) {
      
        id
        participant_name
        
      
        
      }
    }
  `;

    this.graphqlService.query(participantsStatusQuery, { leagueParticipantInput: GetLeagueParticipantInput }, 0).subscribe((data: any) => {
      this.participantData = data.data.getLeagueParticipants;
      // this.filteredParticipantData = [...this.participantData];
      this.filteredPrimaryParticipants = [...this.participantData];
      this.filteredSecondaryParticipants = [...this.participantData];
      this.filterParticipants(); // Apply the filter after fetching participants
      console.log("participants are", JSON.stringify(this.participantData));
    },
      (error) => {
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
      }
    )
  }


  filterParticipants() {
    //this.participantData=[]
    this.filteredPrimaryParticipants = this.participantData.filter(
      participant => participant.id !== this.inputObj.awayparticipant_id
    );

    this.filteredSecondaryParticipants = this.participantData.filter(
      participant => participant.id !== this.inputObj.homeparticipant_id
    );
  }

  validateInput() {
    if (this.start_date == "" || this.start_date == undefined) {
      let message = "Please enter a valid start date";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    } else if (this.data.match_title == "" || this.data.match_title == undefined) {
      let message = "Please enter match name";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    } if (this.data.location_id == "" || this.data.location_id == undefined) {
      let message = "Please select location";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    return true;
  }

  updateMatchConfirm() {
    this.commonService.commonAlert_V4("Update Match", "Are you sure you want to update the match?", "Yes:Update", "No", () => {
      this.updateLeague();
    })
  }

  updateLeague() {

    if (this.validateInput()) {
      this.inputObj.fixture_id = this.data.fixture_id;
      this.inputObj.match_id = this.data.match_id;

      this.inputObj.location_id = this.data.location_id;
      this.inputObj.match_title = this.data.match_title;
      this.inputObj.round = Number(this.data.round);

      this.inputObj.match_description = this.data.description;

      //this.inputObj.homeparticipant_id=this.inputObj.home_participant_id;
      //this.inputObj.awayparticipant_id=this.inputObj.away_participant_id;

      this.inputObj.start_date = moment(new Date(this.start_date + " " + this.start_time).getTime()).format("YYYY-MM-DD HH:mm")

      this.httpService.post('league/updateLeagueMatch', this.inputObj).subscribe((res: any) => {
        console.log(res);
        this.navCtrl.pop();
      }, (error) => {
        this.commonService.toastMessage("match updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    }
  }
}
