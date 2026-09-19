import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { ActiveBookingDetail } from './activebookingdetail';
import { SharedComponentsModule } from '../../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../../services/theme.service';

@NgModule({
  declarations: [
    ActiveBookingDetail,
    //CommentForEmptinessPage
  ],
  imports: [
    IonicPageModule.forChild(ActiveBookingDetail),
    SharedComponentsModule,
  ],
  providers: [
    CallNumber,
    ThemeService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]

})
export class ActiveBookingDetailModule {

  
}
