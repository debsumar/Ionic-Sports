import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManageLeagueTeamsPage } from './manage_league_teams';

@NgModule({
  declarations: [
    ManageLeagueTeamsPage,
  ],
  imports: [
    IonicPageModule.forChild(ManageLeagueTeamsPage),
  ],
})
export class ManageLeagueTeamsPageModule { }
