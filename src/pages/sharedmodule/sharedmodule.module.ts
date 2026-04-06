import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatchPage } from "../type2/match/match";
import { IonicPageModule } from 'ionic-angular';
import { MatchladderPage } from "../type2/match/matchladder/matchladder";
import { MatchhistoryPage } from "../type2/match/matchhistory/matchhistory";
import { LeagueteamlistingPage } from "../type2/league/leagueteamlisting/leagueteamlisting";
import { SharedComponentsModule } from '../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    MatchPage, MatchladderPage, MatchhistoryPage, LeagueteamlistingPage],
  exports: [
    MatchPage, MatchladderPage, MatchhistoryPage, LeagueteamlistingPage],
  imports: [IonicPageModule, CommonModule, SharedComponentsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedmoduleModule { }
