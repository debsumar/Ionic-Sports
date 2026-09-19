// Request body for membership/getMembershipsByClub
export interface GetMembershipsByClubRequestDto {
  parentclub_id: string;
  club_id: string;
  start_date?: string;
  end_date?: string;
  action_type?: number;
  device_type?: number;
  app_type?: number;
  device_id?: string;
  updated_by?: string;
}

export interface MembershipByClubUserDto {
  Id: string;
  FirstName: string;
  LastName: string;
}

export interface MembershipByClubMembershipDto {
  id: string;
  membership_name: string;
}

// One membership package (enrollment) returned by the API
export interface MembershipByClubItemDto {
  id: string;
  amount: string;
  subscription_status: number;
  membership_status_text: string;
  membership_type_text: string;
  start_date: string;
  membership_expiry_date: string;
  user: MembershipByClubUserDto;
  membership: MembershipByClubMembershipDto;
}

export interface GetMembershipsByClubResponseDto {
  message: string;
  data: {
    paid_count: number;
    pending_count: number;
    paid: MembershipByClubItemDto[];
    pending: MembershipByClubItemDto[];
  };
}
