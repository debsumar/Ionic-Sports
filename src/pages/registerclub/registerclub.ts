import { Component } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera';
import { ActionSheetController, IonicPage, NavController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../services/common.service';
import { HttpService } from '../../services/http.service';
import { API } from '../../shared/constants/api_constants';
import { ONBOARDING_COUNTRIES, OnboardingCountry } from '../../shared/constants/country.constants';
import { ActionType, AppType, DeviceType } from '../../shared/constants/module.constants';
import { CommonRestApiDto } from '../../shared/model/common.model';
import {
  CreateParentClubPayload,
  OnboardingAccountInformation,
} from '../../shared/model/onboarding.model';
import { SharedServices } from '../services/sharedservice';
import { TeamImageUploadService } from '../type2/team/team_image_upload/team_image_upload.service';

interface OnboardingActivity {
  ActivityCode: string;
  ActivityId?: string;
  Id?: string;
  ActivityName: string;
}

interface ActivitiesResponse {
  data?: {
    activities?: OnboardingActivity[];
  };
}

interface EmailUniqueResponse {
  unique?: boolean;
  message?: string;
  data?: {
    unique?: boolean;
    message?: string;
  };
}

@IonicPage()
@Component({
  selector: 'page-registerclub',
  templateUrl: 'registerclub.html',
})
export class RegisterClub {
  private static readonly EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  private static readonly PHONE_FORMAT_REGEX = /^\+?[0-9]{7,15}$/;
  private static readonly URL_FORMAT_REGEX = /^https?:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:\d+)?([/?#][^\s]*)?$/i;
  private static readonly COACH_PASSWORD_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

  step: number = 1;
  activities: OnboardingActivity[] = [];
  countries: OnboardingCountry[] = ONBOARDING_COUNTRIES;
  genders: string[] = ['Male', 'Female', 'Others'];
  invalidField: string = null;
  stepOneSubmitted: boolean = false;
  stepTwoSubmitted: boolean = false;
  stepThreeSubmitted: boolean = false;
  uploadingLogo: boolean = false;
  submitting: boolean = false;

  accountInformation: OnboardingAccountInformation = {
    adminInformation: {
      clubName: '',
      primaryActivity: '',
      primaryActivityId: '',
      primaryActivityName: '',
      contactPersonName: '',
      phoneNumber: '',
      email: '',
      password: '',
    },
    clubInformation: {
      clubAddress: {
        country: 'GB',
        address: '',
        address2: '',
        city: '',
        state: '',
        postCode: '',
        countryName: 'United Kingdom',
      },
      currency: 'GBP',
      clubTnC: '',
      coachDetails: {
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
      },
      termsAccepted: false,
    },
    appIconUrl: '',
    croppedImage: '',
  };

  constructor(
    public navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private commonService: CommonService,
    private httpService: HttpService,
    private sharedservice: SharedServices,
    private imageUploadService: TeamImageUploadService,
  ) {}

  ionViewDidLoad() {
    this.getActivities();
  }

  getActivities() {
    this.httpService.get<ActivitiesResponse>(API.GET_ACTIVITIES, undefined, undefined, 1).subscribe(
      response => {
        this.activities = response && response.data && response.data.activities
          ? response.data.activities
          : [];
      },
      () => {
        this.commonService.toastMessage(
          'Unable to load activities. Please try again.',
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom,
        );
      },
    );
  }

  onActivityChange() {
    const admin = this.accountInformation.adminInformation;
    const selected = this.activities.find(activity => String(activity.ActivityCode) === String(admin.primaryActivity));
    admin.primaryActivityId = selected ? String(selected.ActivityId || selected.Id || '') : '';
    admin.primaryActivityName = selected ? selected.ActivityName : '';
  }

  onCountryChange() {
    const address = this.accountInformation.clubInformation.clubAddress;
    const selected = this.countries.find(country => country.code === address.country);
    if (selected) {
      address.countryName = selected.label;
      this.accountInformation.clubInformation.currency = selected.currency.code;
    }
  }

  onPhonePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData ? event.clipboardData.getData('text') : '';
    const cleaned = pasted.replace(/[^0-9+]/g, '');
    const current = String(this.accountInformation.adminInformation.phoneNumber || '');
    this.accountInformation.adminInformation.phoneNumber = current + cleaned;
  }

  nextFromAdmin() {
    this.stepOneSubmitted = true;
    this.invalidField = this.getFirstInvalidAdminField();
    if (this.invalidField) {
      this.showValidationToast();
      return;
    }

    const admin = this.accountInformation.adminInformation;
    admin.email = admin.email.replace(/^mailto:/i, '');
    this.onActivityChange();
    this.commonService.showLoader('Checking email...');
    this.checkEmailUnique(admin.email).subscribe(
      response => {
        this.commonService.hideLoader();
        if (this.isEmailUnavailable(response)) {
          this.commonService.toastMessage(
            'This email is already registered. Please use a different admin email.',
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom,
          );
          return;
        }
        this.goToStep(2);
      },
      () => {
        this.commonService.hideLoader();
        this.goToStep(2);
      },
    );
  }

  nextFromClubDetails() {
    this.stepTwoSubmitted = true;
    this.invalidField = this.getFirstInvalidClubField();
    if (this.invalidField) {
      this.showValidationToast();
      return;
    }
    if (this.uploadingLogo) {
      this.commonService.toastMessage(
        'Please wait for the logo upload to finish',
        2500,
        ToastMessageType.Info,
        ToastPlacement.Bottom,
      );
      return;
    }
    this.goToStep(3);
  }

  nextFromCoachDetails() {
    this.stepThreeSubmitted = true;
    this.invalidField = this.getFirstInvalidCoachField();
    if (this.invalidField) {
      this.showValidationToast();
      return;
    }

    const coach = this.accountInformation.clubInformation.coachDetails;
    coach.email = coach.email.replace(/^mailto:/i, '');
    this.commonService.showLoader('Checking coach email...');
    this.checkEmailUnique(coach.email).subscribe(
      response => {
        this.commonService.hideLoader();
        if (this.isEmailUnavailable(response)) {
          const message = response && response.data && response.data.message
            ? response.data.message
            : response && response.message
              ? response.message
              : 'Coach email already in use';
          this.commonService.toastMessage(message, 3500, ToastMessageType.Error, ToastPlacement.Bottom);
          return;
        }
        this.goToStep(4);
      },
      () => {
        this.commonService.hideLoader();
        this.goToStep(4);
      },
    );
  }

  submitRegistration() {
    if (!this.accountInformation.clubInformation.termsAccepted) {
      this.commonService.toastMessage(
        'You must accept the Terms and Conditions to continue',
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom,
      );
      return;
    }

    const missing = this.getMissingDetails();
    if (missing.length) {
      this.commonService.toastMessage(
        'Missing details: ' + missing.join(', '),
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom,
      );
      return;
    }

    this.submitting = true;
    this.commonService.showLoader('Creating your club account...');
    const payload = this.buildCreateParentClubPayload();
    this.httpService.post<any>(API.CREATE_PARENT_CLUB, payload, undefined, 1).subscribe(
      () => {
        this.commonService.hideLoader();
        this.submitting = false;
        this.goToStep(5);
        this.commonService.toastMessage(
          'Welcome onboard! Your Club App is ready.',
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom,
        );
      },
      error => {
        this.commonService.hideLoader();
        this.submitting = false;
        const message = this.getServerErrorMessage(error);
        const normalized = message.toLowerCase();
        const duplicate = normalized.indexOf('duplicate') !== -1
          || normalized.indexOf('unique constraint') !== -1
          || normalized.indexOf('already exists') !== -1;
        this.commonService.toastMessage(
          duplicate
            ? 'This admin email is already registered. Please use a different email address.'
            : message || 'Failed to create account. Please try again',
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom,
        );
      },
    );
  }

  selectLogo() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Choose club logo',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => this.captureLogo(this.camera.PictureSourceType.CAMERA),
        },
        {
          text: 'Gallery',
          icon: 'image',
          handler: () => this.captureLogo(this.camera.PictureSourceType.PHOTOLIBRARY),
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
        },
      ],
      cssClass: 'registerclub-action-sheet',
    });
    actionSheet.present();
  }

  captureLogo(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 70,
      // Native crop (allowEdit: true) relies on Android's generic
      // ACTION_CROP intent, which many gallery/photo-picker apps either
      // don't support or return a content URI the crop activity can't
      // read. That's why picking from "Gallery" shows a crop screen that
      // then fails, while apps like Google Photos skip crop entirely (no
      // matching activity) and the upload succeeds. Disabling allowEdit
      // avoids the unreliable native crop step for both camera and
      // gallery; targetWidth/targetHeight below still resize the image.
      allowEdit: false,
      targetWidth: 512,
      targetHeight: 512,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType,
    };

    this.camera.getPicture(options).then(
      imageData => {
        const dataUrl = imageData.indexOf('data:image/jpeg;base64,') === 0
          ? imageData
          : 'data:image/jpeg;base64,' + imageData;
        this.accountInformation.croppedImage = dataUrl;
        this.uploadLogo(dataUrl);
      },
      error => {
        console.error('[RegisterClub] captureLogo failed:', error);
        if (error !== 'No Image Selected') {
          this.commonService.toastMessage('Camera error: ' + this.describeUploadError(error), 4000, ToastMessageType.Error);
        }
      },
    );
  }

  removeLogo() {
    if (this.uploadingLogo) {
      return;
    }
    this.accountInformation.croppedImage = '';
    this.accountInformation.appIconUrl = '';
  }

  goBack() {
    if (this.step > 1 && this.step < 5) {
      this.goToStep(this.step - 1);
    } else {
      this.navCtrl.pop();
    }
  }

  goToLogin() {
    this.navCtrl.setRoot('Login');
  }

  isInvalid(field: string): boolean {
    return this.invalidField === field;
  }

  private uploadLogo(dataUrl: string) {
    this.uploadingLogo = true;
    this.accountInformation.appIconUrl = '';
    this.commonService.showLoader('Uploading image...');
    const fileName = 'club-logo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10) + '.jpg';

    console.log('[RegisterClub] uploadLogo: requesting presigned URL for', fileName);

    this.imageUploadService.getPresignedUrl(fileName, 'parentclub_logo', 'parentclub_logo').then(
      urls => {
        console.log('[RegisterClub] uploadLogo: presigned URL response', JSON.stringify(urls));
        const presignedUrl = urls && urls[0] ? urls[0].url : '';
        if (!presignedUrl) {
          throw new Error('Missing upload URL in presigned response: ' + JSON.stringify(urls));
        }
        return this.imageUploadService.uploadImage(presignedUrl, dataUrl);
      },
    ).then(() => {
        console.log('[RegisterClub] uploadLogo: upload succeeded');
        this.uploadingLogo = false;
        this.commonService.hideLoader();
        this.accountInformation.appIconUrl = this.sharedservice.getCloudfrontURL()
          + '/parent_club_logo/' + fileName;
        this.commonService.toastMessage('Image uploaded successfully', 2500, ToastMessageType.Success);
      },
      (error) => {
        this.uploadingLogo = false;
        this.commonService.hideLoader();
        this.accountInformation.croppedImage = '';
        this.accountInformation.appIconUrl = '';
        const debugMessage = this.describeUploadError(error);
        console.error('[RegisterClub] uploadLogo failed:', debugMessage, error);
        // Show the real failure reason on-device (no USB debugger needed) —
        // this is a temporary diagnostic toast, remove once the root cause
        // of the upload failure is fixed.
        this.commonService.toastMessage(
          'Upload failed: ' + debugMessage,
          3000,
          ToastMessageType.Error,
        );
      },
    );
  }

  /**
   * Builds a short, human-readable description of an upload failure for
   * on-device debugging (status code, URL, and any server-provided message),
   * since HttpClient errors are otherwise swallowed into a generic toast.
   */
  private describeUploadError(error: any): string {
    if (!error) {
      return 'Unknown error';
    }
    // Angular HttpErrorResponse shape
    if (typeof error === 'object' && ('status' in error || 'statusText' in error)) {
      const status = error.status !== undefined ? error.status : 'n/a';
      const statusText = error.statusText || '';
      const url = error.url ? ' @ ' + error.url : '';
      let serverMessage = '';
      if (error.error) {
        if (typeof error.error === 'string') {
          serverMessage = error.error;
        } else if (error.error.message) {
          serverMessage = error.error.message;
        } else {
          try {
            serverMessage = JSON.stringify(error.error);
          } catch (e) {
            serverMessage = '';
          }
        }
      }
      const parts = ['HTTP ' + status + (statusText ? ' ' + statusText : '') + url];
      if (serverMessage) {
        parts.push(serverMessage.substring(0, 200));
      }
      if (status === 0) {
        parts.push('(likely a network/CORS/SSL issue — device has no connectivity or the upload host rejected the request before responding)');
      }
      return parts.join(' — ');
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    try {
      return JSON.stringify(error).substring(0, 200);
    } catch (e) {
      return String(error);
    }
  }

  private getFirstInvalidAdminField(): string {
    const admin = this.accountInformation.adminInformation;
    if (!admin.clubName.trim()) { return 'clubName'; }
    if (!admin.primaryActivity) { return 'primaryActivity'; }
    if (!admin.contactPersonName.trim()) { return 'contactPersonName'; }
    if (!admin.phoneNumber) { return 'phoneNumber'; }
    if (!RegisterClub.PHONE_FORMAT_REGEX.test(String(admin.phoneNumber))) { return 'phoneNumber'; }
    if (!admin.email.trim()) { return 'adminEmail'; }
    if (!RegisterClub.EMAIL_FORMAT_REGEX.test(admin.email)) { return 'adminEmail'; }
    if (!admin.password.trim()) { return 'adminPassword'; }
    if (admin.password.length < 6) { return 'adminPassword'; }
    return null;
  }

  private getFirstInvalidClubField(): string {
    const club = this.accountInformation.clubInformation;
    const address = club.clubAddress;
    if (!address.country) { return 'country'; }
    if (!address.address.trim()) { return 'address'; }
    if (!address.state.trim()) { return 'state'; }
    if (!address.postCode.trim()) { return 'postCode'; }
    if (!club.clubTnC.trim()) { return 'clubTnC'; }
    if (!RegisterClub.URL_FORMAT_REGEX.test(club.clubTnC.trim())) { return 'clubTnC'; }
    return null;
  }

  private getFirstInvalidCoachField(): string {
    const coach = this.accountInformation.clubInformation.coachDetails;
    if (!coach.firstName.trim()) { return 'coachFirstName'; }
    if (!coach.lastName.trim()) { return 'coachLastName'; }
    if (!coach.email.trim()) { return 'coachEmail'; }
    if (!RegisterClub.EMAIL_FORMAT_REGEX.test(coach.email)) { return 'coachEmail'; }
    if (coach.email === this.accountInformation.adminInformation.email) { return 'coachEmail'; }
    if (!coach.gender) { return 'coachGender'; }
    return null;
  }

  private getMissingDetails(): string[] {
    const missing: string[] = [];
    const admin = this.accountInformation.adminInformation;
    const club = this.accountInformation.clubInformation;
    const address = club.clubAddress;
    const coach = club.coachDetails;
    if (!admin.clubName) { missing.push('Club Name'); }
    if (!admin.contactPersonName) { missing.push('Contact Person'); }
    if (!admin.email) { missing.push('Admin Email'); }
    if (!admin.phoneNumber) { missing.push('Phone Number'); }
    if (!admin.password) { missing.push('Password'); }
    if (!address.address) { missing.push('Address'); }
    if (!address.state) { missing.push('State/County'); }
    if (!address.postCode) { missing.push('Postcode'); }
    if (!address.country) { missing.push('Country'); }
    if (!club.currency) { missing.push('Currency'); }
    if (!club.clubTnC) { missing.push('T&C URL'); }
    if (!coach.firstName) { missing.push('Coach First Name'); }
    if (!coach.lastName) { missing.push('Coach Last Name'); }
    if (!coach.email) { missing.push('Coach Email'); }
    if (!coach.gender) { missing.push('Coach Gender'); }
    return missing;
  }

  private buildCommonPayload(): CommonRestApiDto {
    return {
      parentclubId: '',
      clubId: '',
      activityId: this.accountInformation.adminInformation.primaryActivityId,
      memberId: '',
      action_type: ActionType.CREATE,
      device_type: this.sharedservice.getPlatform() === 'android' ? DeviceType.ANDROID : DeviceType.IOS,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId(),
    };
  }

  private buildCreateParentClubPayload(): CreateParentClubPayload {
    const admin = this.accountInformation.adminInformation;
    const club = this.accountInformation.clubInformation;
    const address = club.clubAddress;
    const coach = club.coachDetails;
    const common = this.buildCommonPayload();
    return {
      parentclubId: common.parentclubId,
      clubId: common.clubId,
      activityId: common.activityId,
      memberId: common.memberId,
      action_type: common.action_type,
      device_type: common.device_type,
      app_type: common.app_type,
      device_id: common.device_id,
      updated_by: 'super_admin',
      created_by: 'super_admin',
      parent_club_name: admin.clubName,
      admin_email: admin.email,
      admin_password: admin.password,
      website: '',
      terms_url: club.clubTnC,
      app_icon_url: this.accountInformation.appIconUrl || '',
      contact_name: admin.contactPersonName,
      contact_phone: String(admin.phoneNumber),
      corporate_address_firstline: address.address,
      corporate_address_secondline: address.address2,
      corporate_address_city: address.city,
      corporate_address_state: address.state,
      currency_code: club.currency,
      country_name: address.countryName || address.country,
      country: address.country,
      postcode: address.postCode,
      is_ap_play_enabled: true,
      is_superuser_parentclub: 1,
      playground_switch: 0,
      camp_notify_unenroll: true,
      android_version_switch: true,
      android_version: 0,
      android_force_update: true,
      android_version_msg: 'There is a new version of the app available',
      android_app_link: '',
      ios_version_switch: true,
      ios_version: 0,
      ios_force_update: true,
      ios_version_msg: 'There is a new version of the app available',
      ios_app_link: '',
      facebook_url: '',
      instagram_url: '',
      twitter_url: '',
      linkedin_url: '',
      primaryColor: '#dc2626',
      secondaryColor: '#ffffff',
      short_name: this.deriveShortName(admin.clubName),
      coach_first_name: coach.firstName,
      coach_last_name: coach.lastName,
      coach_email: coach.email,
      coach_gender: coach.gender,
      coach_password: this.generateCoachPassword(),
    };
  }

  private checkEmailUnique(email: string) {
    const payload: CommonRestApiDto & { email: string } = {
      email,
      parentclubId: '',
      clubId: '',
      activityId: '',
      memberId: '',
      action_type: ActionType.CREATE,
      device_type: this.sharedservice.getPlatform() === 'android' ? DeviceType.ANDROID : DeviceType.IOS,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId(),
    };
    return this.httpService.post<EmailUniqueResponse>(API.CHECK_EMAIL_UNIQUE, payload, undefined, 1);
  }

  private isEmailUnavailable(response: EmailUniqueResponse): boolean {
    return !!(response && (
      response.unique === false
      || (response.data && response.data.unique === false)
    ));
  }

  private showValidationToast() {
    this.commonService.toastMessage(
      'Please correct the highlighted fields',
      3000,
      ToastMessageType.Error,
      ToastPlacement.Bottom,
    );
  }

  private goToStep(step: number) {
    this.step = step;
    this.invalidField = null;
  }

  private deriveShortName(clubName: string): string {
    return (clubName || '').trim().slice(0, 20).trim();
  }

  private generateCoachPassword(): string {
    let password = '';
    for (let index = 0; index < 8; index++) {
      const randomIndex = Math.floor(Math.random() * RegisterClub.COACH_PASSWORD_ALPHABET.length);
      password += RegisterClub.COACH_PASSWORD_ALPHABET.charAt(randomIndex);
    }
    return password;
  }

  private getServerErrorMessage(error: any): string {
    if (error && error.error && error.error.message) {
      return String(error.error.message);
    }
    if (error && error.message) {
      return String(error.message);
    }
    return '';
  }
}
