import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../../services/graphql.service';
import { LeagueParticipantModel } from '../models/league.model';
import { CreateLeagueMatchInput, UserDeviceMetadataField, UserPostgreMetadataField } from '../leaguemodels/creatematchforleague.dto';
import moment from 'moment';
import { finalize } from 'rxjs/operators';
import { HttpService } from '../../../../services/http.service';

/**
 * Generated class for the AutocreatematchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-autocreatematch',
  templateUrl: 'autocreatematch.html',
  providers: [GraphqlService, HttpService]
})
export class AutocreatematchPage {
  min: any;
  max: any;
  leagueId: string;
  matchDate: string;
  matchTime: string;
  players: LeagueParticipantModel[] = [];
  generatedMatches: GeneratedMatch[] = [];
  selectedPlayers: LeagueParticipantModel[] = [];
  publicType: boolean = true;
  selectedRound: number = 1;
  privateType: boolean = true;
  location_id: string;
  location_type: number;
  isLoading: boolean = false;

  // Initialize the input object
  inputObj: CreateLeagueMatchInput = {
    MatchName: '',
    CreatedBy: '',
    LeagueId: '',
    GroupId: '',
    Stage: 0,
    Round: 0,
    MatchVisibility: 0,
    MatchDetails: '',
    StartDate: '',
    primary_participant_id: '',
    secondary_participant_id: '',
    user_postgre_metadata: {
      UserParentClubId: '',
      UserActivityId: ''
    },
    user_device_metadata: {
      UserAppType: 0,
      UserActionType: 0,
      UserDeviceType: 0
    },
    location_id: '',
    location_type: 0,
    EndDate: '',
    MatchPaymentType: 0
  };

  numberofMatches: number;
  numberofPlayers: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public commonService: CommonService,
    public sharedservice: SharedServices,
    private graphqlService: GraphqlService,
    private httpService: HttpService,
  ) {
    this.leagueId = this.navParams.get('leagueId');
    this.matchDate = this.navParams.get('leagueDate');
    this.matchTime = this.navParams.get('leagueTime');
    this.location_id = this.navParams.get('location_id');
    this.location_type = this.navParams.get('location_type');
    this.inputObj.location_id = this.location_id;
    this.inputObj.location_type = this.location_type;
    this.min = new Date().toISOString();
    this.max = "2049-12-31";
    this.getPlayers();
  }
  getPlayers() {
    const parentclubId = this.sharedservice.getPostgreParentClubId();
    const GetLeagueParticipantInput = {
      user_postgre_metadata: {
        UserParentClubId: parentclubId
      },
      leagueId: this.leagueId
    }
    const participantsStatusQuery = gql`
      query getLeagueParticipants($leagueParticipantInput: GetLeagueParticipantInput!) {
        getLeagueParticipants(leagueParticipantInput:$leagueParticipantInput) { 
          id
          participant_name
           participant_details{
          user_id
           is_child
           is_enable
           parent_id
           email
           contact_email
           parent_email
           media_consent
           is_enable
           first_name
          last_name
          dob
          parent_phone_number
          medical_condition
      
        }
        }
      }
    `;

    this.graphqlService.query(participantsStatusQuery, { leagueParticipantInput: GetLeagueParticipantInput }, 0)
      .subscribe((data: any) => {
        this.players = data.data.getLeagueParticipants.map(player => ({
          ...player,
          isSelected: false
        }));
      },
        (error) => {
          // this.handleError(error);
        });
  }

  getSelectedPlayersCount(): number {
    return this.players.filter(player => player.isSelected).length;
  }


  changeType(val) {
    this.publicType = val == 'public' ? true : false;
    this.inputObj.MatchVisibility = val == 'private' ? 1 : 0;
  }

  updateMatchPaymentType(isChecked: boolean): void {
    this.inputObj.MatchPaymentType = isChecked ? 1 : 0;
  }


  // async selectPlayer(player: LeagueParticipantModel, event: any) {
  //   //  player.isSelected = event.detail.checked;
  //   const index = this.players.findIndex(p => p.participant_details.user_id === player.participant_details.user_id);
  //   if (index !== -1) {
  //     this.players[index].isSelected = event.checked;

  //     this.updateMatchCounts();

  //     const selectedPlayers = this.players.filter(player => player.isSelected);
  //     if (
  //       selectedPlayers.length >= 2 && 
  //       this.selectedRound && 
  //       this.matchDate && 
  //       this.matchTime &&
  //       !this.isLoading
  //     ) {
  //       await this.generateMatches();
  //     }
  //   }
  // }

  async selectPlayer(player: LeagueParticipantModel, event: any) {
    const index = this.players.findIndex(p => p.participant_details.user_id === player.participant_details.user_id);
    if (index !== -1) {
      this.players[index].isSelected = event.checked;
      this.updateMatchCounts(); // Update player and match counts locally
    }
  }


  resetMatch() {
    this.navCtrl.pop();
  }
  updateMatchCounts() {
    // Count selected players
    const selectedPlayers = this.players.filter(player => player.isSelected);
    this.numberofPlayers = selectedPlayers.length;

    // Calculate number of matches
    // For example, if each player plays against every other player once:
    // this.numberofMatches = this.calculateNumberOfMatches(this.numberofPlayers);
    if (selectedPlayers.length >= 2) {
      this.numberofMatches = this.calculateNumberOfMatches(this.numberofPlayers);
    } else {
      this.numberofMatches = 0;
    }
  }

  calculateNumberOfMatches(numberOfPlayers: number): number {
    // Formula for round-robin tournament: (n * (n-1)) / 2
    // where n is the number of players
    return Math.floor((numberOfPlayers * (numberOfPlayers - 1)) / 2);
  }

  // async generateMatches() {
  //   try {
  //     const selectedPlayers = this.players.filter(player => player.isSelected);

  //     if (selectedPlayers.length < 2) {
  //       this.commonService.toastMessage(
  //         'Please select at least 2 players',
  //         2500,
  //         ToastMessageType.Error,
  //         ToastPlacement.Bottom
  //       );
  //       return;
  //     }

  //     if (!this.selectedRound) {
  //       this.commonService.toastMessage(
  //         'Please select a round',
  //         2500,
  //         ToastMessageType.Error,
  //         ToastPlacement.Bottom
  //       );
  //       return;
  //     }

  //     if (!this.matchDate || !this.matchTime) {
  //       this.commonService.toastMessage(
  //         'Please select match date and time',
  //         2500,
  //         ToastMessageType.Error,
  //         ToastPlacement.Bottom
  //       );
  //       return;
  //     }


  //     this.isLoading = true;
  //     this.commonService.showLoader('Generating matches...');

  //     const payload = {
  //       leagueId: this.leagueId,
  //       playerIds: selectedPlayers.map(player => player.participant_details.user_id),
  //       round: Number(this.selectedRound),
  //       isPublic: this.publicType
  //     };

  //     // Using HttpClient instead of GraphQL
  //     this.httpService.post(
  //       'league/generate-matches',
  //       payload
  //     ).subscribe((res: any) => {
  //       this.numberofPlayers = res.data.numberOfPlayers;
  //       this.numberofMatches = res.data.numberOfMatches;
  //       this.generatedMatches = res.data.matches.map(match => ({
  //         ...match,
  //         match_date: this.matchDate,
  //         match_time: this.matchTime
  //       }));

  //       this.commonService.toastMessage(
  //         'Matches generated successfully',
  //         2500,
  //         ToastMessageType.Success,
  //         ToastPlacement.Bottom
  //       );
  //     })
  //   } catch (error) {
  //     console.error('Error generating matches:', error);
  //     this.generatedMatches = [];
  //     this.commonService.toastMessage(
  //       error.message || 'Failed to generate matches',
  //       2500,
  //       ToastMessageType.Error,
  //       ToastPlacement.Bottom
  //     );
  //   } finally {
  //     this.isLoading = false;
  //     this.commonService.hideLoader();
  //   }
  // }


  private isValidToCreateMatch(): boolean {
    // return (
    //   this.matchDate &&
    //   this.matchTime &&
    //   this.generatedMatches &&
    //   this.generatedMatches.length > 0
    // );

    const selectedPlayers = this.players.filter(player => player.isSelected);
    return (
      selectedPlayers.length >= 2 && // Check for selected players
      !!this.selectedRound &&        // Check if round is selected
      !!this.matchDate &&            // Check if date is selected
      !!this.matchTime              // Check if time is selected
    );
  }


  async createMatch() {
    if (!this.isValidToCreateMatch()) {
      this.commonService.toastMessage(
        'Please select match date, time, and at least 2 players',
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return;
    }

    try {
      this.commonService.showLoader('Creating matches...');

      // Step 1: Generate Matches
      const selectedPlayers = this.players.filter(player => player.isSelected);
      const payload = {
        leagueId: this.leagueId,
        playerIds: selectedPlayers.map(player => player.participant_details.user_id),
        round: Number(this.selectedRound),
        isPublic: this.publicType,
      };

      //await this.httpService.post('league/generate-matches', payload).toPromise();
      // this.generatedMatches = generatedMatchesResponse.data.matches.map(match => ({
      //   ...match,
      //   match_date: this.matchDate,
      //   match_time: this.matchTime,
      // }));
      // await this.httpService.post(
      //   'league/generate-matches',
      //   payload
      // ).subscribe((res: any) => {
      //   this.numberofPlayers = res.data.numberOfPlayers;
      //   this.numberofMatches = res.data.numberOfMatches;
      //   this.generatedMatches = res.data.matches.map(match => ({
      //     ...match,
      //     match_date: this.matchDate,
      //     match_time: this.matchTime
      //   }));


      // })

      await new Promise((resolve, reject) => {
        this.httpService.post('league/generate-matches', payload)
          .subscribe({
            next: (res: any) => {
              this.numberofPlayers = res.data.numberOfPlayers;
              this.numberofMatches = res.data.numberOfMatches;
              this.generatedMatches = res.data.matches.map(match => ({
                ...match,
                match_date: this.matchDate,
                match_time: this.matchTime
              }));
              resolve(true);
            },
            error: (error) => {
              reject(error);
            }
          });
      });
      // Step 2: Create Matches

      if (!this.generatedMatches || this.generatedMatches.length === 0) {
        throw new Error('No matches were generated');
      }

      const matchInputs = this.generatedMatches.map(match => {
        const p1 = this.players.find(p => match.player1_id === p.participant_details.user_id);
        const p2 = this.players.find(p => match.player2_id === p.participant_details.user_id);
        return {
          ...this.inputObj,
          LeagueId: this.leagueId,
          MatchName: '',
          CreatedBy: this.sharedservice.getLoggedInId(),
          StartDate: moment(new Date(this.matchDate + ' ' + this.matchTime).getTime()).format('YYYY-MM-DD HH:mm'),
          primary_participant_id: p1.id,
          secondary_participant_id: p2.id,
          Round: Number(this.selectedRound),
          user_postgre_metadata: {
            UserParentClubId: this.sharedservice.getPostgreParentClubId(),
          },
          user_device_metadata: {
            UserAppType: 0,
            UserActionType: 0,
            UserDeviceType: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
          },
        };
      });

      const CREATE_MATCHES_MUTATION = gql`
      mutation addBulkMatchesToLeague($createLeagueMatchesInput: [CreateLeagueMatchInput!]!) {
        addBulkMatchesToLeague(createLeagueMatchesInput: $createLeagueMatchesInput) {
          league {
            id
          }
          match {
            Id
          }
        }
      }
    `;

      const response = await this.graphqlService.mutate(
        CREATE_MATCHES_MUTATION,
        { createLeagueMatchesInput: matchInputs },
        0
      ).toPromise();

      if (response.data.addBulkMatchesToLeague) {
        this.commonService.toastMessage(
          'Matches created successfully',
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom
        );
        this.navCtrl.pop();
      } else {
        throw new Error('Failed to create matches');
      }
    } catch (error) {
      console.error('Error creating matches:', error);
      this.commonService.toastMessage(
        error.message || 'Failed to create matches',
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
    } finally {
      this.commonService.hideLoader();
    }
  }

  // createMatch() {
  //   if (!this.isValidToCreateMatch()) {
  //     this.commonService.toastMessage(
  //       'Please select match date, time and at least 2 players',
  //       2500,
  //       ToastMessageType.Error,
  //       ToastPlacement.Bottom
  //     );
  //     return;
  //   }

  //   this.commonService.showLoader('Creating matches...');


  //   const CREATE_MATCHES_MUTATION = gql`
  //     mutation addBulkMatchesToLeague($createLeagueMatchesInput: [CreateLeagueMatchInput!]!) {
  //       addBulkMatchesToLeague(createLeagueMatchesInput: $createLeagueMatchesInput) {
  //         league {
  //           id
  //         }
  //         match {
  //           Id
  //         }
  //       }
  //     }
  //   `;

  //   // Create match inputs from generated matches
  //   const matchInputs = this.generatedMatches.map(match => {
  //     const p1 = this.players.find(p => match.player1_id === p.participant_details.user_id);
  //     const p2 = this.players.find(p => match.player2_id === p.participant_details.user_id);
  //     const matchInput: CreateLeagueMatchInput = {
  //       ...this.inputObj,
  //       LeagueId: this.leagueId,
  //       MatchName: '',
  //       CreatedBy: this.sharedservice.getLoggedInId(),
  //       StartDate: moment(new Date(this.matchDate + " " + this.matchTime).getTime()).format("YYYY-MM-DD HH:mm"),
  //       primary_participant_id: p1.id,
  //       secondary_participant_id: p2.id,
  //       //Stage: 0,
  //       Round: Number(this.selectedRound),
  //       user_postgre_metadata: {
  //         UserParentClubId: this.sharedservice.getPostgreParentClubId(),

  //       },
  //       user_device_metadata: {
  //         UserAppType: 0,
  //         UserActionType: 0,
  //         UserDeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2
  //       },

  //     };
  //     return matchInput;
  //   });

  //   console.log('match inputs', JSON.stringify(matchInputs));

  //   // Make the GraphQL mutation call
  //   this.graphqlService.mutate(
  //     CREATE_MATCHES_MUTATION,
  //     { createLeagueMatchesInput: matchInputs },
  //     0
  //   ).subscribe({
  //     next: (response: any) => {
  //       this.commonService.hideLoader();
  //       if (response.data.addBulkMatchesToLeague) {
  //         this.commonService.toastMessage(
  //           'Matches created successfully',
  //           2500,
  //           ToastMessageType.Success,
  //           ToastPlacement.Bottom
  //         );
  //         this.navCtrl.pop();
  //       } else {
  //         this.commonService.toastMessage(
  //           'Failed to create matches',
  //           2500,
  //           ToastMessageType.Error,
  //           ToastPlacement.Bottom
  //         );
  //       }
  //     },
  //     error: (error) => {
  //       this.commonService.hideLoader();
  //       // this.handleError(error);
  //     }
  //   });
  // }
}





interface GeneratedMatch {
  league_id: string;
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player2_name: string;
  match_date: string;
  match_time: string;
}

interface GenerateMatchesInput {
  leagueId: string;
  playerIds: string[];
  round: number;
  isPublic: boolean;
}

