import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditbookingPage } from './editbooking';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
    EditbookingPage,
  ],
  imports: [
    IonicPageModule.forChild(EditbookingPage),
    SharedComponentsModule
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class EditbookingPageModule {}
