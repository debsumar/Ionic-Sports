import { Component, Renderer2, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  ActionSheetController,
  ModalController,
  Platform,
  FabContainer,
} from "ionic-angular";
import * as moment from "moment";
import { Storage } from "@ionic/storage";
import { Apollo } from "apollo-angular";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { AlertController } from "ionic-angular/components/alert/alert-controller";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { LeagueParticipantModel, LeaguesForParentClubModel, LeagueStandingModel } from "../models/league.model";
import gql from "graphql-tag";
import { GraphqlService } from "../../../../services/graphql.service";
import { HttpService } from "../../../../services/http.service";
import { DatePipe } from "@angular/common";
import { AutocreatematchPage } from "../autocreatematch/autocreatematch";
import { LeagueMatch } from "../models/location.model";

@IonicPage()
@Component({
  selector: "page-manage_league_teams",
  templateUrl: "manage_league_teams.html",
  providers: [HttpService, DatePipe]
})
export class ManageLeagueTeamsPage {
  activeIndex: number = 0;
  sections = [
    {
      title: 'Playing Squad',
      items: [
        { id: 1, name: 'Player 1', age: 25, position: 'Quarterback', playerNumber: 10 },
        { id: 2, name: 'Player 2', age: 22, position: 'Striker', playerNumber: 9 },
        { id: 6, name: 'Player 6', age: 23, position: 'Defender', playerNumber: 4 },
        { id: 7, name: 'Player 7', age: 26, position: 'Midfielder', playerNumber: 8 },
        { id: 8, name: 'Player 8', age: 24, position: 'Goalkeeper', playerNumber: 1 }
      ]
    },
    {
      title: 'Bench',
      items: [
        { id: 3, name: 'Player 3', age: 28, position: 'Keeper', playerNumber: 1 },
        { id: 9, name: 'Player 9', age: 27, position: 'Forward', playerNumber: 11 },
        { id: 10, name: 'Player 10', age: 21, position: 'Defender', playerNumber: 5 }
      ]
    },
    {
      title: 'Remaining Players',
      items: [
        { id: 4, name: 'Player 4', age: 24, position: 'Midfielder', playerNumber: 8 },
        { id: 5, name: 'Player 5', age: 27, position: 'Defender', playerNumber: 5 },
        { id: 11, name: 'Player 11', age: 22, position: 'Striker', playerNumber: 9 },
        { id: 12, name: 'Player 12', age: 25, position: 'Midfielder', playerNumber: 6 },
        { id: 13, name: 'Player 13', age: 23, position: 'Goalkeeper', playerNumber: 1 }
      ]
    }
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    private renderer: Renderer2 // Inject Renderer2
  ) {
    // this.league = this.navParams.get("league");
    // console.log(this.league);
  }

  ionViewDidLoad() {
    console.log("ManageLeagueTeamsPage");
    this.activeIndex = 0;
  }

  ionViewDidEnter() {

  }

  onEnterSection(sectionIndex: number) {
    const dropZone = document.querySelectorAll('.drop-zone')[sectionIndex];
    if (dropZone) {
      this.renderer.addClass(dropZone, 'drag-over'); // Use Renderer2 to add class
    }
  }

  onDragLeaveSection(sectionIndex: number) {
    const dropZone = document.querySelectorAll('.drop-zone')[sectionIndex];
    if (dropZone) {
      this.renderer.removeClass(dropZone, 'drag-over'); // Use Renderer2 to remove class
    }
  }

  onDragStart(event: any, item: any, sectionIndex: number) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ item, sectionIndex }));
    event.dataTransfer.effectAllowed = 'move'; // Ensure the effect is allowed
  }

  onDragEnd(event: any) {
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(dropZone => this.renderer.removeClass(dropZone, 'drag-over')); // Use Renderer2 to remove class
  }

  onDrop(event: any, sectionIndex: number) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('text/plain')); // Ensure correct data type
    const item = data.item;
    const fromSectionIndex = data.sectionIndex;

    if (fromSectionIndex !== sectionIndex) {
      this.sections[fromSectionIndex].items = this.sections[fromSectionIndex].items.filter(i => i.id !== item.id);
      this.sections[sectionIndex].items.push(item);
    }

    this.onDragLeaveSection(sectionIndex);
  }

  changeType(index: number) {
    this.activeIndex = index;
  }
}