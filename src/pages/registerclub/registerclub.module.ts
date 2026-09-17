import { NgModule } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { IonicPageModule } from 'ionic-angular';
import { HttpService } from '../../services/http.service';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { TeamImageUploadService } from '../type2/team/team_image_upload/team_image_upload.service';
import { RegisterClub } from './registerclub';

@NgModule({
  declarations: [RegisterClub],
  imports: [
    IonicPageModule.forChild(RegisterClub),
    SharedComponentsModule,
  ],
  providers: [Camera, HttpService, TeamImageUploadService],
})
export class RegisterClubModule {}
