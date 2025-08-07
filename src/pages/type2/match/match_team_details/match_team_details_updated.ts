import { Component, Renderer2, ViewChild } from "@angular/core";
import { ActionSheetController, LoadingController, NavController, NavParams, AlertController, ModalController, FabContainer } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../../../services/sharedservice";
import { FirebaseService } from "../../../../services/firebase.service";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { Apollo } from "apollo-angular";
import moment from "moment";
import gql from "graphql-tag";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../../services/graphql.service";
import { error } from "console";
import { AllMatchData, GetIndividualMatchParticipantModel, MatchModelV2, } from "../../../../shared/model/match.model";
import { LeagueMatchActionType, MatchType, LeagueTeamPlayerStatusType, LeagueParticipationStatus } from "../../../../shared/utility/enums";
import { API } from "../../../../shared/constants/api_constants";
import { HttpService } from "../../../../services/http.service";
import { AppType } from "../../../../shared/constants/module.constants";
import { TeamsForParentClubModel } from "../../league/models/team.model";
import { Role } from "../../team/team.model";

@Component({
    selector: "page-match_team_details_updated",
    templateUrl: "match_team_details.html",
    providers: [HttpService]
})
export class MatchTeamDetailsPage {
    @ViewChild('fab') fab: FabContainer;
    currencyDetails: any;
    activeType: boolean = true;
    selectedHomeTeamText: string;
    selectedAwayTeamText: string;

    getIndividualMatchParticipantRes: GetIndividualMatchParticipantModel[] = [];
    match: AllMatchData;
    parentClubKey: string;
    activitySpecificTeamsRes: TeamsForParentClubModel[] = [];
    selectedTeam: TeamsForParentClubModel;
    roles: Role[];

    getIndividualMatchParticipantInput: GetIndividualMatchParticipantInput = {
        parentclubId: "",
        clubId: "",
        activityId: "",
        memberId: "",
        action_type: 0,
        device_type: 0,
        app_type: 0,
        device_id: "",
        updated_by: "",
        MatchId: "",
        TeamId: "",
        leagueTeamPlayerStatusType: 0
    }

    getActivitySpecificTeamInput: GetActivitySpecificTeamInput = {
        parentclubId: "",
        clubId: "",
        activityId: "",
        memberId: "",
        action_type: 0,
        device_type: 0,
        app_type: 0,
        device_id: "",
        updated_by: ""
    }

    updateTeamInput: UpdateTeamInput = {
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
        HomeParticipantId: "",
        AwayParticipantId: "",
        HomeParentclubTeamId: "",
        AwayParentclubTeamId: ""
    }

    updateMatchParticipantRoleInput: UpdateMatchParticipantRoleInput = {
        parentclubId: "",
        clubId: "",
        activityId: "",
        memberId: "",
        action_type: 0,
        device_type: 0,
        app_type: 0,
        device_id: "",
        updated_by: "",
        match_participation_id: "",
        role_id: "",
        role_type: 0
    }

    updateMatchParticipationStatusInput: UpdateMatchParticipationStatusInput = {
        parentclubId: "",
        clubId: "",
        activityId: "",
        memberId: "",
        action_type: 0,
        device_type: 0,
        app_type: 0,
        device_id: "",
        updated_by: "",
        MatchId: "",
        ParticipationId: "",
        ParticipationStatus: 0
    }

    teamRolesInput: TeamRolesInput = {
        ParentClubKey: '',
        MemberKey: '',
        AppType: 0,
        ActionType: 0,
        activityCode: 0,
    }

    sections: { title: string; items: GetIndividualMatchParticipantModel[] }[] = [
        {
            title: 'Playing Squad',
            items: []
        },
        {
            title: 'Bench',
            items: []
        },
        {
            title: 'Remaining Players',
            items: []
        }
    ];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public commonService: CommonService,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public storage: Storage,
        public fb: FirebaseService,
        public sharedservice: SharedServices,
        public actionSheetCtrl: ActionSheetController,
        private graphqlService: GraphqlService,
        private httpService: HttpService,
        private renderer: Renderer2
    ) {
        this.match = JSON.parse(this.navParams.get("match"));
        console.log('MATCH OBJ', this.match);
        this.selectedHomeTeamText = this.match.homeUserName != null ? this.match.homeUserName : 'Home Team';
        this.selectedAwayTeamText = this.match.awayUserName != null ? this.match.awayUserName : 'Away Team';

        this.storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        });

        this.storage.get("userObj").then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;

                // Initialize teamRolesInput
                this.teamRolesInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.teamRolesInput.MemberKey = val.$key;
                this.teamRolesInput.AppType = AppType.ADMIN_NEW;
                this.teamRolesInput.ActionType = 0;

                this.getActivitySpecificTeamInput.parentclubId = this.sharedservice.getPostgreParentClubId();
                this.getActivitySpecificTeamInput.memberId = this.sharedservice.getLoggedInId();
                this.getActivitySpecificTeamInput.action_type = LeagueMatchActionType.MATCH;
                this.getActivitySpecificTeamInput.app_type = AppType.ADMIN_NEW;
                this.getActivitySpecificTeamInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;

                if (!this.match.activityId) {
                    console.error('Match activityId is missing:', this.match);
                    this.commonService.toastMessage('Match activity data is missing', 3000, ToastMessageType.Error);
                    this.navCtrl.pop();
                    return;
                }

                this.getActivitySpecificTeamInput.activityId = this.match.activityId;
                this.teamRolesInput.activityCode = parseInt(this.match.ActivityCode) || 0;

                this.getIndividualMatchParticipantInput.parentclubId = this.sharedservice.getPostgreParentClubId();
                this.getIndividualMatchParticipantInput.memberId = this.sharedservice.getLoggedInId();
                this.getIndividualMatchParticipantInput.action_type = LeagueMatchActionType.MATCH;
                this.getIndividualMatchParticipantInput.app_type = AppType.ADMIN_NEW;
                this.getIndividualMatchParticipantInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
                this.getIndividualMatchParticipantInput.activityId = this.match.activityId;
                this.getIndividualMatchParticipantInput.MatchId = this.match.MatchId;
                this.getIndividualMatchParticipantInput.TeamId = this.match.homeUserId;
                this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType = LeagueTeamPlayerStatusType.All;

                this.updateTeamInput.parentclubId = this.sharedservice.getPostgreParentClubId();
                this.updateTeamInput.memberId = this.sharedservice.getLoggedInId();
                this.updateTeamInput.action_type = LeagueMatchActionType.MATCH;
                this.updateTeamInput.app_type = AppType.ADMIN_NEW;
                this.updateTeamInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
                this.updateTeamInput.LeagueId = ''
                this.updateTeamInput.MatchId = this.match.MatchId;

                this.updateMatchParticipantRoleInput.parentclubId = this.sharedservice.getPostgreParentClubId();
                this.updateMatchParticipantRoleInput.memberId = this.sharedservice.getLoggedInId();
                this.updateMatchParticipantRoleInput.action_type = LeagueMatchActionType.MATCH;
                this.updateMatchParticipantRoleInput.app_type = AppType.ADMIN_NEW;
                this.updateMatchParticipantRoleInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
                this.updateMatchParticipantRoleInput.activityId = this.match.activityId;

                this.updateMatchParticipationStatusInput.parentclubId = this.sharedservice.getPostgreParentClubId();
                this.updateMatchParticipationStatusInput.memberId = this.sharedservice.getLoggedInId();
                this.updateMatchParticipationStatusInput.action_type = LeagueMatchActionType.MATCH;
                this.updateMatchParticipationStatusInput.app_type = AppType.ADMIN_NEW;
                this.updateMatchParticipationStatusInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
                this.updateMatchParticipationStatusInput.MatchId = this.match.MatchId;

                this.getActivitySpecificTeam();
                this.getIndividualMatchParticipant();
                this.getRoleForPlayers();
            }
        });
    }

    ionViewDidLoad() {
        console.log("ionViewDidLoad MatchTeamDetailsPage");
    }

    formatMatchStartDate(date) {
        return moment(date, "YYYY-MM-DD HH:mm").local().format("DD-MMM-YYYY hh:mm A");
    }

    closeFab() {
        if (this.fab) {
            this.fab.close();
        }
    }

    getFilteredSections(): { title: string; items: GetIndividualMatchParticipantModel[] }[] {
        if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
            return this.sections;
        } else if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.PLAYING) {
            return this.sections.filter(section => section.title === 'Playing Squad');
        } else if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.BENCH) {
            return this.sections.filter(section => section.title === 'Bench');
        }
        return this.sections;
    }

    onEnterSection(sectionIndex: number) {
        const dropZone = document.querySelectorAll('.drop-zone')[sectionIndex];
        if (dropZone) {
            this.renderer.addClass(dropZone, 'drag-over');
        }
    }

    onDragLeaveSection(sectionIndex: number) {
        const dropZone = document.querySelectorAll('.drop-zone')[sectionIndex];
        if (dropZone) {
            this.renderer.removeClass(dropZone, 'drag-over');
        }
    }

    onDragStart(event: any, item: any, sectionIndex: number) {
        if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
            event.dataTransfer.setData('text/plain', JSON.stringify({ item, sectionIndex }));
            event.dataTransfer.effectAllowed = 'move';
        } else {
            this.commonService.toastMessage('Please select "All" filter to drag and drop', 3000, ToastMessageType.Info);
            event.preventDefault();
        }
    }

    onDragEnd(event: any) {
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(dropZone => this.renderer.removeClass(dropZone, 'drag-over'));
    }

    onDrop(event: any, sectionIndex: number) {
        event.preventDefault();
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const item = data.item;
        const fromSectionIndex = data.sectionIndex;

        if (fromSectionIndex !== sectionIndex) {
            this.sections[fromSectionIndex].items = this.sections[fromSectionIndex].items.filter(i => i.id !== item.id);
            this.sections[sectionIndex].items.push(item);

            let newParticipantStatus: LeagueParticipationStatus;

            if (sectionIndex === 0) {
                newParticipantStatus = LeagueParticipationStatus.PARTICIPANT;
            } else if (sectionIndex === 1) {
                newParticipantStatus = LeagueParticipationStatus.NON_PARTICIPANT;
            } else {
                newParticipantStatus = LeagueParticipationStatus.PENDING;
            }

            this.updateMatchParticipationStatus(item.participant_status, newParticipantStatus, { participationId: item.id });
        }
        this.onDragLeaveSection(sectionIndex);
    }

    presentActionSheet(member: GetIndividualMatchParticipantModel) {
        let actionSheet = this.actionSheetCtrl.create({
            title: `${member.user.FirstName} ${member.user.LastName}`,
            buttons: [
                {
                    text: 'Update Role',
                    icon: 'female',
                    handler: () => {
                        if (this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType === LeagueTeamPlayerStatusType.All) {
                            this.showRoles(member);
                        } else {
                            this.commonService.toastMessage('Please select "All" filter to update role', 3000, ToastMessageType.Info);
                        }
                    }
                },
            ]
        });
        actionSheet.present();
    }

    showRoles(member: GetIndividualMatchParticipantModel): void {
        this.closeFab();
        if (this.roles && this.roles.length > 0) {
            let alert = this.alertCtrl.create();
            alert.setTitle(`Select Role`);

            for (let userIndex = 0; userIndex < this.roles.length; userIndex++) {
                alert.addInput({
                    type: 'radio',
                    label: this.roles[userIndex].role_name,
                    value: this.roles[userIndex].id,
                    checked: member.teamrole && member.teamrole.id === this.roles[userIndex].id
                });
            }

            alert.addButton('Cancel');
            alert.addButton({
                text: 'OK',
                handler: (selectedVal) => {
                    if (!selectedVal) {
                        this.commonService.toastMessage("Please select a role", 3000, ToastMessageType.Info);
                        return false;
                    } else {
                        const selectedRole = this.roles.find(r => r.id === selectedVal);
                        this.updateMatchParticipantRoleInput.role_id = selectedRole.id;
                        this.updateMatchParticipantRoleInput.role_type = parseInt(selectedRole.role_type);
                        this.updatePlayerRole(member);
                    }
                }
            });

            alert.present();
        } else {
            this.commonService.toastMessage("No roles available", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
        }
    }

    getRoleForPlayers() {
        const playernstaffrole = gql`
        query getTeamRoles($activityDetails:TeamRolesInput!) { 
         getTeamRoles(activityDetails:$activityDetails){
          teamRoles {
            id
            role_type
            role_name
          }
           }
         }
       `;
        this.graphqlService.query(playernstaffrole, { activityDetails: this.teamRolesInput }, 0).subscribe((data: any) => {
            this.roles = data.data.getTeamRoles.teamRoles;
            console.log("Roles getting for player:", JSON.stringify(this.roles));
        },
            (error) => {
                console.error("Error in fetching roles:", error);
            }
        );
    }

    updatePlayerRole(member: GetIndividualMatchParticipantModel) {
        this.commonService.showLoader("Updating Role...");
        this.updateMatchParticipantRoleInput.match_participation_id = member.id;

        this.httpService.post(`${API.Update_League_Match_Participantipation_Role}`, this.updateMatchParticipantRoleInput).subscribe((res: any) => {
            if (res) {
                this.commonService.hideLoader();
                var response = res.message;
                console.log("Update_Match_Participant_Role RESPONSE", JSON.stringify(response));
                this.commonService.toastMessage(response, 3000, ToastMessageType.Success);
                this.getIndividualMatchParticipant();
            } else {
                this.commonService.hideLoader();
                console.log("error in Update_Match_Participant_Role");
            }
        },
            (err) => {
                this.commonService.hideLoader();
                this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error);
            });
    }

    changeType(val: boolean) {
        this.sections.forEach(section => section.items = []);
        this.activeType = val !== undefined ? val : !this.activeType;

        if (this.activeType) {
            this.getIndividualMatchParticipantInput.TeamId = this.match.homeUserId;
        } else {
            this.getIndividualMatchParticipantInput.TeamId = this.match.awayUserId;
        }

        this.getActivitySpecificTeam();
        this.getIndividualMatchParticipant();
        this.getFilteredSections();
        console.log('leagueTeamPlayerStatusType:', this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType);
    }

    getIndividualMatchParticipant(par?: LeagueTeamPlayerStatusType) {
        this.commonService.showLoader("Fetching info ...");

        if (par !== undefined) {
            this.getIndividualMatchParticipantInput.leagueTeamPlayerStatusType = par;
        }

        if (this.activeType) {
            this.getIndividualMatchParticipantInput.TeamId = this.match.homeUserId;
        } else {
            this.getIndividualMatchParticipantInput.TeamId = this.match.awayUserId;
        }

        this.httpService.post(`${API.GetIndividualMatchParticipant}`, this.getIndividualMatchParticipantInput).subscribe((res: any) => {
            if (res) {
                this.commonService.hideLoader();
                this.getIndividualMatchParticipantRes = res.data || [];
                console.log("GetIndividualMatchParticipant RESPONSE", JSON.stringify(res.data));
                this.sections.forEach(section => section.items = []);
                this.populateSections();
            } else {
                this.commonService.hideLoader();
                console.log("error in fetching")
            }
        }, error => {
            this.commonService.hideLoader();
            if (error.error && error.error.message) {
                this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error);
            } else {
                this.commonService.toastMessage("Failed to fetch participants details", 3000, ToastMessageType.Error);
            }
        });
    }

    populateSections() {
        this.getIndividualMatchParticipantRes.forEach(participant => {
            switch (participant.participant_status) {
                case LeagueParticipationStatus.PARTICIPANT:
                    this.sections[0].items.push(participant);
                    break;
                case LeagueParticipationStatus.NON_PARTICIPANT:
                    this.sections[1].items.push(participant);
                    break;
                case LeagueParticipationStatus.PENDING:
                default:
                    this.sections[2].items.push(participant);
                    break;
            }
        });
    }

    updateMatchParticipationStatus(participantStatus, newParticipantStatus: LeagueParticipationStatus, { participationId }: { participationId: string }) {
        this.commonService.showLoader("Updating...");
        this.updateMatchParticipationStatusInput.ParticipationId = participationId;
        this.updateMatchParticipationStatusInput.ParticipationStatus = newParticipantStatus;

        this.httpService.post(`${API.Update_League_Match_Participation_Status}`, this.updateMatchParticipationStatusInput).subscribe((res: any) => {
            if (res) {
                this.commonService.hideLoader();
                var response = res.message;
                console.log("Update_Match_Participation_Status RESPONSE", JSON.stringify(response));
                this.commonService.toastMessage(response, 3000, ToastMessageType.Success);
                this.getIndividualMatchParticipant(LeagueTeamPlayerStatusType.All);
            } else {
                this.commonService.hideLoader();
                console.log("error in Update_Match_Participation_Status")
            }
        },
            (err) => {
                this.commonService.hideLoader();
                this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error);
            });
    }

    showAvailableTeams(isHomeTeam: boolean): void {
        this.closeFab();
        if (this.activitySpecificTeamsRes.length > 0) {
            let alert = this.alertCtrl.create();
            alert.setTitle(`Select Team`);

            for (let userIndex = 0; userIndex < this.activitySpecificTeamsRes.length; userIndex++) {
                alert.addInput({
                    type: 'radio',
                    label: this.activitySpecificTeamsRes[userIndex].teamName,
                    value: this.activitySpecificTeamsRes[userIndex].id,
                    checked: isHomeTeam ? this.activitySpecificTeamsRes[userIndex].teamName == this.selectedHomeTeamText : this.activitySpecificTeamsRes[userIndex].teamName == this.selectedAwayTeamText
                });
            }

            alert.addButton('Cancel');
            alert.addButton({
                text: 'OK',
                handler: (selectedVal) => {
                    if (!selectedVal) {
                        this.commonService.toastMessage("Please select a team", 3000, ToastMessageType.Info);
                        return false;
                    }
                    this.selectedTeam = this.activitySpecificTeamsRes.find(team => team.id === selectedVal);

                    if (isHomeTeam) {
                        if (this.selectedTeam.teamName === this.selectedAwayTeamText) {
                            this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
                        } else {
                            this.selectedHomeTeamText = this.selectedTeam.teamName;
                            this.updateTeamInput.HomeParentclubTeamId = selectedVal;
                            this.updateTeamInput.AwayParentclubTeamId = "";
                        }
                    } else {
                        if (this.selectedTeam.teamName === this.selectedHomeTeamText) {
                            this.commonService.toastMessage("Home and away teams can't be same", 3000, ToastMessageType.Info);
                        } else {
                            this.selectedAwayTeamText = this.selectedTeam.teamName;
                            this.updateTeamInput.AwayParentclubTeamId = selectedVal;
                            this.updateTeamInput.HomeParentclubTeamId = "";
                        }
                    }
                    this.updateTeam();
                }
            });

            alert.present();
        } else {
            this.commonService.toastMessage("No teams available", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
        }
    }

    getActivitySpecificTeam() {
        this.httpService.post(`${API.GET_ACTIVIY_SPECIFIC_TEAM}`, this.getActivitySpecificTeamInput).subscribe((res: any) => {
            if (res) {
                this.activitySpecificTeamsRes = res.data;
                console.log("GET_ACTIVIY_SPECIFIC_TEAM RESPONSE", JSON.stringify(res.data));
            } else {
                console.log("error in fetching")
            }
        }, error => {
            this.commonService.toastMessage(error.error.message, 3000, ToastMessageType.Error);
        });
    }

    updateTeam() {
        this.commonService.showLoader("Updating...");
        this.httpService.post(`${API.Update_League_Fixture}`, this.updateTeamInput).subscribe((res: any) => {
            if (res) {
                this.commonService.hideLoader();
                var response = res.message;
                console.log("Update_League_Fixture RESPONSE", JSON.stringify(response));
                this.commonService.toastMessage(response, 3000, ToastMessageType.Success);
                this.getIndividualMatchParticipant(LeagueTeamPlayerStatusType.All);
            } else {
                console.log("error in Update_League_Fixture")
            }
        },
            (err) => {
                this.commonService.hideLoader();
                if (err.error && err.error.message) {
                    this.commonService.toastMessage(err.error.message, 3000, ToastMessageType.Error);
                } else {
                    this.commonService.toastMessage("Failed to update fixture", 3000, ToastMessageType.Error);
                }
            }
        );
    }

    publish() {
        this.closeFab();
        const homeTeam = this.getIndividualMatchParticipantRes.find(team => team.Team.teamName === this.selectedHomeTeamText);
        const awayTeam = this.getIndividualMatchParticipantRes.find(team => team.Team.teamName === this.selectedAwayTeamText);
        console.log("Selected Home Team:", homeTeam);
        console.log(this.selectedHomeTeamText);
        console.log(this.selectedAwayTeamText);
        this.selectedHomeTeamText != 'Home Team' ||
            this.selectedAwayTeamText != 'Away Team' ?
            this.navCtrl.push("PublishFootballPage", {
                "match": this.match, "homeTeam": homeTeam,
                "awayTeam": awayTeam,
            }) :
            this.commonService.toastMessage('Select Home and Away Teams', 3000, ToastMessageType.Info);
    }

    deleteConfirm() {
        let match_delete_alert = this.alertCtrl.create({
            title: "Do you want to delete the match?",
            buttons: [
                {
                    text: "Delete",
                    handler: () => {
                        this.delete();
                    },
                },
                {
                    text: "No",
                    role: "cancel",
                    handler: () => {
                        console.log("Cancel clicked");
                    },
                },
            ],
        });

        match_delete_alert.present();
    }

    delete() {
        this.commonService.showLoader("Please wait...");
        try {
            const delete_Match = gql`
       mutation deleteMatch($deleteMatchInput: DeleteMatchInput!) {
        deleteMatch(deleteMatchInput: $deleteMatchInput)
      }`;
            const deleteVariable = { deleteMatchInput: { ParentClubKey: this.parentClubKey, MatchId: this.match.MatchId } }

            this.graphqlService.mutate(delete_Match, deleteVariable, 1).subscribe((response) => {
                this.commonService.hideLoader();
                const message = "match deleted successfully";
                this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                this.commonService.updateCategory("matchlist");
                this.navCtrl.pop().then(() => this.navCtrl.pop().then());
            }, (err) => {
                this.commonService.hideLoader();
                console.error("GraphQL mutation error:", err);
                this.commonService.toastMessage("match deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            })
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }
}

export class GetIndividualMatchParticipantInput {
    parentclubId: string;
    clubId: string;
    activityId: string;
    memberId: string;
    action_type: number;
    device_type: number;
    app_type: number;
    device_id: string;
    updated_by: string;
    MatchId: string;
    TeamId: string;
    leagueTeamPlayerStatusType: number;
}

export class GetActivitySpecificTeamInput {
    parentclubId: string;
    clubId: string;
    activityId: string;
    memberId: string;
    action_type: number;
    device_type: number;
    app_type: number;
    device_id: string;
    updated_by: string;
}

export class UpdateTeamInput {
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
    MatchId: string;
    HomeParticipantId: string;
    AwayParticipantId: string;
    HomeParentclubTeamId: string;
    AwayParentclubTeamId: string;
}

export class UpdateMatchParticipantRoleInput {
    parentclubId: string;
    clubId: string;
    activityId: string;
    memberId: string;
    action_type: number;
    device_type: number;
    app_type: number;
    device_id: string;
    updated_by: string;
    match_participation_id: string;
    role_id: string;
    role_type: number;
}

export class UpdateMatchParticipationStatusInput {
    parentclubId: string;
    clubId: string;
    activityId: string;
    memberId: string;
    action_type: number;
    device_type: number;
    app_type: number;
    device_id: string;
    updated_by: string;
    MatchId: string;
    ParticipationId: string;
    ParticipationStatus: number;
}

export class TeamRolesInput {
    ParentClubKey: string;
    MemberKey: string;
    AppType: number;
    ActionType: number;
    activityCode: number;
}