import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PaymentgatewaysetupPage } from "../type2/paymentgatewaysetup/paymentgatewaysetup";
import { CommentForEmptinessPage } from "../type2/commentforemptiness/commentforemptiness";
import { MatchPage } from "../type2/match/match";
import { IonicPageModule } from 'ionic-angular';
import { MatchladderPage } from "../type2/match/matchladder/matchladder";
import { MatchhistoryPage } from "../type2/match/matchhistory/matchhistory";
import { LeagueteamlistingPage } from "../type2/league/leagueteamlisting/leagueteamlisting";
//import { CommonLeagueService } from "../type2/league/commonleague.service";
@NgModule({
  declarations: [PaymentgatewaysetupPage, CommentForEmptinessPage,MatchPage,MatchladderPage,MatchhistoryPage,LeagueteamlistingPage],
  exports: [PaymentgatewaysetupPage, CommentForEmptinessPage,MatchPage,MatchladderPage,MatchhistoryPage,LeagueteamlistingPage],
  imports: [IonicPageModule,CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  //providers: [CommonLeagueService]
})
export class SharedmoduleModule {}
