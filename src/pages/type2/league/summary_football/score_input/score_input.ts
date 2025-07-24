import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';
import { AppType } from '../../../../../shared/constants/module.constants';
import { LeagueTeamPlayerStatusType } from '../../../../../shared/utility/enums';
import { SharedServices } from '../../../../services/sharedservice';
import { LeagueParticipationForMatchModel, LeagueMatchParticipantModel } from '../../models/league.model';
import { LeagueMatch } from '../../models/location.model';



@IonicPage()
@Component({
  selector: 'page-score_input',
  templateUrl: 'score_input.html',
  providers: [HttpService]
})
export class ScoreInputPage {
  isWinner: boolean;
  teamObj: LeagueParticipationForMatchModel;
  matchObj: LeagueMatch;
  leagueId: string;
  activityId: string;
  selectedPlayer: string[] = [];
  goalTime: number[] = [];
  goalDetails: any[] = [];
  score: number = 0;
  currentGoalIndex: number = -1;


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

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    public storage: Storage, private httpService: HttpService, public sharedservice: SharedServices,
    public commonService: CommonService, public alertCtrl: AlertController) {

    this.isWinner = this.navParams.get("ishome");
    this.matchObj = this.navParams.get("matchObj");
    this.leagueId = this.navParams.get("leagueId");
    this.activityId = this.navParams.get("activityId");
    this.teamObj = this.navParams.get("teamObj");
    this.score = this.navParams.get("score");
    this.leagueMatchParticipantInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.leagueMatchParticipantInput.memberId = this.sharedservice.getLoggedInId();
    this.leagueMatchParticipantInput.action_type = 0;
    this.leagueMatchParticipantInput.app_type = AppType.ADMIN_NEW;
    this.leagueMatchParticipantInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    this.leagueMatchParticipantInput.LeagueId = this.leagueId;
    this.leagueMatchParticipantInput.MatchId = this.matchObj.match_id;
    this.getLeagueMatchParticipant();

  }

  onPlayerSelect(index: number) {
    this.updateGoalDetails(index);
  }

  onGoalTimeChange(index: number) {
    this.updateGoalDetails(index);
  }


  getNumberArray(count: number): any[] {
    return Array(count).fill(0);
  }

  updateGoalDetails(index: number) {
    const selectedPlayerId = this.selectedPlayer[index];
    const goalTime = this.goalTime[index];

    if (selectedPlayerId && goalTime) {
      const selectedPlayerObj = this.leagueMatchParticipantRes.find(player => player.user.Id === selectedPlayerId);

      const newGoal = {
        playerId: selectedPlayerId,
        playerObj: selectedPlayerObj,
        time: goalTime,
        index: index
      };

      // Check if a goal with the same index already exists
      const existingGoalIndex = this.goalDetails.findIndex(goal => goal.index === index);

      if (existingGoalIndex > -1) {
        // Replace the existing goal
        this.goalDetails[existingGoalIndex] = newGoal;
      } else {
        // Add the new goal
        this.goalDetails.push(newGoal);
      }
    } else {
      // If either player or time is missing, remove the goal from the array
      const existingGoalIndex = this.goalDetails.findIndex(goal => goal.index === index);
      if (existingGoalIndex > -1) {
        this.goalDetails.splice(existingGoalIndex, 1);
      }
    }

    console.log('Goal Details:', this.goalDetails);
  }

  saveGoal() {
    //selected player refers to player id of selected player
    let hasErrors = false;
    for (let i = 0; i < this.score; i++) {
      if (!this.selectedPlayer[i] || !this.goalTime[i]) {
        this.commonService.toastMessage(`Please select a player and enter the goal time for Goal ${i + 1}.`, 3000, ToastMessageType.Info);
        hasErrors = true;
        break; // Exit the loop as soon as an error is found
      }
    }

    if (!hasErrors) {
      this.viewCtrl.dismiss({ goalDetails: this.goalDetails, isWinner: this.isWinner });
    }
  }
  dismiss() {
    this.viewCtrl.dismiss({ goalDetails: [], isWinner: this.isWinner });
  }

  getLeagueMatchParticipant() {
    this.commonService.showLoader("Fetching info ...");
    this.leagueMatchParticipantInput.TeamId = this.teamObj.parentclubteam.id;
    this.leagueMatchParticipantInput.leagueTeamPlayerStatusType = LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH;
    this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueMatchParticipantInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.leagueMatchParticipantRes = res.data || [];
        console.log("Get_League_Match_Participant", JSON.stringify(res.data));
      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
  }

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