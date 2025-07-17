import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LeagueMatch } from '../models/location.model';
import { LeagueMatchParticipantModel, LeagueParticipationForMatchModel } from '../models/league.model';
import { LeagueTeamPlayerStatusType } from '../../../../shared/utility/enums';
import { API } from '../../../../shared/constants/api_constants';
import { HttpService } from '../../../../services/http.service';
import { SharedServices } from '../../../services/sharedservice';
import { AppType } from '../../../../shared/constants/module.constants';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-result_input',
  templateUrl: 'result_input.html',
  providers: [HttpService]
})
export class ResultInputPage {
  updateResultEntityInput: UpdateResultEntityInput = {
    resultId: '',
    ResultDetails: '',
    resultDescription: '',
    ResultStatus: 0,
    PublishedByApp: '',
    winner_league_participation_id: '',
    loser_league_participation_id: ''
  }
  homeTeamObj: LeagueParticipationForMatchModel;
  awayTeamObj: LeagueParticipationForMatchModel;
  matchObj: LeagueMatch;
  resultId: string;
  leagueId: string;
  activityId: string;
  selectedPlayer: string[] = [];
  goalTime: number[] = [];
  goalDetails: any[] = [];
  score: number = 0;
  currentGoalIndex: number = -1;


  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
  resultType: string = ''; // 🏆 Holds the selected result type
  RESULT_TYPE_OPTIONS: { label: string; value: string }[] = [
    { label: 'Drawn', value: 'drawn' },
    { label: 'Winner', value: 'winner' }
  ];

  selectedWinnerTeamId: string = ''; // 🏆 Holds the selected team
  TEAMS: LeagueParticipationForMatchModel[] = [];

  homeTeamGoals: number;
  awayTeamGoals: number;


  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    public storage: Storage, private httpService: HttpService, public sharedservice: SharedServices,
    public commonService: CommonService, public alertCtrl: AlertController) {


    this.matchObj = this.navParams.get("matchObj");
    this.leagueId = this.navParams.get("leagueId");
    this.activityId = this.navParams.get("activityId");
    this.homeTeamObj = this.navParams.get("homeTeamObj");
    this.awayTeamObj = this.navParams.get("awayTeamObj");
    this.resultId = this.navParams.get("resultId");
    this.TEAMS = [this.homeTeamObj, this.awayTeamObj];
    this.score = this.navParams.get("score");
    this.updateResultEntityInput.resultId = this.resultId;
    this.updateResultEntityInput.resultDescription = '';//will add later
    this.updateResultEntityInput.PublishedByApp = AppType.ADMIN_NEW.toString();
  }

  onWinnerTeamChange() {

    // const selectedTeam = this.TEAMS.find(team => team.parentclubteam.id === this.selectedWinnerTeamId);
    // console.log("Selected Team:", selectedTeam);
    try {
      this.updateResultEntity();
    } catch (err) {
      console.error('⚠️ Error updating result entity on winner team change:', err);
    }
  }

  updateResultEntity() {
    this.commonService.showLoader("Updating...");
    this.updateResultEntityInput.winner_league_participation_id = this.TEAMS.find(team => team.parentclubteam.id === this.selectedWinnerTeamId).id;
    this.updateResultEntityInput.loser_league_participation_id = this.TEAMS.find(team => team.id !== this.selectedWinnerTeamId).id;
    this.httpService.post(`${API.UPDATE_RESULT_ENTITY}`, this.updateResultEntityInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        console.log("Update_League_Fixture RESPONSE", JSON.stringify(res));
        this.commonService.toastMessage(res.message, 3000, ToastMessageType.Success);
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



  saveGoal() {
    // 🏆 Validate result type selection
    if (!this.resultType) {
      this.commonService.toastMessage('Please select a result type.', 3000, ToastMessageType.Info);
      return;
    }

    // 🏟️ Validate home and away goals
    if (
      this.homeTeamGoals === undefined ||
      this.awayTeamGoals === undefined ||
      isNaN(this.homeTeamGoals) ||
      isNaN(this.awayTeamGoals)
    ) {
      this.commonService.toastMessage('Please enter valid numbers for both team goals.', 3000, ToastMessageType.Info);
      return;
    }

    // 🤝 Handle different result types
    if (this.resultType === 'winner') {
      // Validate winner selection for 'winner' result type
      if (!this.selectedWinnerTeamId) {
        this.commonService.toastMessage('Please select a winner team.', 3000, ToastMessageType.Info);
        return;
      }

      // 🏆 Find winner and loser teams based on selectedWinnerTeamId
      const winnerTeam = this.TEAMS.find(team => team.parentclubteam.id === this.selectedWinnerTeamId);
      const loserTeam = this.TEAMS.find(team => team.parentclubteam.id !== this.selectedWinnerTeamId);

      // 🏟️ Assign goals based on which team is the winner
      let winnerTeamGoals = 0;
      let loserTeamGoals = 0;

      if (winnerTeam.id === this.homeTeamObj.id) {
        winnerTeamGoals = this.homeTeamGoals;
        loserTeamGoals = this.awayTeamGoals;
      } else if (winnerTeam.id === this.awayTeamObj.id) {
        winnerTeamGoals = this.awayTeamGoals;
        loserTeamGoals = this.homeTeamGoals;
      }

      // 🟢 Dismiss modal with winner result data
      this.viewCtrl.dismiss({
        winnerTeam: winnerTeam,
        loserTeam: loserTeam,
        isDrawn: false,
        homeTeamGoals: this.homeTeamGoals.toString(),
        awayTeamGoals: this.awayTeamGoals.toString(),
        winnerTeamGoals: winnerTeamGoals.toString(),
        loserTeamGoals: loserTeamGoals.toString(),
      });
    } else if (this.resultType === 'drawn') {
      // 🤝 For drawn matches, no winner/loser teams
      this.viewCtrl.dismiss({
        winnerTeam: null,
        loserTeam: null,
        isDrawn: true,
        homeTeamGoals: this.homeTeamGoals.toString(),
        awayTeamGoals: this.awayTeamGoals.toString(),
        winnerTeamGoals: null,
        loserTeamGoals: null,
      });
    }
  }
  dismiss() {
    this.viewCtrl.dismiss({
      winnerTeam: {},
      loserTeam: {},
      winnerTeamGoals: 0,
      loserTeamGoals: 0,
    });
  }
}
export class UpdateResultEntityInput {
  resultId: string;
  ResultDetails: string;
  resultDescription: string;
  ResultStatus: number;
  PublishedByApp: string;
  winner_league_participation_id: string;
  loser_league_participation_id: string;
}
