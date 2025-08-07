import { SrvRecord } from "dns"

export interface CreateLeagueMatchInput {
    MatchName: string
    CreatedBy: string
    LeagueId: string
    GroupId: string
    EndDate: string
    Stage: number
    Round: number
    MatchVisibility: number
    MatchDetails: string
    StartDate: string
    MatchPaymentType: number
    primary_participant_id: string
    secondary_participant_id: string
    location_id: string
    location_type: number
    user_postgre_metadata: UserPostgreMetadataField
    user_device_metadata: UserDeviceMetadataField
}

export interface UserPostgreMetadataField {
    UserParentClubId: string
    UserActivityId: string
}

export interface UserDeviceMetadataField {
    UserAppType: number
    UserActionType: number
    UserDeviceType: number
}

export interface LeagueGroup {
    id: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean

    name: string
    description: string
}

export interface LeagueGroupInput {
    ParentClubKey: string
    ParentClubId: string
    ClubKey: string
    ClubId: string
    MemberKey: string
    MemberId: string
    AppType: number
    ActionType: number
    DeviceType: number
    leagueId: string
}

export interface CoachList {
    Id: string
    first_name: string
    last_name: string
    phone_no: string
    email_id: string
}

export interface SchoolList {
    id: string
    school_name: string
}