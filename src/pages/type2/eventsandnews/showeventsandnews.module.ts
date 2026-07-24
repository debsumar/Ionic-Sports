import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShoweventsandnewsPage } from './showeventsandnews';
import { SocialSharing } from '@ionic-native/social-sharing';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';
@NgModule({
  declarations: [
    ShoweventsandnewsPage,
  ],
  imports: [
    IonicPageModule.forChild(ShoweventsandnewsPage),
    SharedComponentsModule,
  ],
  providers:[SocialSharing,ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShoweventsandnewsPageModule {}
