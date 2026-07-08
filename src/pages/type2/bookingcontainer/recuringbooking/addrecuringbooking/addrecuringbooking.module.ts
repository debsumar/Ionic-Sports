import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddrecuringbookingPage } from './addrecuringbooking';
import { SharedComponentsModule } from '../../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../../services/theme.service';

@NgModule({
  declarations: [
    AddrecuringbookingPage,
  ],
  imports: [
    IonicPageModule.forChild(AddrecuringbookingPage),
    SharedComponentsModule,
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AddrecuringbookingPageModule {}
