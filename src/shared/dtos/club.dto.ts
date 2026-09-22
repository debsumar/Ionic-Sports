// DTO for GetParentClubVenues API request
export interface GetParentClubVenuesRequestDto {
  parentclub_id: string;
  app_type: number;
  device_type: number;
  device_id: string;
  updated_by: string;
}

// DTO for GetParentClubVenues API response
export interface GetParentClubVenuesResponseDto {
  status: number;
  message: string;
  data: ClubVenueDto[];
}

export interface ClubVenueDto {
  Id: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  UpdatedBy: string;
  IsActive: boolean;
  IsEnable: boolean;
  City: string;
  ClubContactName: string;
  ClubName: string;
  ContactPhone: string | null;
  ClubShortName: string;
  CountryName: string;
  FirstLineAddress: string;
  SecondLineAddress: string | null;
  MapUrl: string;
  ClubDescription: string;
  sequence: number;
  PostCode: string;
  FirebaseId: string;
  State: string;
  MapLatitude: string;
  MapLongitude: string;
  shop_pickup_location: number;
  visible_at_signup: number;
}

/** A court as returned by courtbooking/getAllCourts ("All Courts in a venue"). */
export interface CourtDto {
  firebasekey: string;
  CourtName: string;
  CourtType: string;
  ActivityKey: string;
  ActivityName: string;
  ClubKey: string;
  ClubName: string;
  ParentClubkey: string;
  Comments: string;
  Days: string;
  StartTime: string;
  EndTime: string;
  Surface: string;
  SurfaceCode: number;
  Shared: string;
  FloodLight: string;
  FloodLightCostForMember: string;
  FloodLightCostForNonMember: string;
  BookedTime: string;
  BookingInFo: string;
  IsActive: boolean;
  IsEnable: boolean;
  Status: boolean;
  CreatedDate: string;
  UpdatedDate: string;
}

export interface GetAllCourtsResponseDto {
  status: number;
  message: string;
  data: CourtDto[];
  type: string;
}
