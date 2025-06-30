import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LeagueMatchParticipantModel, LeagueParticipationForMatchModel } from '../models/league.model';
import { LeagueMatch } from '../models/location.model';
import { LeagueTeamPlayerStatusType } from '../../../../shared/utility/enums';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { SharedServices } from '../../../services/sharedservice';

@IonicPage()
@Component({
  selector: 'page-potm',
  templateUrl: 'potm.html',
  providers: [HttpService]
})
export class PotmPage {
  winnerTeamName: string = ''; // Replace with actual data
  loserTeamName: string = '';   // Replace with actual data
  selectedPlayers: LeagueMatchParticipantModel[] = [];
  winnerTeamObj: LeagueParticipationForMatchModel;
  loserTeamObj: LeagueParticipationForMatchModel;
  matchObj: LeagueMatch;
  leagueId: string;
  activityId: string;
  callback: any;

  leagueMatchParticipantResForWinner: LeagueMatchParticipantModel[] = [];
  leagueMatchParticipantResForLoser: LeagueMatchParticipantModel[] = [];
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

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public storage: Storage, public viewCtrl: ViewController,
    public commonService: CommonService, public alertCtrl: AlertController, private httpService: HttpService, public sharedservice: SharedServices,) {

    this.callback = this.navParams.get('callback');
    this.matchObj = this.navParams.get("matchObj");
    this.leagueId = this.navParams.get("leagueId");
    this.activityId = this.navParams.get("activityId");
    this.winnerTeamObj = this.navParams.get("homeTeamObj");
    this.loserTeamObj = this.navParams.get("awayTeamObj");

    this.winnerTeamName = this.winnerTeamObj && this.winnerTeamObj.parentclubteam ? this.winnerTeamObj.parentclubteam.teamName : 'Winner Team';
    this.loserTeamName = this.loserTeamObj && this.loserTeamObj.parentclubteam ? this.loserTeamObj.parentclubteam.teamName : 'Loser Team';
    console.log("Winner TEAM OBJ:", this.winnerTeamObj);
    this.leagueMatchParticipantInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.leagueMatchParticipantInput.memberId = this.sharedservice.getLoggedInId();
    this.leagueMatchParticipantInput.action_type = 0;
    this.leagueMatchParticipantInput.app_type = AppType.ADMIN_NEW;
    this.leagueMatchParticipantInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    this.leagueMatchParticipantInput.LeagueId = this.leagueId;
    if (this.matchObj) {
      this.leagueMatchParticipantInput.MatchId = this.matchObj.match_id;
      this.getLeagueMatchParticipant(true);
    }


  }


  togglePlayerSelection(player: LeagueMatchParticipantModel, isWinner: boolean) {
    const alreadySelected = this.selectedPlayers.some(p => p.user.Id === player.user.Id);

    if (alreadySelected) {
      // Unselect the player
      player.user.selected = false;
      this.selectedPlayers = this.selectedPlayers.filter(p => p.user.Id !== player.user.Id);
    } else {
      if (this.selectedPlayers.length >= 2) {
        this.commonService.toastMessage('You can select a maximum of 2 players', 3000, ToastMessageType.Info);
        return;
      }

      // Select the player
      player.user.selected = true;
      this.selectedPlayers.push(player);
    }

    console.log('Selected Players:', this.selectedPlayers.map(p => p.user.FirstName));
  }

  getLeagueMatchParticipant(isWinner) {
    this.commonService.showLoader("Fetching info ...");
    isWinner ? this.leagueMatchParticipantInput.TeamId = this.winnerTeamObj.parentclubteam.id : this.leagueMatchParticipantInput.TeamId = this.loserTeamObj.parentclubteam.id;
    // this.leagueMatchParticipantInput.TeamId2 = this.loserTeamObj.parentclubteam.id
    this.leagueMatchParticipantInput.leagueTeamPlayerStatusType = LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH;
    this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueMatchParticipantInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        if (isWinner) {
          this.leagueMatchParticipantResForWinner = res.data || [];
          console.log("Get_League_Match_Participant WINNER", JSON.stringify(res.data));
          this.getLeagueMatchParticipant(false);
        }
        else
          this.leagueMatchParticipantResForLoser = res.data || [];
        console.log("Get_League_Match_Participant LOSER", JSON.stringify(res.data));
      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
  }

  dismiss() {
    this.viewCtrl.dismiss([]);
  }

  save() {
    this.viewCtrl.dismiss(this.selectedPlayers);
  }

  // save() {
  //   this.callback(this.selectedPlayers).then(() => { this.viewCtrl.dismiss(); });

  // }




  // this.commonService.updateCategory("potmList");
  // this.selectedPlayers;
  // this.navCtrl.pop();
  // for catchinfg the data  inside constructor

  // this.commonService.category.pipe(first()).subscribe(async(data) => {

  //   if (data == "update_session_list") {
  //   }
  // })
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