// 🏆 Main League Result Model
export class LeagueResultModel {
  Id: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  UpdatedBy: string;
  IsActive: boolean;
  IsEnable: boolean;
  ResultDetails: string;
  resultDescription: string;
  ResultStatus: number;
  PublishedByApp: string;
  result_json: string;
  league_fixtures: LeagueFixtureInfo;
  Match?: any;
  Winner?: any;
  winner_league_participation?: any;
  loser_league_participation?: any;
}
export interface ResultJson {
  TeamStats?: FootballResultModel; // 📊 Contains the football match statistics
}

// }
// 🏟️ League Fixture Info (for league_fixtures field)
export class LeagueFixtureInfo {
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  deleted_at?: string | null;
  updated_by: string;
  is_active: boolean;
  result?: any;
  round: number;
  location_type: number;
  location_id: string;
}

// 🏟️ Football Match Result Model

export interface FootballScoreDetail {
  PLAYER?: string;
  TIME?: string;
}

export interface FootballTeamStats {
  Goal?: string;
  SHOTS?: string;
  SHOTS_ON_GOAL?: string;
  CORNERS?: string;
  FOULS_COMMITTED?: string;
  OFFSIDES?: string;
  BALL_POSSESSION?: string;
  YELLOW_CARD?: string;
  RED_CARD?: string;
  SCORE?: FootballScoreDetail[];
}

export interface FootballPOTM {
  PLAYER?: string;
}

export interface FootballResultModel {
  POTM?: string;
  // POTM?: FootballPOTM[];
  Team1?: FootballTeamStats;
  Team2?: FootballTeamStats;
}

