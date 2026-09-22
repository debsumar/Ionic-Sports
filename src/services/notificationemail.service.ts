import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedServices } from '../pages/services/sharedservice';
import { API } from '../shared/constants/api_constants';
import { ActionType, AppType, DeviceType } from '../shared/constants/module.constants';
import {
  SendNotificationEmailContext,
  SendNotificationEmailRequestDto,
  SendNotificationEmailResponseDto,
} from '../shared/model/email.model';
import { HttpService } from './http.service';

@Injectable()
export class NotificationEmailService {
  constructor(
    private httpService: HttpService,
    private sharedservice: SharedServices,
  ) {}

  buildPayload(ctx: SendNotificationEmailContext): SendNotificationEmailRequestDto {
    const deviceType = this.sharedservice.getPlatform() === 'android'
      ? DeviceType.ANDROID
      : DeviceType.IOS;
    const payload: SendNotificationEmailRequestDto = {
      Members: ctx.members,
      ImagePath: ctx.parentClubIconUrl,
      FromEmail: ctx.fromEmail,
      FromName: ctx.parentClubName,
      ToEmail: ctx.parentClubAdminEmail,
      ToName: ctx.parentClubName,
      CCName: ctx.parentClubName,
      CCEmail: ctx.parentClubAdminEmail,
      Subject: ctx.subject,
      Message: ctx.message.replace(/\n/g, '<br>'),
      ReplyTo: ctx.parentClubAdminEmail,
      IsTransactional: false,
      ParentClubId: this.sharedservice.getPostgreParentClubId(),
      Source: deviceType,
      Priority: 1,
      Type: 1,
      UserInfoType: AppType.ADMIN,
      Purpose: ctx.purpose,
      user_postgre_metadata: {
        UserParentClubId: this.sharedservice.getPostgreParentClubId(),
        UserMemberId: this.sharedservice.getLoggedInUserId(),
        UserClubId: ctx.clubId,
      },
      user_firebase_metadata: {
        UserParentClubId: this.sharedservice.getParentclubKey(),
        UserMemberId: this.sharedservice.getLoggedInId(),
      },
      user_device_metadata: {
        UserAppType: AppType.ADMIN_NEW,
        UserActionType: ActionType.CREATE,
        UserDeviceType: deviceType,
      },
    };

    if (ctx.module !== undefined) {
      payload.Module = String(ctx.module);
    }

    return payload;
  }

  sendNotificationEmail(ctx: SendNotificationEmailContext): Observable<SendNotificationEmailResponseDto> {
    return this.httpService.post<SendNotificationEmailResponseDto>(
      API.SEND_NOTIFICATION_EMAIL,
      this.buildPayload(ctx),
      undefined,
      1,
    );
  }
}
