import { CommonRestApiDto } from './common.model';

export interface OnboardingAdminInfo {
  clubName: string;
  primaryActivity: string;
  primaryActivityId: string;
  primaryActivityName: string;
  contactPersonName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface OnboardingClubAddress {
  country: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  postCode: string;
  countryName: string;
}

export interface OnboardingCoachDetails {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
}

export interface OnboardingClubInfo {
  clubAddress: OnboardingClubAddress;
  currency: string;
  clubTnC: string;
  coachDetails: OnboardingCoachDetails;
  termsAccepted: boolean;
}

export interface OnboardingAccountInformation {
  adminInformation: OnboardingAdminInfo;
  clubInformation: OnboardingClubInfo;
  appIconUrl: string;
  croppedImage: string;
}

export interface CreateParentClubPayload extends CommonRestApiDto {
  updated_by: string;
  created_by: string;
  parent_club_name: string;
  admin_email: string;
  admin_password: string;
  website: string;
  terms_url: string;
  app_icon_url: string;
  contact_name: string;
  contact_phone: string;
  corporate_address_firstline: string;
  corporate_address_secondline: string;
  corporate_address_city: string;
  corporate_address_state: string;
  currency_code: string;
  country_name: string;
  country: string;
  postcode: string;
  is_ap_play_enabled: boolean;
  is_superuser_parentclub: number;
  playground_switch: number;
  camp_notify_unenroll: boolean;
  android_version_switch: boolean;
  android_version: number;
  android_force_update: boolean;
  android_version_msg: string;
  android_app_link: string;
  ios_version_switch: boolean;
  ios_version: number;
  ios_force_update: boolean;
  ios_version_msg: string;
  ios_app_link: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  primaryColor: string;
  secondaryColor: string;
  short_name: string;
  coach_first_name: string;
  coach_last_name: string;
  coach_email: string;
  coach_gender: string;
  coach_password: string;
}
