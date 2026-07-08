import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecuringbookingPage } from './recuringbooking';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';


@NgModule({
  declarations: [
    RecuringbookingPage,
  ],
  imports: [
    IonicPageModule.forChild(RecuringbookingPage),
    SharedComponentsModule,
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class RecuringbookingPageModule {}
