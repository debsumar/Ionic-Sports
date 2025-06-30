import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LeagueMatch } from '../models/location.model';
import { LeagueMatchParticipantModel, LeagueParticipationForMatchModel, SelectedPlayerScorersModel } from '../models/league.model';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { LeagueTeamPlayerStatusType } from '../../../../shared/utility/enums';
import { SharedServices } from '../../../services/sharedservice';
import { AppType } from '../../../../shared/constants/module.constants';
import { first } from 'rxjs/operators';
import { FootballResultModel, LeagueResultModel, ResultJson } from '../../../../shared/model/league_result.model';

@IonicPage()
@Component({
  selector: 'page-summary_football',
  templateUrl: 'summary_football.html',
  providers: [HttpService]
})
export class SummaryFootballPage implements AfterViewInit {
  @ViewChild('doughnutCanvas', { read: ElementRef }) doughnutCanvas: ElementRef;
  homeScore: string; // Initialize homeScore
  awayScore: string;
  potmList;
  matchObj: LeagueMatch;
  leagueId: string;
  activityId: string;
  activityCode: number;
  homeTeamObj: LeagueParticipationForMatchModel;
  awayTeamObj: LeagueParticipationForMatchModel;
  selectedPlayersPotm: any[] = [];//those who are potm  of the match
  // selectedPlayersPotm: LeagueMatchParticipantModel[] = [];//those who are potm  of the match
  selectedPlayerhomeScorers: SelectedPlayerScorersModel[] = [];//those who are scorers of wining team
  // selectedPlayerhomeScorers: LeagueMatchParticipantModel[] = [];//those who are scorers of wining team
  selectedPlayersawayScorers: SelectedPlayerScorersModel[] = [];//those who are scorers of losing team

  selectedPOTMs = [];
  potmDisabled: boolean;

  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
  leagueMatchParticipantInput: LeagueMatchParticipantInput = {
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
    TeamId: "",
    TeamId2: "",
    leagueTeamPlayerStatusType: 0
  }

  leagueMatchResultInput: LeagueMatchResultInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    activityCode: '',
    leaguefixtureId: '',
  }

  getLeagueMatchResultRes: LeagueResultModel;

  publishLeagueResultForActivitiesInput: PublishLeagueResultForActivitiesInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    activityCode: '',
    leaguefixtureId: '',
    isDrawn: false,
    isHomeTeamWinner: false,
    isAwayTeamWinner: false,
    homeLeagueParticipationId: '',
    awayLeagueParticipationId: '',
    Football: {
      POTM: '',
      Team1: {
        Goal: '0',
        SHOTS: '',
        SHOTS_ON_GOAL: '',
        CORNERS: '',
        FOULS_COMMITTED: '',
        OFFSIDES: '',
        BALL_POSSESSION: '',
        YELLOW_CARD: '',
        RED_CARD: '',
        SCORE: []
      },
      Team2: {
        Goal: '0',
        SHOTS: '',
        SHOTS_ON_GOAL: '',
        CORNERS: '',
        FOULS_COMMITTED: '',
        OFFSIDES: '',
        BALL_POSSESSION: '',
        YELLOW_CARD: '',
        RED_CARD: '',
        SCORE: []
      }
    },

  }
  result_json: FootballResultModel;
  publishLeagueResultForActivitiesRes: any;

  ishome: boolean = true;

  selectedTab: string = 'stats';

  homePoss: string = '0.00';
  awayPoss: string = '0.00';

  rmaShotAttempts: string = (0.00).toFixed(1);
  awayShotAttempts: string = (0.00).toFixed(1);

  rmaFouls: string = (0.00).toFixed(1);
  awayFouls: string = (0.00).toFixed(1);

  // rmaGoalScorers: string[] = ["Ronaldo (3', 45')", "Benzema (60')"];
  // awayGoalScorers: string[] = ["Griezmann (78')"];

  // getPercentage(value1: number, value2: number): string {
  //   if (value2 === 0) {
  //     return '0'; // Avoid division by zero
  //   }
  //   return (((value1 / value2) * 100) / 2).toFixed(1);
  // }



  // matchStats: any[] = [
  //   { title: 'Shots on Goal', value1: this.getPercentage(0, 0), count1: 10, value2: this.getPercentage(0, 0), count2: 0 },
  //   { title: 'Shot Attempts', value1: this.getPercentage(13, 19), count1: 13, value2: this.getPercentage(0, 0), count2: 0 },
  //   { title: 'Fouls', value1: this.getPercentage(0, 0), count1: 10, value2: this.getPercentage(13, 23), count2: 0 },
  //   { title: 'Off-side', value1: this.getPercentage(0, 0), count1: 0, value2: this.getPercentage(0, 0), count2: 0 },
  //   { title: 'Yelllow Card', value1: this.getPercentage(0, 0), count1: 0, value2: this.getPercentage(0, 0), count2: 0 },
  //   { title: 'Red Card', value1: this.getPercentage(0, 0), count1: 0, value2: this.getPercentage(0, 0), count2: 0 }
  // ];


  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public commonService: CommonService, public alertCtrl: AlertController,
    private httpService: HttpService, public sharedservice: SharedServices, public modalCtrl: ModalController,

  ) {
    // this.commonService.category.pipe(first()).subscribe(async (data) => {

    //   if (data == "potmList") {
    // this.selectedPOTMs = JSON.parse(this.potmList);
    // console.log('Retrieved potmList:', this.selectedPOTMs);
    this.matchObj = this.navParams.get("match");
    this.leagueId = this.navParams.get("leagueId");
    // console.log("MATCHOBJ:", this.matchObj);
    this.activityId = this.navParams.get("activityId");
    this.activityCode = this.navParams.get("activityCode");
    console.log("ACTIVITY CODE:", this.activityCode);
    this.homeTeamObj = this.navParams.get("homeTeam");
    this.awayTeamObj = this.navParams.get("awayTeam");
    // console.log("HOME TEAM OBJ:", this.homeTeamObj);

    this.leagueMatchParticipantInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.leagueMatchParticipantInput.memberId = this.sharedservice.getLoggedInId();
    this.leagueMatchParticipantInput.action_type = 0;
    this.leagueMatchParticipantInput.app_type = AppType.ADMIN_NEW;
    this.leagueMatchParticipantInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    this.leagueMatchParticipantInput.LeagueId = this.leagueId;
    this.leagueMatchParticipantInput.MatchId = this.matchObj.match_id;

    this.leagueMatchResultInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.leagueMatchResultInput.memberId = this.sharedservice.getLoggedInId();
    this.leagueMatchResultInput.action_type = 0;
    this.leagueMatchResultInput.app_type = AppType.ADMIN_NEW;
    this.leagueMatchResultInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    this.leagueMatchResultInput.activityId = this.activityId;
    this.leagueMatchResultInput.activityCode = this.activityCode.toString();
    this.leagueMatchResultInput.leaguefixtureId = this.matchObj.fixture_id;

    this.publishLeagueResultForActivitiesInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.publishLeagueResultForActivitiesInput.memberId = this.sharedservice.getLoggedInId();
    this.publishLeagueResultForActivitiesInput.action_type = 0;
    this.publishLeagueResultForActivitiesInput.app_type = AppType.ADMIN_NEW;
    this.publishLeagueResultForActivitiesInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    this.publishLeagueResultForActivitiesInput.activityId = this.activityId;
    this.publishLeagueResultForActivitiesInput.activityCode = this.activityCode.toString();
    this.publishLeagueResultForActivitiesInput.leaguefixtureId = this.matchObj.fixture_id;
    this.publishLeagueResultForActivitiesInput.homeLeagueParticipationId = this.homeTeamObj.id;
    this.publishLeagueResultForActivitiesInput.awayLeagueParticipationId = this.awayTeamObj.id;
    this.getLeagueMatchParticipant();
    this.getLeagueMatchResult();

    this.ishome ? this.homeTeamObj = this.homeTeamObj : this.homeTeamObj = this.awayTeamObj;
    this.ishome ? this.awayTeamObj = this.awayTeamObj : this.awayTeamObj = this.homeTeamObj;
    //   }
    // })

  }

  // 🏅 Returns an array of player display names for POTM, handling both object shapes
  get potmDisplayNames(): string {
    // 🛑 Ensure API data is loaded before accessing
    if (!this.result_json || !this.getLeagueMatchResultRes) {
      // ⏳ Data not ready yet, return empty array
      return '';
    }
    // If selectedPlayersPotm is set and has .user, use FirstName/LastName
    if (this.selectedPlayersPotm.length && this.selectedPlayersPotm[0].user) {
      return this.selectedPlayersPotm
        .map(s => `${s.user.FirstName} ${s.user.LastName}`.trim())
        .join(', ');
    }
    // Otherwise, fallback to result_json TeamStats.POTM
    return this.result_json.POTM;
  }

  // 🏆 Returns an array of scorer objects for Team1 (home), handling both object shapes
  get scorerObjectsHome(): { PLAYER: string; TIME: string }[] {
    // 🛑 Ensure API data is loaded before accessing
    if (!this.result_json || !this.getLeagueMatchResultRes) {
      // ⏳ Data not ready yet, return empty array
      return [];
    }
    // ✅ If selectedPlayerhomeScorers is set and has .user, use FirstName/LastName and time
    if (this.selectedPlayerhomeScorers.length > 0) {
      return this.selectedPlayerhomeScorers.map(s => ({
        PLAYER: `${s.playerObj.user.FirstName} ${s.playerObj.user.LastName}`.trim(),
        TIME: s.time
      }));
    }
    // ✅ Otherwise, fallback to result_json TeamStats.Team1.SCORE array
    return this.result_json.Team1.SCORE.map(
      scorer => ({
        PLAYER: scorer.PLAYER,
        TIME: scorer.TIME
      })
    )
  }
  // 🏆 Returns an array of scorer objects for Team2 (away), handling both object shapes
  get scorerObjectsAway(): { PLAYER: string; TIME: string }[] {
    // 🛑 Ensure API data is loaded before accessing
    if (!this.result_json || !this.getLeagueMatchResultRes) {
      // ⏳ Data not ready yet, return empty array
      return [];
    }
    // ✅ If selectedPlayerawayScorers is set and has .user, use FirstName/LastName and time
    if (this.selectedPlayersawayScorers.length > 0) {
      return this.selectedPlayersawayScorers.map(s => ({
        PLAYER: `${s.playerObj.user.FirstName} ${s.playerObj.user.LastName}`.trim(),
        TIME: s.time
      }));
    }
    // ✅ Otherwise, fallback to result_json TeamStats.Team1.SCORE array
    return this.result_json.Team2.SCORE.map(
      scorer => ({
        PLAYER: scorer.PLAYER,
        TIME: scorer.TIME
      })
    )
  }


  // fetch league result api whne page laods
  getLeagueMatchResult() {
    // this.commonService.showLoader("Fetching teams...");
    this.httpService.post(`${API.Get_League_Match_Result}`, this.leagueMatchResultInput).subscribe((res: any) => {
      if (res) {
        this.getLeagueMatchResultRes = res.data;
        console.log("Get_League_Match_Result RESPONSE", (res.data));
        const rawResultJson = this.getLeagueMatchResultRes.result_json;

        if (typeof rawResultJson === 'string') {
          try {
            this.result_json = JSON.parse(rawResultJson) as FootballResultModel;
            console.log("✅ Decoded result_json (parsed):", this.result_json);
          } catch (err) {
            // 🐞 Log error if JSON parsing fails
            console.error('❌ Failed to parse result_json:', err, rawResultJson);
            this.result_json = {};
          }
        } else if (typeof rawResultJson === 'object' && rawResultJson !== null) {
          this.result_json = rawResultJson as FootballResultModel;
          console.log("✅ Decoded result_json (object):", this.result_json);
          // 🏅 Extract all PLAYER names from POTM array in result_json.TeamStats
          // const potmPlayers: string[] = this.result_json.TeamStats.POTM.map(potm => potm.PLAYER) ?? [];
          //           this.selectedPlayersPotm = potmPlayers;  
          this.homeScore = this.result_json.Team1.Goal.toString();
          this.awayScore = this.result_json.Team2.Goal.toString();
          this.homePoss = this.result_json.Team1.BALL_POSSESSION;
          this.awayPoss = this.result_json.Team2.BALL_POSSESSION;
        } else {
          this.result_json = {};
          console.warn('⚠️ result_json is neither string nor object:', rawResultJson);
        }
      } else {
        // this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    }, (error) => {
      console.error("❌ Error fetching league match result:", error);
      //this.commonService.hideLoader();
    })
  }

  PublishLeagueResult(result_input: Partial<PublishLeagueResultForActivitiesInput>) {
    // this.commonService.showLoader("Publishing result...");
    this.httpService.post(`${API.Publish_League_Result_For_Activities}`, result_input).subscribe((res: any) => {
      if (res) {
        // this.commonService.hideLoader();
        console.log("Publish_League_Result RESPONSE", (res.data));
        this.getLeagueMatchResult();
      } else {
        // this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    }, (error) => {
      console.error("❌ Error publishing league result:", error);
      //this.commonService.hideLoader();
    })
  }

  //publish result based on activites
  publishLeagueResultForActivities() {
    // this.commonService.showLoader("Fetching teams...");
    // 🏅 Set Football.POTM as array of objects with PLAYER property for API compatibility
    this.publishLeagueResultForActivitiesInput.Football.POTM = this.potmDisplayNames;
    // 🏆 Set Team1.SCORE as array of objects with PLAYER and TIME properties for API compatibility
    this.publishLeagueResultForActivitiesInput.Football.Team1.SCORE = this.scorerObjectsHome.map(scorer => ({
      PLAYER: scorer.PLAYER,
      TIME: scorer.TIME
    }));
    this.publishLeagueResultForActivitiesInput.Football.Team2.SCORE = this.scorerObjectsAway.map(scorer => ({
      PLAYER: scorer.PLAYER,
      TIME: scorer.TIME
    }));
    // this.publishLeagueResultForActivitiesInput.Football.Team1.Goal = +this.homeScore
    // this.publishLeagueResultForActivitiesInput.Football.Team2.Goal = +this.awayScore
    this.publishLeagueResultForActivitiesInput.Football.Team1.BALL_POSSESSION = this.homePoss
    this.publishLeagueResultForActivitiesInput.Football.Team2.BALL_POSSESSION = this.awayPoss

    this.httpService.post(`${API.Publish_League_Result_For_Activities}`, this.publishLeagueResultForActivitiesInput).subscribe((res: any) => {
      if (res) {
        // this.commonService.hideLoader();
        this.publishLeagueResultForActivitiesRes = res.data;
        console.log("Publish_League_Result_For_Activities RESPONSE", (res.data));
        this.getLeagueMatchResult();
      } else {
        // this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
  }


  getLeagueMatchParticipant() {
    this.commonService.showLoader("Fetching info ...");
    this.leagueMatchParticipantInput.TeamId = this.homeTeamObj.parentclubteam.id
    this.leagueMatchParticipantInput.TeamId2 = this.awayTeamObj.parentclubteam.id
    this.leagueMatchParticipantInput.leagueTeamPlayerStatusType = LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH;
    this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueMatchParticipantInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.leagueMatchParticipantRes = res.data || [];
        console.log("Get_League_Match_Participant RESPONSE", JSON.stringify(res.data));
      } else {
        this.commonService.hideLoader();
        console.log("error in fetching")
      }
    })
  }


  async editMatchStats() {
    const alert = await this.alertCtrl.create({
      title: 'Edit Match Stats',
      inputs: [
        {
          label: 'Home Possession',
          name: 'homePoss',
          placeholder: 'RMA Possession',
          type: 'number',
          value: this.homePoss ? this.homePoss.toString() : ''
        },
        {
          label: 'Away Possession',
          name: 'awayPoss',
          placeholder: 'away Possession',
          type: 'number',
          value: this.awayPoss ? this.awayPoss.toString() : ''
        },
        {
          label: `${this.homeTeamObj.parentclubteam.teamName} Shots on Goal`,
          name: 'shotsOnGoalRMA',
          placeholder: `${this.homeTeamObj.parentclubteam.teamName} Shots on Goal`,
          type: 'number',
          value: this.result_json.Team1 ? this.result_json.Team1.SHOTS_ON_GOAL : '0'
        },
        {
          label: `${this.awayTeamObj.parentclubteam.teamName} Shots on Goal`,
          name: 'shotsOnGoalAway',
          placeholder: `${this.awayTeamObj.parentclubteam.teamName} Shots on Goal`,
          type: 'number',
          value: this.result_json.Team2 ? this.result_json.Team2.SHOTS_ON_GOAL : '0'
        },
        {
          label: 'Home Shot Attempts',
          name: 'shotAttemptsRMA',
          placeholder: 'Home Shot Attempts',
          type: 'number',
          value: this.result_json.Team1 ? this.result_json.Team1.SHOTS : '0'
        },
        {
          label: 'Away Shot Attempts',
          name: 'shotAttemptsaway',
          placeholder: 'Away Shot Attempts',
          type: 'number',
          value: this.result_json.Team2 ? this.result_json.Team2.SHOTS : '0'
        },
        {
          label: 'Fouls By Home Team',
          name: 'foulsRMA',
          placeholder: 'Fouls By Home Team',
          type: 'number',
          value: this.result_json.Team1 ? this.result_json.Team1.FOULS_COMMITTED : '0'
        },
        {
          label: 'Fouls By Away Team',
          name: 'foulsaway',
          placeholder: 'Fouls By Away Team',
          type: 'number',
          value: this.result_json.Team2 ? this.result_json.Team2.FOULS_COMMITTED : '0'
        },
        {
          label: 'Offside By Home Team',
          name: 'offsideRMA',
          placeholder: 'Home Offside',
          type: 'number',
          value: this.result_json.Team1 ? this.result_json.Team1.OFFSIDES : '0'
        },
        {
          label: 'Offside By Away Team',
          name: 'offsideaway',
          placeholder: 'Away Offside',
          type: 'number',
          value: this.result_json.Team2 ? this.result_json.Team2.OFFSIDES : '0'
        },
        {
          label: 'Home Team Yellow Cards',
          name: 'yellowCardRMA',
          placeholder: 'Home Yellow Cards',
          type: 'number',
          value: this.result_json.Team1 ? this.result_json.Team1.YELLOW_CARD : '0'
        },
        {
          label: 'Away Team Yellow Cards',
          name: 'yellowCardaway',
          placeholder: 'Away Yellow Cards',
          type: 'number',
          value: this.result_json.Team2 ? this.result_json.Team2.YELLOW_CARD : '0'
        },
        {
          label: 'Home Team Red Cards',
          name: 'redCardRMA',
          placeholder: 'Home Red Cards',
          type: 'number',
          value: this.result_json.Team1 ? this.result_json.Team1.RED_CARD : '0'
        },
        {
          label: 'Away Team Red Cards',
          name: 'redCardaway',
          placeholder: 'Away Red Cards',
          type: 'number',
          value: this.result_json.Team2 ? this.result_json.Team2.RED_CARD : '0'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => console.log('Cancel clicked')
        },
        {
          text: 'Save',
          handler: data => {
            // Update the component properties with the new values
            this.homePoss = data.homePoss;
            this.awayPoss = data.awayPoss;

            // You'll need to add similar logic for the other stats
            // and also handle potential NaN values

            console.log('Match stats updated', data);
            this.drawDoughnutChart(); // Redraw the chart with the new data
          }
        }
      ]
    });

    await alert.present();
  }


  async gotoScoreInputPage(ishome: boolean) {
    const score = ishome ? this.homeScore : this.awayScore;
    const teamObj = ishome ? this.homeTeamObj : this.awayTeamObj;
    // const teamType = ishome ? 'home' : 'away';

    if (parseInt(score) > 0) {
      let modal = this.modalCtrl.create("ScoreInputPage", {
        "matchObj": this.matchObj,
        "leagueId": this.leagueId,
        "activityId": this.activityId,
        "teamObj": teamObj,
        "score": parseInt(score),
        "ishome": ishome,
      });
      modal.onDidDismiss(data => {
        console.log('Modal dismissed');
        if (data && data.goalDetails) {
          if (ishome) {
            //this.selectedPlayerhomeScorers = data.goalDetails;
            const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
              ...this.createBaseResultInput(),
              Football: {
                Team1: {
                  SCORE: data.goalDetails.map((goal: any) => ({
                    PLAYER: `${goal.playerObj.user.FirstName} ${goal.playerObj.user.LastName}`.trim(),
                    TIME: goal.time,
                  })),
                }
              }
            };
            this.PublishLeagueResult(result_input);
          } else {
            //this.selectedPlayersawayScorers = data.goalDetails;
            const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
              ...this.createBaseResultInput(),
              Football: {
                Team2: {
                  SCORE: data.goalDetails.map((goal: any) => ({
                    PLAYER: `${goal.playerObj.user.FirstName} ${goal.playerObj.user.LastName}`.trim(),
                    TIME: goal.time,
                  })),
                }
              }
            };
            this.PublishLeagueResult(result_input);
          }
          console.log("Received Scorers:", ishome ? this.selectedPlayerhomeScorers : this.selectedPlayersawayScorers);

          //this.publishLeagueResultForActivities()
        } else {
          console.log('No data received from modal');
        }
      });
      modal.present();
    } else {
      this.commonService.toastMessage(`Please set the score first`, 3000, ToastMessageType.Info);
    }
  }

  //common input for publish result input
  private createBaseResultInput(): Partial<PublishLeagueResultForActivitiesInput> {
    return {
      parentclubId: this.sharedservice.getPostgreParentClubId(),
      clubId: '',
      memberId: this.sharedservice.getLoggedInId(),
      action_type: 0,
      device_type: this.sharedservice.getPlatform() == "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId(),
      updated_by: this.sharedservice.getLoggedInId(),
      activityId: this.activityId,
      activityCode: this.activityCode.toString(),
      leaguefixtureId: this.matchObj.fixture_id,
      // isDrawn: false,
      // isHomeTeamWinner: false,
      // isAwayTeamWinner: false,
    };
  }
  //choosing winner/loser and goals
  async gotoResultInputPage(ishome: boolean) {
    console.log("going to potm.ts file");
    let modal = this.modalCtrl.create("ResultInputPage", {
      "matchObj": this.matchObj,
      "leagueId": this.leagueId,
      "activityId": this.activityId,
      "homeTeamObj": this.homeTeamObj,
      "awayTeamObj": this.awayTeamObj,
    });
    modal.onDidDismiss(data => {
      console.log('Modal dismissed');
      if (data && parseInt(data.awayTeamGoals) >= 0 && parseInt(data.homeTeamGoals) >= 0) {
        console.log("Received data from result INpUT PAGE:", data);
        // this.publishLeagueResultForActivitiesInput.Football.Team1.Goal = data.winnerTeamGoals;
        // this.publishLeagueResultForActivitiesInput.Football.Team2.Goal = data.loserTeamGoals;
        // data.isDrawn ? this.publishLeagueResultForActivitiesInput.isDrawn = true :
        this.publishLeagueResultForActivitiesInput.isDrawn = false;
        if (data.homeTeamGoals !== null) {
          this.homeScore = data.homeTeamGoals;
        }
        if (data.awayTeamGoals !== null) {
          this.awayScore = data.awayTeamGoals;
        }
        const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
          ...this.createBaseResultInput(),
          isHomeTeamWinner: +data.winnerTeamGoals > +data.loserTeamGoals,
          isAwayTeamWinner: +data.winnerTeamGoals < +data.loserTeamGoals,
          isDrawn: data.isDrawn ? true : false,
          Football: {
            Team1: {
              Goal: (data.winnerTeamGoals),
            },
            Team2: {
              Goal: (data.loserTeamGoals),
            },
          }

        };
        this.PublishLeagueResult(result_input);
        // console.log("Received winnerteamGOALS :", this.publishLeagueResultForActivitiesInput.Football.Team1.Goal);
        // 🟢 Call publishLeagueResultForActivities after selecting POTM
        //this.publishLeagueResultForActivities();
      } else {
        console.log('No data received from modal');
      }
    });
    modal.present();
  }

  async gotoPotmPage() {
    console.log("going to potm.ts file");
    let modal = this.modalCtrl.create("PotmPage", {
      "matchObj": this.matchObj,
      "leagueId": this.leagueId,
      "activityId": this.activityId,
      "homeTeamObj": this.homeTeamObj,
      "awayTeamObj": this.awayTeamObj,
      // "selectedPlayers": this.selectedPlayersPotm,
    });
    modal.onDidDismiss(data => {
      console.log('Modal dismissed');
      if (data) {
        this.selectedPlayersPotm = data;
        console.log("Received selected players:", this.selectedPlayersPotm);
        // 🟢 Call publishLeagueResultForActivities after selecting POTM
        this.publishLeagueResultForActivities();
      } else {
        console.log('No data received from modal');
      }
    });
    modal.present();
  }


  ngAfterViewInit() {
    this.drawDoughnutChart();
  }

  drawDoughnutChart() {
    const canvas = this.doughnutCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2;

    const data = [this.homePoss, this.awayPoss].map(poss => parseFloat(poss)); // 🟢 Convert string to number
    const labels = ['Atlético Madrid', 'Real Madrid'];
    const colors = ['red', 'green'];

    let startAngle = -Math.PI / 2;

    for (let i = 0; i < data.length; i++) {
      const sliceAngle = 2 * Math.PI * data[i] / 100;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.closePath();

      startAngle += sliceAngle;
    }

    // Add white circle in the middle to make it a doughnut chart
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();

    // Load and draw the Real Madrid logo
    const rmaLogo = new Image();
    rmaLogo.src = 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png';
    const awayLogo = new Image();
    awayLogo.src = 'https://logos-world.net/wp-content/uploads/2020/06/atletico-madrid-Logo.png';

    let imagesLoaded = 0;
    const totalImages = 2;

    const checkImagesLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        let logoWidth = radius * 0.8; // Increased logo width
        let logoHeight = radius * 0.6;
        const rmaLogoX = centerX - radius * 0.9;
        const rmaLogoY = centerY - logoHeight / 2;
        const awayLogoX = centerX + radius * 0.1;
        const awayLogoY = centerY - logoHeight / 2;

        ctx.drawImage(rmaLogo, rmaLogoX, rmaLogoY, logoWidth, logoHeight);
        ctx.drawImage(awayLogo, awayLogoX, awayLogoY, logoWidth, logoHeight);

        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - logoHeight);
        ctx.lineTo(centerX, centerY + logoHeight);
        ctx.strokeStyle = 'grey'; // Line color
        ctx.lineWidth = 1; // Line width
        ctx.stroke();
        ctx.closePath();
      }
    };

    rmaLogo.onload = () => {
      checkImagesLoaded();
    };

    awayLogo.onload = () => {
      checkImagesLoaded();
    };

    // Add labels
    // ctx.fillStyle = '#000';
    // ctx.font = '12px Arial';
    // ctx.textAlign = 'center';
    // ctx.fillText(`${this.rmaShotsOnGoal}%`, centerX - radius * 0.2, centerY);
    // ctx.fillText(`${this.awayShotsOnGoal}%`, centerX + radius * 0.2, centerY);
  }






  getPercentage(value1: string | number, value2: string | number, team: 'team1' | 'team2'): string | number {
    const val1 = typeof value1 === 'string' ? parseInt(value1) : value1 || 0;
    const val2 = typeof value2 === 'string' ? parseInt(value2) : value2 || 0;
    const total = val1 + val2;

    if (total === 0) return 0;

    if (team === 'team1') {
      return ((val1 / total) * 100).toFixed(2);
    } else {
      return ((val2 / total) * 100).toFixed(2);
    }

    // const team1Percentage = team === 'team1' ? Math.round((val1 / total) * 100) : 0;
    // const team2Percentage = team === 'team2' ? Math.round((val2 / total) * 100) : 0;

    // // Adjust for rounding
    //const adjusted = this.adjustPercentages(team1Percentage, team2Percentage);


    //return (((val1 / val2) * 100) / 2).toFixed(1);
  }

  // Helper method to adjust percentages
  adjustPercentages(percent1: number, percent2: number) {
    const total = percent1 + percent2;

    if (total === 100) {
      return { team1: percent1, team2: percent2 };
    }

    if (total < 100) {
      const diff = 100 - total;
      if (percent1 >= percent2) {
        return { team1: percent1 + diff, team2: percent2 };
      } else {
        return { team1: percent1, team2: percent2 + diff };
      }
    } else {
      const diff = total - 100;
      if (percent1 >= percent2) {
        return { team1: percent1 - diff, team2: percent2 };
      } else {
        return { team1: percent1, team2: percent2 - diff };
      }
    }
  }



}

export class LeagueMatchResultInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  activityCode: string;
  leaguefixtureId: string;
}
export class PublishLeagueResultForActivitiesInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  activityCode: string;
  leaguefixtureId: string;
  isDrawn: boolean;
  isHomeTeamWinner: boolean;
  isAwayTeamWinner: boolean;
  homeLeagueParticipationId?: string;
  awayLeagueParticipationId?: string;
  Football?: FootballResultModel
}

export class LeagueMatchParticipantInput {
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
  MatchId?: string;
  TeamId?: string;
  TeamId2?: string;
  leagueTeamPlayerStatusType?: number;
}





// Approach 1: Builder Pattern
// export class MatchResultBuilder {
//   private matchResult: Partial<MatchResultDto> = {};

//   setPOTM(potm: string): MatchResultBuilder {
//     this.matchResult.POTM = potm;
//     return this;
//   }

//   setTeam1Stats(stats: Partial<TeamStatsDto>): MatchResultBuilder {
//     this.matchResult.Team1 = { ...this.matchResult.Team1, ...stats };
//     return this;
//   }

//   setTeam2Stats(stats: Partial<TeamStatsDto>): MatchResultBuilder {
//     this.matchResult.Team2 = { ...this.matchResult.Team2, ...stats };
//     return this;
//   }

//   setWinningTeamStats(stats: Partial<SummaryStatsDto>): MatchResultBuilder {
//     this.matchResult.WinningTeam = { ...this.matchResult.WinningTeam, ...stats };
//     return this;
//   }

//   setLoosingTeamStats(stats: Partial<SummaryStatsDto>): MatchResultBuilder {
//     this.matchResult.LoosingTeam = { ...this.matchResult.LoosingTeam, ...stats };
//     return this;
//   }
// }

