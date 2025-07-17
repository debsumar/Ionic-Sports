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
import {
  CricketSectionModel,
  FootballResultModel,
  FootballScoreDetailModel,
  FootballSectionModel,
  TennisSectionModel,
  LeagueResultModel,
  LeagueMatchResultInput,
  PublishLeagueResultForActivitiesInput,
  LeagueMatchParticipantInput,
  POTMDetailModel
} from '../../../../shared/model/league_result.model';

@IonicPage()
@Component({
  selector: 'page-summary_football',
  templateUrl: 'summary_football.html',
  providers: [HttpService]
})
export class SummaryFootballPage implements AfterViewInit {
  @ViewChild('doughnutCanvas', { read: ElementRef }) doughnutCanvas: ElementRef;

  // Component properties
  homeScore: string = '0';
  awayScore: string = '0';
  potmList: any;
  matchObj: LeagueMatch;
  leagueId: string;
  activityId: string;
  activityCode: number;
  homeTeamObj: LeagueParticipationForMatchModel;
  awayTeamObj: LeagueParticipationForMatchModel;
  selectedPlayersPotm: LeagueMatchParticipantModel[] = [];
  selectedPlayerhomeScorers: SelectedPlayerScorersModel[] = [];
  selectedPlayersawayScorers: SelectedPlayerScorersModel[] = [];
  selectedPOTMs: any[] = [];
  potmDisabled: boolean = false;
  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
  getLeagueMatchResultRes: LeagueResultModel | null = null;
  publishLeagueResultForActivitiesRes: any;
  // result_json: FootballResultModel = {};
  result_json: FootballResultModel = {
    POTM: [],
    POTM_PLAYERS: '',
    Team1: {
      GOAL: '0',
      SHOTS: '0',
      SHOTS_ON_GOAL: '0',
      CORNERS: '0',
      FOULS_COMMITTED: '0',
      OFFSIDES: '0',
      BALL_POSSESSION: '0.00',
      YELLOW_CARD: '0',
      RED_CARD: '0',
      SCORE: []
    },
    Team2: {
      GOAL: '0',
      SHOTS: '0',
      SHOTS_ON_GOAL: '0',
      CORNERS: '0',
      FOULS_COMMITTED: '0',
      OFFSIDES: '0',
      BALL_POSSESSION: '0.00',
      YELLOW_CARD: '0',
      RED_CARD: '0',
      SCORE: []
    }
  };
  ishome: boolean = true;
  selectedTab: string = 'Stats';
  homePoss: string = '0.00';
  awayPoss: string = '0.00';
  rmaShotAttempts: string = '0.0';
  awayShotAttempts: string = '0.0';
  rmaFouls: string = '0.0';
  awayFouls: string = '0.0';
  isResultPopupVisible: boolean = false;

  // API Input Objects
  leagueMatchParticipantInput: LeagueMatchParticipantInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    LeagueId: '',
    MatchId: '',
    TeamId: '',
    TeamId2: '',
    leagueTeamPlayerStatusType: 0
  };

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
    created_by: '',
    MatchId: ''
  };

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
    created_by: '',
    activityCode: '',
    leaguefixtureId: '',
    isDrawn: false,
    isHomeTeamWinner: false,
    isAwayTeamWinner: false,
    homeLeagueParticipationId: '',
    awayLeagueParticipationId: '',
    Football: {
      result_description: '',
      result_dets: '',
      POTM: [],
      Team1: {
        GOAL: '0',
        SHOTS: '0',
        SHOTS_ON_GOAL: '0',
        CORNERS: '0',
        FOULS_COMMITTED: '0',
        OFFSIDES: '0',
        BALL_POSSESSION: '0.00',
        YELLOW_CARD: '0',
        RED_CARD: '0',
        SCORE: []
      },
      Team2: {
        GOAL: '0',
        SHOTS: '0',
        SHOTS_ON_GOAL: '0',
        CORNERS: '0',
        FOULS_COMMITTED: '0',
        OFFSIDES: '0',
        BALL_POSSESSION: '0.00',
        YELLOW_CARD: '0',
        RED_CARD: '0',
        SCORE: []
      }
    }
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public commonService: CommonService,
    public alertCtrl: AlertController,
    private httpService: HttpService,
    public sharedservice: SharedServices,
    public modalCtrl: ModalController
  ) {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    try {
      // Get navigation parameters
      this.matchObj = this.navParams.get("match");
      this.leagueId = this.navParams.get("leagueId");
      this.activityId = this.navParams.get("activityId");
      this.activityCode = this.navParams.get("activityCode");
      this.homeTeamObj = this.navParams.get("homeTeam");
      this.awayTeamObj = this.navParams.get("awayTeam");
      console.log("ACTIVITY CODE:", this.activityCode);

      // Initialize API inputs
      this.initializeApiInputs();

      // Load data
      this.getLeagueMatchParticipant();
      this.getLeagueMatchResult();

    } catch (error) {
      console.error("Error initializing component:", error);
      this.commonService.toastMessage("Error initializing page", 3000, ToastMessageType.Error);
    }
  }

  private initializeApiInputs(): void {
    const baseInput = this.createBaseApiInput();

    // Initialize league match participant input
    this.leagueMatchParticipantInput = {
      ...baseInput,
      LeagueId: this.leagueId,
      MatchId: this.matchObj.match_id,
      TeamId: this.homeTeamObj.parentclubteam.id || '',
      TeamId2: this.awayTeamObj.parentclubteam.id || '',
      leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH
    };

    // Initialize league match result input
    this.leagueMatchResultInput = {
      ...baseInput,
      MatchId: this.matchObj.match_id
    };

    // Initialize publish league result input
    this.publishLeagueResultForActivitiesInput = {
      ...baseInput,
      activityCode: this.activityCode.toString() || '',
      leaguefixtureId: this.matchObj.fixture_id || '',
      homeLeagueParticipationId: this.homeTeamObj.id || '',
      awayLeagueParticipationId: this.awayTeamObj.id || '',
      isDrawn: false,
      isHomeTeamWinner: false,
      isAwayTeamWinner: false,
      Football: {
        result_description: '',
        result_dets: '',
        POTM: [],
        Team1: {
          GOAL: '0',
          SHOTS: '0',
          SHOTS_ON_GOAL: '0',
          CORNERS: '0',
          FOULS_COMMITTED: '0',
          OFFSIDES: '0',
          BALL_POSSESSION: '0.00',
          YELLOW_CARD: '0',
          RED_CARD: '0',
          SCORE: []
        },
        Team2: {
          GOAL: '0',
          SHOTS: '0',
          SHOTS_ON_GOAL: '0',
          CORNERS: '0',
          FOULS_COMMITTED: '0',
          OFFSIDES: '0',
          BALL_POSSESSION: '0.00',
          YELLOW_CARD: '0',
          RED_CARD: '0',
          SCORE: []
        }
      }
    };
  }

  private createBaseApiInput(): any {
    return {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      activityId: this.activityId || '',
      memberId: this.sharedservice.getLoggedInId() || '',
      action_type: 0,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: '',
      created_by: ''
    };
  }

  // Add a new getter for display purposes (returns string)
  get potmDisplayString(): string {
    if (!this.result_json) {
      return '';
    }

    let names: string[] = [];

    if (this.selectedPlayersPotm.length && this.selectedPlayersPotm[0].user) {
      names = this.selectedPlayersPotm
        .map(s => `${s.user.FirstName || ''} ${s.user.LastName || ''}`.trim())
        .filter(name => name.length > 0);
      return names.join(', ');
    } else {
      return this.result_json.POTM_PLAYERS || '';
    }
  }

  get potmDisplayNames(): POTMDetailModel[] {
    if (!this.result_json || !this.getLeagueMatchResultRes) {
      return [];
    }
    let potm: POTMDetailModel[] = [];

    if (this.selectedPlayersPotm.length && this.selectedPlayersPotm[0].user) {
      potm = this.selectedPlayersPotm
        .map(s => ({
          PLAYER: `${s.user.FirstName} ${s.user.LastName}`.trim(),
          PLAYER_ID: s.user.Id,
          TEAM: s.Team.teamName,
          TEAM_ID: s.Team.id
        }))
        .filter(p => p.PLAYER.length > 0);

      this.result_json.POTM_PLAYERS = potm.map(p => p.PLAYER).join(', ');
      return potm; // ✅ Return the new data
    }

    // Return existing data if no new selections
    return this.result_json.POTM.map(p => ({
      PLAYER: p.PLAYER || '',
      PLAYER_ID: p.PLAYER_ID || '',
      TEAM: p.TEAM || '',
      TEAM_ID: p.TEAM_ID || ''
    })) || [];
  }


  get scorerObjectsHome(): FootballScoreDetailModel[] {
    if (!this.result_json || !this.getLeagueMatchResultRes) {
      return [];
    }

    if (this.selectedPlayerhomeScorers.length > 0) {
      return this.selectedPlayerhomeScorers
        .map(s => ({
          PLAYER: `${s.playerObj.user.FirstName} ${s.playerObj.user.LastName}`.trim(),
          PLAYER_ID: s.playerObj.user.Id,
          TIME: s.time
        }))
        .filter(scorer => scorer.PLAYER.length > 0);
    }

    return this.result_json.Team1.SCORE.map(scorer => ({
      PLAYER: scorer.PLAYER,
      PLAYER_ID: scorer.PLAYER_ID,
      TIME: scorer.TIME
    })) || [];
  }

  get scorerObjectsAway(): FootballScoreDetailModel[] {
    if (!this.result_json || !this.getLeagueMatchResultRes) {
      return [];
    }

    if (this.selectedPlayersawayScorers.length > 0) {
      return this.selectedPlayersawayScorers
        .map(s => ({
          PLAYER: `${s.playerObj.user.FirstName || ''} ${s.playerObj.user.LastName || ''}`.trim(),
          PLAYER_ID: s.playerObj.user.Id || s.playerId || '',
          TIME: s.time || ''
        }))
        .filter(scorer => scorer.PLAYER.length > 0);
    }

    return this.result_json.Team2.SCORE.map(scorer => ({
      PLAYER: scorer.PLAYER || '',
      PLAYER_ID: scorer.PLAYER_ID || '',
      TIME: scorer.TIME || ''
    })) || [];
  }

  // API Methods
  getLeagueMatchResult(): void {
    this.httpService.post(`${API.Get_League_Match_Result}`, this.leagueMatchResultInput).subscribe(
      (res: any) => {
        try {
          if (res.data) {
            this.getLeagueMatchResultRes = res.data;
            console.log("Get_League_Match_Result RESPONSE", res.data);
            this.processLeagueMatchResult(this.getLeagueMatchResultRes.result_json);
          } else {
            console.log("No data received from getLeagueMatchResult");
            this.initializeDefaultValues();
          }
        } catch (error) {
          console.error("Error processing league match result:", error);
          this.initializeDefaultValues();
        }
      },
      (error) => {
        console.error("Error fetching league match result:", error);
        this.commonService.toastMessage("Error fetching match result", 3000, ToastMessageType.Error);
        this.initializeDefaultValues();
      }
    );
  }

  private processLeagueMatchResult(rawResultJson: any): void {
    if (typeof rawResultJson === 'string') {
      try {
        this.result_json = JSON.parse(rawResultJson) as FootballResultModel;
        console.log("Decoded result_json (parsed):", this.result_json);
      } catch (err) {
        console.error('Failed to parse result_json:', err, rawResultJson);
        this.result_json = {};
      }
    } else if (typeof rawResultJson === 'object' && rawResultJson !== null) {
      this.result_json = rawResultJson as FootballResultModel;
      console.log("Decoded result_json (object):", this.result_json);
    } else {
      console.warn('result_json is neither string nor object:', rawResultJson);
      this.result_json = {};
    }
    // Validate that the result_json has the required structure
    if (!this.result_json.Team1 || !this.result_json.Team2) {
      console.warn('result_json missing Team1 or Team2, initializing defaults');
      this.initializeDefaultValues();
      return;
    }

    // Update component properties from result_json
    this.updateComponentFromResultJson();
  }

  private updateComponentFromResultJson(): void {
    if (this.result_json) {
      this.homeScore = this.result_json.Team1.GOAL.toString();
      this.awayScore = this.result_json.Team2.GOAL.toString();
      this.homePoss = this.result_json.Team1.BALL_POSSESSION;
      this.awayPoss = this.result_json.Team2.BALL_POSSESSION;
    }
  }

  private initializeDefaultValues(): void {
    this.result_json = {};
    this.homeScore = '0';
    this.awayScore = '0';
    this.homePoss = '0.00';
    this.awayPoss = '0.00';
  }

  PublishLeagueResult(result_input: Partial<PublishLeagueResultForActivitiesInput>): void {
    this.httpService.post(`${API.Publish_League_Result_For_Activities}`, result_input).subscribe(
      (res: any) => {
        if (res.data) {
          console.log("Publish_League_Result RESPONSE", res.data);
          this.commonService.toastMessage("Result published successfully", 2500, ToastMessageType.Success);
          if (this.isResultPopupVisible) this.isResultPopupVisible = false;
          this.getLeagueMatchResult();
        } else {
          console.log("No data received from PublishLeagueResult");
        }
      },
      (error) => {
        console.error("Error publishing league result:", error);
        this.commonService.toastMessage("Error publishing result", 3000, ToastMessageType.Error);
      }
    );
  }

  publishLeagueResultForActivities(): void {
    try {
      // Update Football section with current data
      if (this.publishLeagueResultForActivitiesInput.Football) {
        this.publishLeagueResultForActivitiesInput.Football.Team1!.SCORE = this.scorerObjectsHome;
        this.publishLeagueResultForActivitiesInput.Football.Team2!.SCORE = this.scorerObjectsAway;
        this.publishLeagueResultForActivitiesInput.Football.Team1!.BALL_POSSESSION = this.homePoss;
        this.publishLeagueResultForActivitiesInput.Football.Team2!.BALL_POSSESSION = this.awayPoss;
      }

      this.httpService.post(`${API.Publish_League_Result_For_Activities}`, this.publishLeagueResultForActivitiesInput).subscribe(
        (res: any) => {
          if (res.data) {
            this.publishLeagueResultForActivitiesRes = res.data;
            console.log("Publish_League_Result_For_Activities RESPONSE", res.data);
            this.getLeagueMatchResult();
          } else {
            console.log("No data received from publishLeagueResultForActivities");
          }
        },
        (error) => {
          console.error("Error in publishLeagueResultForActivities:", error);
          this.commonService.toastMessage("Error publishing activities result", 3000, ToastMessageType.Error);
        }
      );
    } catch (error) {
      console.error("Error preparing data for publishLeagueResultForActivities:", error);
    }
  }

  getLeagueMatchParticipant(): void {
    if (!this.leagueMatchParticipantInput.TeamId || !this.leagueMatchParticipantInput.TeamId2) {
      console.error("TeamId and TeamId2 are required for getLeagueMatchParticipant");
      return;
    }

    this.commonService.showLoader("Fetching participants...");

    this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueMatchParticipantInput).subscribe(
      (res: any) => {
        this.commonService.hideLoader();
        if (res.data) {
          this.leagueMatchParticipantRes = res.data || [];
          console.log("Get_League_Match_Participant RESPONSE", JSON.stringify(res.data));
        } else {
          console.log("No participants data received");
          this.leagueMatchParticipantRes = [];
        }
      },
      (error) => {
        this.commonService.hideLoader();
        console.error("Error fetching league match participants:", error);
        this.commonService.toastMessage("Error fetching participants", 3000, ToastMessageType.Error);
        this.leagueMatchParticipantRes = [];
      }
    );
  }

  async updateMatchStats() {
    const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
      ...this.createBaseResultInput(),
      Football: {
        Team1: {
          GOAL: (this.result_json.Team1.GOAL || 0).toString(),
          SHOTS_ON_GOAL: (this.result_json.Team1.SHOTS_ON_GOAL || 0).toString(),
          CORNERS: (this.result_json.Team1.CORNERS || 0).toString(),
          FOULS_COMMITTED: (this.result_json.Team1.FOULS_COMMITTED || 0).toString(),
          OFFSIDES: (this.result_json.Team1.OFFSIDES || 0).toString(),
          BALL_POSSESSION: this.homePoss || '0.00',
          YELLOW_CARD: (this.result_json.Team1.YELLOW_CARD || 0).toString(),
          RED_CARD: (this.result_json.Team1.RED_CARD || 0).toString(),
          SHOTS: (this.result_json.Team1.SHOTS.toString() || 0).toString(),
        },
        Team2: {
          GOAL: (this.result_json.Team2.GOAL || 0).toString(),
          SHOTS_ON_GOAL: (this.result_json.Team2.SHOTS_ON_GOAL || 0).toString(),
          CORNERS: (this.result_json.Team2.CORNERS || 0).toString(),
          FOULS_COMMITTED: (this.result_json.Team2.FOULS_COMMITTED || 0).toString(),
          OFFSIDES: (this.result_json.Team2.OFFSIDES || 0).toString(),
          BALL_POSSESSION: this.awayPoss || '0.00',
          YELLOW_CARD: (this.result_json.Team2.YELLOW_CARD || 0).toString(),
          RED_CARD: (this.result_json.Team2.RED_CARD || 0).toString(),
          SHOTS: (this.result_json.Team2.SHOTS.toString() || 0).toString()
        }
      }
    };
    this.PublishLeagueResult(result_input);
  }

  private saveMatchStats(data: any): void {
    try {
      // Validate possession percentages
      const homePoss = parseFloat(data.homePoss) || 0;
      const awayPoss = parseFloat(data.awayPoss) || 0;

      if (homePoss + awayPoss !== 100) {
        this.commonService.toastMessage("Possession percentages must total 100%", 3000, ToastMessageType.Info);
        return;
      }

      // Update local properties
      this.homePoss = data.homePoss;
      this.awayPoss = data.awayPoss;

      // Prepare result input for API
      const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
        ...this.createBaseResultInput(),
        Football: {
          Team1: {
            BALL_POSSESSION: data.homePoss,
            SHOTS_ON_GOAL: data.shotsOnGoalHome.toString(),
            SHOTS: data.shotAttemptsHome.toString(),
            FOULS_COMMITTED: data.foulsHome.toString(),
            OFFSIDES: data.offsideHome.toString(),
            YELLOW_CARD: data.yellowCardHome.toString(),
            RED_CARD: data.redCardHome.toString()
          },
          Team2: {
            BALL_POSSESSION: data.awayPoss,
            SHOTS_ON_GOAL: data.shotsOnGoalAway.toString(),
            SHOTS: data.shotAttemptsAway.toString(),
            FOULS_COMMITTED: data.foulsAway.toString(),
            OFFSIDES: data.offsideAway.toString(),
            YELLOW_CARD: data.yellowCardAway.toString(),
            RED_CARD: data.redCardAway.toString()
          }
        }
      };

      this.PublishLeagueResult(result_input);
      console.log('Match stats updated', data);
      this.drawDoughnutChart();
    } catch (error) {
      console.error("Error saving match stats:", error);
      this.commonService.toastMessage("Error saving stats", 3000, ToastMessageType.Error);
    }
  }

  async gotoScoreInputPage(ishome: boolean): Promise<void> {
    const score = ishome ? this.homeScore : this.awayScore;
    const teamObj = ishome ? this.homeTeamObj : this.awayTeamObj;

    if (!score || parseInt(score) <= 0) {
      this.commonService.toastMessage("Please set the score first", 3000, ToastMessageType.Info);
      return;
    }

    const modal = this.modalCtrl.create("ScoreInputPage", {
      "matchObj": this.matchObj,
      "leagueId": this.leagueId,
      "activityId": this.activityId,
      "teamObj": teamObj,
      "score": parseInt(score),
      "ishome": ishome,
    });

    modal.onDidDismiss(data => {
      console.log('ScoreInputPage modal dismissed');
      if (data.goalDetails) {
        this.handleScoreInputResult(data.goalDetails, ishome);
      } else {
        console.log('No goal details received from modal');
      }
    });

    modal.present();
  }

  private handleScoreInputResult(goalDetails: any[], ishome: boolean): void {
    try {
      const scoreData = goalDetails.map((goal: any) => ({
        PLAYER: `${goal.playerObj.user.FirstName || ''} ${goal.playerObj.user.LastName || ''}`.trim(),
        PLAYER_ID: goal.playerObj.user.Id || goal.playerObj.memberId || '',
        TIME: goal.time || ''
      })).filter(goal => goal.PLAYER.length > 0);

      const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
        ...this.createBaseResultInput(),
        Football: ishome ? {
          Team1: { SCORE: scoreData }
        } : {
          Team2: { SCORE: scoreData }
        }
      };

      this.PublishLeagueResult(result_input);
      console.log("Received Scorers:", scoreData);
    } catch (error) {
      console.error("Error handling score input result:", error);
      this.commonService.toastMessage("Error processing goal details", 3000, ToastMessageType.Error);
    }
  }

  private createBaseResultInput(): Partial<PublishLeagueResultForActivitiesInput> {
    return {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      memberId: this.sharedservice.getLoggedInId() || '',
      action_type: 0,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: this.sharedservice.getLoggedInId() || '',
      created_by: this.sharedservice.getLoggedInId() || '',
      activityId: this.activityId || '',
      activityCode: this.activityCode.toString() || '',
      leaguefixtureId: this.matchObj.fixture_id || '',
    };
  }

  async gotoResultInputPage(): Promise<void> {
    console.log("Going to result input page");

    const modal = this.modalCtrl.create("ResultInputPage", {
      "matchObj": this.matchObj,
      "leagueId": this.leagueId,
      "activityId": this.activityId,
      "homeTeamObj": this.homeTeamObj,
      "awayTeamObj": this.awayTeamObj,
      "resultId": this.getLeagueMatchResultRes.Id,
    });

    modal.onDidDismiss(data => {
      console.log('ResultInputPage modal dismissed');
      if (data && this.isValidResultData(data)) {
        this.handleResultInputData(data);
      } else {
        console.log('Invalid or no data received from result input modal');
      }
    });

    modal.present();
  }

  private isValidResultData(data: any): boolean {
    return data &&
      data.homeTeamGoals !== undefined &&
      data.awayTeamGoals !== undefined &&
      parseInt(data.homeTeamGoals) >= 0 &&
      parseInt(data.awayTeamGoals) >= 0;
  }

  private handleResultInputData(data: any): void {
    try {
      console.log("Received data from result input page:", data);

      const homeGoals = parseInt(data.homeTeamGoals);
      const awayGoals = parseInt(data.awayTeamGoals);

      this.homeScore = homeGoals.toString();
      this.awayScore = awayGoals.toString();

      const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
        ...this.createBaseResultInput(),
        isHomeTeamWinner: homeGoals > awayGoals,
        isAwayTeamWinner: awayGoals > homeGoals,
        isDrawn: homeGoals === awayGoals,
        Football: {
          Team1: { GOAL: homeGoals.toString() },
          Team2: { GOAL: awayGoals.toString() }
        }
      };

      this.PublishLeagueResult(result_input);
    } catch (error) {
      console.error("Error handling result input data:", error);
      this.commonService.toastMessage("Error processing result data", 3000, ToastMessageType.Error);
    }
  }

  async gotoPotmPage(): Promise<void> {
    console.log("Going to POTM page");

    const modal = this.modalCtrl.create("PotmPage", {
      "matchObj": this.matchObj,
      "leagueId": this.leagueId,
      "activityId": this.activityId,
      "homeTeamObj": this.homeTeamObj,
      "awayTeamObj": this.awayTeamObj,
    });

    modal.onDidDismiss(data => {
      console.log('PotmPage modal dismissed');
      if (data && Array.isArray(data)) {
        this.selectedPlayersPotm = data;
        console.log("Received selected POTM players:", this.selectedPlayersPotm);

        const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
          ...this.createBaseResultInput(),
          Football: {
            POTM: this.potmDisplayNames,
            POTM_PLAYERS: this.potmDisplayString
          }
        };

        this.PublishLeagueResult(result_input);
      } else {
        console.log('No valid POTM data received from modal');
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

  // Utility Methods
  getPercentage(value1: string, value2: string, team: 'team1' | 'team2'): string {
    const val1 = parseInt(value1) || 0;
    const val2 = parseInt(value2) || 0;
    const total = val1 + val2;

    if (total === 0) return '0';

    const percentage = team === 'team1'
      ? (val1 / total) * 100
      : (val2 / total) * 100;

    return percentage.toFixed(2);
  }

  // Helper method to adjust percentages
  // adjustPercentages(percent1: number, percent2: number) {
  //   const total = percent1 + percent2;

  //   if (total === 100) {
  //     return { team1: percent1, team2: percent2 };
  //   }

  //   if (total < 100) {
  //     const diff = 100 - total;
  //     if (percent1 >= percent2) {
  //       return { team1: percent1 + diff, team2: percent2 };
  //     } else {
  //       return { team1: percent1, team2: percent2 + diff };
  //     }
  //   } else {
  //     const diff = total - 100;
  //     if (percent1 >= percent2) {
  //       return { team1: percent1 - diff, team2: percent2 };
  //     } else {
  //       return { team1: percent1, team2: percent2 - diff };
  //     }
  //   }
  // }
  //  get safeResultJson(): FootballResultModel {
  //   if (!this.result_json || !this.result_json.Team1 || !this.result_json.Team2) {
  //     return {
  //       POTM: [],
  //       POTM_PLAYERS: '',
  //       Team1: {
  //         GOAL: '0',
  //         SHOTS: '0',
  //         SHOTS_ON_GOAL: '0',
  //         CORNERS: '0',
  //         FOULS_COMMITTED: '0',
  //         OFFSIDES: '0',
  //         BALL_POSSESSION: '0.00',
  //         YELLOW_CARD: '0',
  //         RED_CARD: '0',
  //         SCORE: []
  //       },
  //       Team2: {
  //         GOAL: '0',
  //         SHOTS: '0',
  //         SHOTS_ON_GOAL: '0',
  //         CORNERS: '0',
  //         FOULS_COMMITTED: '0',
  //         OFFSIDES: '0',
  //         BALL_POSSESSION: '0.00',
  //         YELLOW_CARD: '0',
  //         RED_CARD: '0',
  //         SCORE: []
  //       }
  //     };
  //   }
  //   return this.result_json;
  // }

}