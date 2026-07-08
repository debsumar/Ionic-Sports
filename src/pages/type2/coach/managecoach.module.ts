import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2ManageCoach } from './managecoach';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';
@NgModule({
  declarations: [
    Type2ManageCoach,
  ],
  imports: [
    IonicPageModule.forChild(Type2ManageCoach),
    SharedComponentsModule,
  ],
  exports: [
    Type2ManageCoach
  ],
  providers: [Camera, File, ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Type2ManageCoachModule {}
