import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import { IonicStorageModule } from "@ionic/storage";
import { storage } from "firebase";
import { IonicPageModule } from "ionic-angular";
import { MatchPage } from "./match";
import { ThemeService } from "../../../services/theme.service";
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    MatchPage
  ],
  imports: [IonicPageModule.forChild(MatchPage), IonicStorageModule.forRoot(), SharedComponentsModule],
  providers: [ThemeService],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MatchPageModule {}
