// 👤 Interface for the User details within a Participant
export interface ParticipantUser {
    FirstName: string;
    LastName: string;
    FirebaseKey: string;
}

// 🧑‍🤝‍🧑 Interface for a Participant within a Team
export interface MatchParticipant {
    User: ParticipantUser; // 👤 Nested User details
}

// ⚽ Interface for the Activity details within a Match
export interface MatchActivity {
    Id: string;
    ActivityName: string;
}

// 🧑‍🏫 Interface for a Host within a Match
export interface MatchHost {
    Name: string;
    User: UserModel
}

// 🏈 Interface for a Team within a Match
export interface MatchTeam {
    Id: string;
    TeamName: string;
    TeamPoint: number;
    ResultStatus: number; // 📊 Status of the team's result in the match
    Participants: MatchParticipant[]; // 🧑‍🤝‍🧑 Array of participants in the team
}
export class ResultModel {
    CreatedAt: string; // 📅 Timestamp of when the result was created
    resultDescription: string; // 📝 Description of the match result
    ResultDetails: string;
    ResultStatus: number;
    PublishedByApp: string;
    Winner: TeamModel;
}
export class TeamModel {
    Id: string;
    TeamName: string;
    ResultStatus: number;
    TeamPoint: number;
    Description: string;
    CoachName: string;
    Participants: ParticipantModel[];
}

export class ParticipantModel {
    ParticipationStatus: number;
    PaymentStatus: number;
    PaymentTracking: string;
    InviteStatus: number;
    TotalPoints: number;
    User: UserModel;
    CreatedAt: string;
    UpdatedAt: string;
    InviteType: number;
    TotalPonumbers: number;
    Team: TeamModel[];
    Match: MatchModelV2;
}
export class UserModel {
    Id: string;
    FirstName: string;
    LastName: string;
    Gender: string;
    DOB: string;
    FirebaseKey?: string;
}

// 🏟️ Interface for a single Match object
export interface MatchModelV2 {
    Id: string;
    IsActive: boolean;
    IsEnable: boolean;
    CreatedAt: string; // 📅 Timestamp string
    CreatedBy: string;
    Activity: MatchActivity; // ⚽ Nested Activity details
    Result: ResultModel; // 🏆 Match result (type unknown, can be null)
    MatchVisibility: number; // 👁️ Visibility status (e.g., 0 for public)
    GameType: number; // 🎮 Type of game
    MatchType: number; // 🏅 Type of match (e.g., 2)
    PaymentType: number; // 💰 Payment status
    ResultStatus: number; // 📊 Overall match result status
    MatchStatus: number; // 🚦 Current status of the match
    VenueName: string; // 📍 Name of the venue
    Details: string; // 📝 Additional details
    MatchStartDate: string; // 📅 Start date and time string (YYYY-MM-DD HH:mm)
    Capacity: number; // 🧑‍ Capacity of the match
    MatchTitle: string; // 📛 Title of the match
    Hosts: MatchHost[]; // 🧑‍🏫 Array of hosts
    Teams: MatchTeam[]; // 🏈 Array of participating teams
}
