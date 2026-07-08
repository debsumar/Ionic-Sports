import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WeeklySessionDetailsPage } from './weekly-session-details';
import { SharedComponentsModule } from '../../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    WeeklySessionDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(WeeklySessionDetailsPage),
    SharedComponentsModule,
  ],
})
export class WeeklySessionDetailsPageModule {}
