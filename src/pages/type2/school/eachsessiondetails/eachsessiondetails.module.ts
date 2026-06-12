import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule, FabContainer } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { EachSessionDetailsPage } from './eachsessiondetails';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';
@NgModule({
  declarations: [
    EachSessionDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(EachSessionDetailsPage),
    SharedComponentsModule,
  ],
  providers:[
    CallNumber,
    FabContainer,
    ThemeService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class EachSessionDetailsPageModule {}
