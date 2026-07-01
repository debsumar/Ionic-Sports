import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddsubadminPage } from './addsubadmin';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { ThemeService } from '../../services/theme.service';

@NgModule({
  declarations: [
    AddsubadminPage,
  ],
  imports: [
    IonicPageModule.forChild(AddsubadminPage),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddsubadminPageModule {}
