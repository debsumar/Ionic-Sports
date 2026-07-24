import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { ActivitymodalPage } from './activitymodal';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    ActivitymodalPage,
  ],
  imports: [
    IonicPageModule.forChild(ActivitymodalPage),
    CommonModule,
    SharedComponentsModule,
  ],
  providers: [ThemeService],
})
export class ActivitymodalPageModule {}
