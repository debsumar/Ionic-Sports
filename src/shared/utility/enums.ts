export enum LeagueParticipationStatus {
    PENDING = 0, //remaing players
    PARTICIPANT = 1, //playing squad
    NON_PARTICIPANT = 2,//bench
    EXTRA = 3,
    INJURED = 4
}
export enum LeaguePlayerInviteStatus {
    // PENDING = 0,
    // ACCEPTED = 1,
    // REJECTED = 2,
    // CANCELLED = 3,
    // ADMIN_ACCEPTED = 4,
    // ADMIN_REJECTED = 5,
    // ADMIN_CANCELLED = 6,
    // ADMIN_DELETED = 7,
    // MAYBE = 8,
    // ADMIN_MAYBE = 9
    Pending = 0,
    Accepted = 1,       // Playing
    Rejected = 2,       // Not playing
    Cancelled = 3,
    AdminAccepted = 4,  // Playing
    AdminRejected = 5,  // Not playing
    AdminCancelled = 6,
    AdminDeleted = 7,
    Maybe = 8,
    AdminMaybe = 9
}

export enum LeagueTeamPlayerStatusType {
    All = 0, //added here to get all players, not present in backend code
    PLAYING = 1,
    BENCH = 2,
    EXTRA = 3,
    PLAYINGPLUSBENCH = 4, // combine both 1 & 2
}

export enum LeagueVenueType {
    Club = 1,
    Location = 2,
    School = 3,
}

export enum LeagueMatchActionType {
    LEAGUE = 0,
    MATCH = 1,
}

export enum MatchType {
    SINGLES = 0,
    DOUBLES = 1,
    TEAM = 2,
}

export enum ActivityTypeEnum {
    TENNIS = 1001,
    FOOTBALL = 1002,
    CRICKET = 1015,
}