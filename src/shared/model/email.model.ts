export interface EmailNotifyMemberDto {
  MemberEmail: string;
  MemberId?: string;
  MemberName?: string;
  IsChild?: boolean;
  ParentId?: string;
}

export interface SendNotificationEmailRequestDto {
  Members: EmailNotifyMemberDto[];
  ImagePath?: string;
  FromEmail: string;
  FromName: string;
  ToEmail: string;
  ToName: string;
  CCName: string;
  CCEmail: string;
  Subject: string;
  Message: string;
  ReplyTo: string;
  IsTransactional: boolean;
  ParentClubId: string;
  Source: number;
  Priority: number;
  Type: number;
  UserInfoType: number;
  Module?: string;
  Purpose?: string;
  user_postgre_metadata: {
    UserParentClubId: string;
    UserMemberId: string;
    UserClubId?: string;
  };
  user_firebase_metadata: {
    UserParentClubId: string;
    UserMemberId: string;
  };
  user_device_metadata: {
    UserAppType: number;
    UserActionType: number;
    UserDeviceType: number;
  };
}

export interface SendNotificationEmailResponseDto {
  success: boolean;
  message: string;
  data?: boolean;
}

export interface SendNotificationEmailContext {
  members: EmailNotifyMemberDto[];
  subject: string;
  message: string;
  parentClubName: string;
  parentClubAdminEmail: string;
  parentClubIconUrl?: string;
  fromEmail: string;
  module?: string;
  purpose?: string;
  clubId?: string;
}
