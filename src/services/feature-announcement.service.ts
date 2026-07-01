import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpService } from "./http.service";
import { API } from "../shared/constants/api_constants";

export interface FeatureAnnouncement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge_text: string;
  display_order: number;
}

export interface GetActiveResponse {
  show_modal: boolean;
  features: FeatureAnnouncement[];
}

@Injectable()
export class FeatureAnnouncementService {
  constructor(private httpService: HttpService) {}

  // HttpService.post defaults to type 1 => environment.new_http_url
  getActive(parentclubId: string): Observable<GetActiveResponse> {
    return this.httpService.post<GetActiveResponse>(
      API.GET_FEATURE_ANNOUNCEMENTS,
      { parentclub_id: parentclubId }
    );
  }

  markShown(parentclubId: string, featureIds: string[]): Observable<any> {
    return this.httpService.post(
      API.MARK_FEATURE_ANNOUNCEMENT_SHOWN,
      { parentclub_id: parentclubId, feature_ids: featureIds }
    );
  }

  suppress(parentclubId: string): Observable<any> {
    return this.httpService.post(
      API.SUPPRESS_FEATURE_ANNOUNCEMENT,
      { parentclub_id: parentclubId }
    );
  }
}
