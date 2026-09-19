import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchoolmembersheetPage } from './schoolmembersheet';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
    SchoolmembersheetPage,
  ],
  imports: [
    IonicPageModule.forChild(SchoolmembersheetPage),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SchoolmembersheetPageModule {}
