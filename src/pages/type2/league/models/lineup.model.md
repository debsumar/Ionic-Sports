# Lineup Data Model Documentation

This document describes the data models used for the **LineupPage** feature, which allows users to create and manage football team formations.

---

## Table of Contents

1. [Interfaces](#interfaces)
   - [ApiPosition](#apiposition)
   - [TeamFormation](#teamformation)
   - [TeamFormationsApiResponse](#teamformationsapiresponse)
   - [Player](#player)
   - [PlayerPosition](#playerposition)
   - [Formation](#formation)
   - [TeamSizeFormation](#teamsizeformation)
2. [Constants](#constants)
   - [TEAM_SIZES](#team_sizes)
3. [API Documentation](#api-documentation)
   - [Get Team Formations API](#get-team-formations-api)
   - [Save Team Formation API](#save-team-formation-api)
   - [Get Match Participants API](#get-match-participants-api)
4. [JSON Examples](#json-examples)

---

## Interfaces

### ApiPosition

Position data as received from the backend API.

| Property   | Type              | Required | Description                                  |
|------------|-------------------|----------|----------------------------------------------|
| `x`        | `number`          | Yes      | Horizontal position (0-100)                  |
| `y`        | `number`          | Yes      | Vertical position (0-100)                    |
| `role`     | `string`          | Yes      | Position role (e.g., GK, ST)                 |
| `playerid` | `string \| null`  | No       | ID of assigned player (if any)               |

**TypeScript Definition:**
```typescript
export interface ApiPosition {
    x: number;
    y: number;
    role: string;
    playerid?: string | null;
}
```

---

### TeamFormation

A formation template as returned by the API.

| Property         | Type            | Required | Description                               |
|------------------|-----------------|----------|-------------------------------------------|
| `id`             | `string`        | Yes      | Unique identifier for the formation       |
| `formation_name` | `string`        | Yes      | Display name (e.g., "4-4-2")              |
| `team_size`      | `number`        | Yes      | Number of players (5, 6, 7, 8, 9, 11)     |
| `positions`      | `ApiPosition[]` | Yes      | Array of positions defined for this formation |
| `activity_id`    | `string`        | Yes      | Associated activity ID                    |

**TypeScript Definition:**
```typescript
export interface TeamFormation {
    id: string;
    formation_name: string;
    team_size: number;
    positions: ApiPosition[];
    activity_id: string;
}
```

---

### TeamFormationsApiResponse

Wrapper for the team formations list response.

**TypeScript Definition:**
```typescript
export interface TeamFormationsApiResponse {
    status: number;
    message: string;
    data: TeamFormation[];
    type: string;
    isArray: boolean;
}
```

---

### Player

Represents a player in the system.

| Property | Type     | Required | Description                        |
|----------|----------|----------|------------------------------------|
| `playerid` | `string` | Yes      | Unique identifier for the player   |
| `name`     | `string` | Yes      | Full name of the player            |
| `image`    | `string` | No       | URL to the player's profile image  |

**TypeScript Definition:**
```typescript
export interface Player {
    playerid: string;
    name: string;
    image?: string;
}
```

**JSON Example:**
```json
{
    "playerid": "5",
    "name": "Harry Kane",
    "image": "https://i.pravatar.cc/150?u=5"
}
```

---

### PlayerPosition

Represents a player's position on the football pitch. Coordinates are percentages (0-100) from the top-left corner.

| Property | Type              | Required | Description                                      |
|----------|-------------------|----------|--------------------------------------------------|
| `role`     | `string`          | Yes      | Position role code (e.g., GK, CB, ST)            |
| `x`        | `number`          | Yes      | Horizontal position (0 = left, 100 = right)      |
| `y`        | `number`          | Yes      | Vertical position (0 = top, 100 = bottom)        |
| `playerid` | `string \| null`  | No       | The ID of the player currently assigned to this position |
| `image`    | `string \| null`  | No       | URL to the player's profile image                |
| `player`   | `Player \| null`  | No       | Full player object for UI rendering              |

**TypeScript Definition:**
```typescript
export interface PlayerPosition {
    role: string;
    x: number;
    y: number;
    playerid?: string | null;
    image?: string | null;
    player?: Player | null;
}
```

**JSON Example:**
```json
{
    "role": "GK",
    "x": 50,
    "y": 92,
    "playerid": "12",
    "image": "https://i.pravatar.cc/150?u=12"
}
```

**Position Role Codes:**

| Code   | Full Name              |
|--------|------------------------|
| `GK`   | Goalkeeper             |
| `LB`   | Left Back              |
| `RB`   | Right Back             |
| `CB`   | Center Back            |
| `LCB`  | Left Center Back       |
| `RCB`  | Right Center Back      |
| `LWB`  | Left Wing Back         |
| `RWB`  | Right Wing Back        |
| `LM`   | Left Midfielder        |
| `RM`   | Right Midfielder       |
| `CM`   | Center Midfielder      |
| `LCM`  | Left Center Midfielder |
| `RCM`  | Right Center Midfielder|
| `LW`   | Left Winger            |
| `RW`   | Right Winger           |
| `ST`   | Striker                |
| `LS`   | Left Striker           |
| `RS`   | Right Striker          |

---

### Formation

Represents a single formation configuration for a specific team size.

| Property    | Type               | Required | Description                               |
|-------------|--------------------|----------|-------------------------------------------|
| `id`             | `string`           | Yes      | Unique identifier for the formation       |
| `formation_name` | `string`           | Yes      | Formation name (e.g., "4-4-2", "1-3-2")   |
| `positions`      | `PlayerPosition[]` | Yes      | Array of player positions for this formation |

**TypeScript Definition:**
```typescript
export interface Formation {
    id: string;
    formation_name: string;
    positions: PlayerPosition[];
}
```

**JSON Example (Saved Lineup):**
```json
{
    "id": "4-4-2",
    "name": "4-4-2",
    "is_saved": true,
    "positions": [
        { "role": "GK", "x": 50, "y": 92, "playerid": "uuid", "image": "..." },
        { "role": "LB", "x": 15, "y": 75, "playerid": "uuid", "image": "..." },
        { "role": "LCB", "x": 38, "y": 78, "playerid": "uuid", "image": "..." },
        { "role": "RCB", "x": 62, "y": 78, "playerid": "uuid", "image": "..." },
        { "role": "RB", "x": 85, "y": 75, "playerid": "uuid", "image": "..." },
        { "role": "LM", "x": 15, "y": 50, "playerid": "uuid", "image": "..." },
        { "role": "LCM", "x": 38, "y": 50, "playerid": "uuid", "image": "..." },
        { "role": "RCM", "x": 62, "y": 50, "playerid": "uuid", "image": "..." },
        { "role": "RM", "x": 85, "y": 50, "playerid": "uuid", "image": "..." },
        { "role": "LS", "x": 35, "y": 18, "playerid": "uuid", "image": "..." },
        { "role": "RS", "x": 65, "y": 18, "playerid": "uuid", "image": "..." }
    ]
}
```

---

### TeamSizeFormation

Maps a team size to its available formations.

| Property     | Type          | Required | Description                                  |
|--------------|---------------|----------|----------------------------------------------|
| `teamSize`   | `number`      | Yes      | Number of players in the team (5, 6, 7, etc.)|
| `formations` | `Formation[]` | Yes      | Array of available formations for this size  |

**TypeScript Definition:**
```typescript
export interface TeamSizeFormation {
    teamSize: number;
    formations: Formation[];
}
```

**JSON Example:**
```json
{
    "teamSize": 7,
    "formations": [
        {
            "id": "1-3-2",
            "name": "1-3-2",
            "positions": [
                { "role": "GK", "x": 50, "y": 92 },
                { "role": "CB", "x": 50, "y": 72 },
                { "role": "LM", "x": 20, "y": 50 },
                { "role": "CM", "x": 50, "y": 50 },
                { "role": "RM", "x": 80, "y": 50 },
                { "role": "LW", "x": 35, "y": 20 },
                { "role": "RW", "x": 65, "y": 20 }
            ]
        },
        {
            "id": "2-3-1",
            "name": "2-3-1",
            "positions": [
                { "role": "GK", "x": 50, "y": 92 },
                { "role": "LB", "x": 30, "y": 72 },
                { "role": "RB", "x": 70, "y": 72 },
                { "role": "LM", "x": 20, "y": 45 },
                { "role": "CM", "x": 50, "y": 45 },
                { "role": "RM", "x": 80, "y": 45 },
                { "role": "ST", "x": 50, "y": 15 }
            ]
        }
    ]
}
```

---

## Constants

### TEAM_SIZES

An array of available team sizes for the lineup creator.

```typescript
export const TEAM_SIZES: number[] = [5, 6, 7, 8, 9, 11];
```

**JSON:**
```json
[5, 6, 7, 8, 9, 11]
```

---

### FORMATION_DATA

The complete formation data containing all team sizes and their available formations.

**Structure:** `TeamSizeFormation[]`

**Available Formations by Team Size:**

| Team Size | Available Formations (Examples) |
|-----------|--------------------------------|
| 5         | 1-2-1, 2-1-1, 1-1-2            |
| 6         | 1-2-2, 2-2-1, 1-3-1            |
| 7         | 1-3-2, 2-3-1, 1-2-3            |
| 8         | 1-3-3, 2-3-2, 3-2-2            |
| 9         | 1-3-4, 2-4-2, 3-3-2            |
| 11        | 4-4-2, 4-3-3, 3-5-2            |

> **Note:** Formations are dynamically fetched from the backend based on `teamSize`. The above list represents typical configurations.

**Full JSON Data:**
```json
[
    {
        "teamSize": 5,
        "formations": [
            {
                "id": "1-2-1",
                "name": "1-2-1",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 25, "y": 65 },
                    { "role": "RB", "x": 75, "y": 65 },
                    { "role": "CM", "x": 50, "y": 40 },
                    { "role": "ST", "x": 50, "y": 15 }
                ]
            },
            {
                "id": "2-1-1",
                "name": "2-1-1",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 30, "y": 70 },
                    { "role": "RB", "x": 70, "y": 70 },
                    { "role": "CM", "x": 50, "y": 45 },
                    { "role": "ST", "x": 50, "y": 15 }
                ]
            },
            {
                "id": "1-1-2",
                "name": "1-1-2",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "CB", "x": 50, "y": 70 },
                    { "role": "CM", "x": 50, "y": 45 },
                    { "role": "LW", "x": 30, "y": 15 },
                    { "role": "RW", "x": 70, "y": 15 }
                ]
            }
        ]
    },
    {
        "teamSize": 6,
        "formations": [
            {
                "id": "1-2-2",
                "name": "1-2-2",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "CB", "x": 50, "y": 72 },
                    { "role": "LM", "x": 25, "y": 50 },
                    { "role": "RM", "x": 75, "y": 50 },
                    { "role": "LW", "x": 30, "y": 15 },
                    { "role": "RW", "x": 70, "y": 15 }
                ]
            },
            {
                "id": "2-2-1",
                "name": "2-2-1",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 30, "y": 72 },
                    { "role": "RB", "x": 70, "y": 72 },
                    { "role": "LM", "x": 30, "y": 45 },
                    { "role": "RM", "x": 70, "y": 45 },
                    { "role": "ST", "x": 50, "y": 15 }
                ]
            },
            {
                "id": "1-3-1",
                "name": "1-3-1",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "CB", "x": 50, "y": 72 },
                    { "role": "LM", "x": 20, "y": 45 },
                    { "role": "CM", "x": 50, "y": 45 },
                    { "role": "RM", "x": 80, "y": 45 },
                    { "role": "ST", "x": 50, "y": 15 }
                ]
            }
        ]
    },
    {
        "teamSize": 7,
        "formations": [
            {
                "id": "1-3-2",
                "name": "1-3-2",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "CB", "x": 50, "y": 72 },
                    { "role": "LM", "x": 20, "y": 50 },
                    { "role": "CM", "x": 50, "y": 50 },
                    { "role": "RM", "x": 80, "y": 50 },
                    { "role": "LW", "x": 35, "y": 20 },
                    { "role": "RW", "x": 65, "y": 20 }
                ]
            },
            {
                "id": "2-3-1",
                "name": "2-3-1",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 30, "y": 72 },
                    { "role": "RB", "x": 70, "y": 72 },
                    { "role": "LM", "x": 20, "y": 45 },
                    { "role": "CM", "x": 50, "y": 45 },
                    { "role": "RM", "x": 80, "y": 45 },
                    { "role": "ST", "x": 50, "y": 15 }
                ]
            },
            {
                "id": "1-2-3",
                "name": "1-2-3",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "CB", "x": 50, "y": 72 },
                    { "role": "LM", "x": 30, "y": 50 },
                    { "role": "RM", "x": 70, "y": 50 },
                    { "role": "LW", "x": 20, "y": 20 },
                    { "role": "ST", "x": 50, "y": 15 },
                    { "role": "RW", "x": 80, "y": 20 }
                ]
            }
        ]
    },
    {
        "teamSize": 8,
        "formations": [
            {
                "id": "1-3-3",
                "name": "1-3-3",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "CB", "x": 50, "y": 75 },
                    { "role": "LM", "x": 20, "y": 55 },
                    { "role": "CM", "x": 50, "y": 55 },
                    { "role": "RM", "x": 80, "y": 55 },
                    { "role": "LW", "x": 20, "y": 20 },
                    { "role": "ST", "x": 50, "y": 15 },
                    { "role": "RW", "x": 80, "y": 20 }
                ]
            },
            {
                "id": "2-3-2",
                "name": "2-3-2",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 30, "y": 75 },
                    { "role": "RB", "x": 70, "y": 75 },
                    { "role": "LM", "x": 20, "y": 50 },
                    { "role": "CM", "x": 50, "y": 50 },
                    { "role": "RM", "x": 80, "y": 50 },
                    { "role": "LW", "x": 35, "y": 18 },
                    { "role": "RW", "x": 65, "y": 18 }
                ]
            },
            {
                "id": "3-2-2",
                "name": "3-2-2",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 20, "y": 75 },
                    { "role": "CB", "x": 50, "y": 75 },
                    { "role": "RB", "x": 80, "y": 75 },
                    { "role": "LM", "x": 30, "y": 50 },
                    { "role": "RM", "x": 70, "y": 50 },
                    { "role": "LW", "x": 35, "y": 18 },
                    { "role": "RW", "x": 65, "y": 18 }
                ]
            }
        ]
    },
    {
        "teamSize": 9,
        "formations": [
            {
                "id": "1-3-4",
                "name": "1-3-4",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "CB", "x": 50, "y": 78 },
                    { "role": "LM", "x": 20, "y": 58 },
                    { "role": "CM", "x": 50, "y": 58 },
                    { "role": "RM", "x": 80, "y": 58 },
                    { "role": "LW", "x": 15, "y": 25 },
                    { "role": "LS", "x": 38, "y": 18 },
                    { "role": "RS", "x": 62, "y": 18 },
                    { "role": "RW", "x": 85, "y": 25 }
                ]
            },
            {
                "id": "2-4-2",
                "name": "2-4-2",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 30, "y": 78 },
                    { "role": "RB", "x": 70, "y": 78 },
                    { "role": "LM", "x": 15, "y": 50 },
                    { "role": "LCM", "x": 38, "y": 50 },
                    { "role": "RCM", "x": 62, "y": 50 },
                    { "role": "RM", "x": 85, "y": 50 },
                    { "role": "LS", "x": 35, "y": 18 },
                    { "role": "RS", "x": 65, "y": 18 }
                ]
            },
            {
                "id": "3-3-2",
                "name": "3-3-2",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 20, "y": 78 },
                    { "role": "CB", "x": 50, "y": 78 },
                    { "role": "RB", "x": 80, "y": 78 },
                    { "role": "LM", "x": 20, "y": 50 },
                    { "role": "CM", "x": 50, "y": 50 },
                    { "role": "RM", "x": 80, "y": 50 },
                    { "role": "LS", "x": 35, "y": 18 },
                    { "role": "RS", "x": 65, "y": 18 }
                ]
            }
        ]
    },
    {
        "teamSize": 11,
        "formations": [
            {
                "id": "4-4-2",
                "name": "4-4-2",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 15, "y": 75 },
                    { "role": "LCB", "x": 38, "y": 78 },
                    { "role": "RCB", "x": 62, "y": 78 },
                    { "role": "RB", "x": 85, "y": 75 },
                    { "role": "LM", "x": 15, "y": 50 },
                    { "role": "LCM", "x": 38, "y": 50 },
                    { "role": "RCM", "x": 62, "y": 50 },
                    { "role": "RM", "x": 85, "y": 50 },
                    { "role": "LS", "x": 35, "y": 18 },
                    { "role": "RS", "x": 65, "y": 18 }
                ]
            },
            {
                "id": "4-3-3",
                "name": "4-3-3",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LB", "x": 15, "y": 75 },
                    { "role": "LCB", "x": 38, "y": 78 },
                    { "role": "RCB", "x": 62, "y": 78 },
                    { "role": "RB", "x": 85, "y": 75 },
                    { "role": "LCM", "x": 30, "y": 50 },
                    { "role": "CM", "x": 50, "y": 50 },
                    { "role": "RCM", "x": 70, "y": 50 },
                    { "role": "LW", "x": 20, "y": 22 },
                    { "role": "ST", "x": 50, "y": 15 },
                    { "role": "RW", "x": 80, "y": 22 }
                ]
            },
            {
                "id": "3-5-2",
                "name": "3-5-2",
                "positions": [
                    { "role": "GK", "x": 50, "y": 92 },
                    { "role": "LCB", "x": 25, "y": 78 },
                    { "role": "CB", "x": 50, "y": 78 },
                    { "role": "RCB", "x": 75, "y": 78 },
                    { "role": "LWB", "x": 10, "y": 55 },
                    { "role": "LCM", "x": 35, "y": 50 },
                    { "role": "CM", "x": 50, "y": 45 },
                    { "role": "RCM", "x": 65, "y": 50 },
                    { "role": "RWB", "x": 90, "y": 55 },
                    { "role": "LS", "x": 35, "y": 18 },
                    { "role": "RS", "x": 65, "y": 18 }
                ]
            }
        ]
    }
]
```

---

### DUMMY_PLAYERS

Sample player data for testing and demonstration.

**JSON:**
```json
[
    { "playerid": "1", "name": "Teddy James", "image": "https://i.pravatar.cc/150?u=1" },
    { "playerid": "2", "name": "Charlie Messham", "image": "https://i.pravatar.cc/150?u=2" },
    { "playerid": "3", "name": "Joshua Peter", "image": "https://i.pravatar.cc/150?u=3" },
    { "playerid": "4", "name": "Mason Mount", "image": "https://i.pravatar.cc/150?u=4" },
    { "playerid": "5", "name": "Harry Kane", "image": "https://i.pravatar.cc/150?u=5" },
    { "playerid": "6", "name": "Phil Foden", "image": "https://i.pravatar.cc/150?u=6" },
    { "playerid": "7", "name": "Bukayo Saka", "image": "https://i.pravatar.cc/150?u=7" },
    { "playerid": "8", "name": "Declan Rice", "image": "https://i.pravatar.cc/150?u=8" },
    { "playerid": "9", "name": "Jude Bellingham", "image": "https://i.pravatar.cc/150?u=9" },
    { "playerid": "10", "name": "Kyle Walker", "image": "https://i.pravatar.cc/150?u=10" },
    { "playerid": "11", "name": "John Stones", "image": "https://i.pravatar.cc/150?u=11" },
    { "playerid": "12", "name": "Jordan Pickford", "image": "https://i.pravatar.cc/150?u=12" }
]
```

---

### DUMMY_SUBSTITUTES

Sample substitute player data.

**JSON:**
```json
[
    { "playerid": "13", "name": "Dylan D", "image": "https://i.pravatar.cc/150?u=13" },
    { "playerid": "14", "name": "Seth Pr", "image": "https://i.pravatar.cc/150?u=14" },
    { "playerid": "15", "name": "Wesley", "image": "https://i.pravatar.cc/150?u=15" }
]
```

---

## API Documentation

This section documents the primary APIs used by the Lineup feature.

---

### Get Team Formations API

**Endpoint:** `POST /api/team_formations`

**Description:** Fetches available formation templates for a specific team size.

**Request Payload:**
```json
{
    "activityId": "d47c2ac4-e571-488f-a895-c1940726900f",
    "teamSize": 5,
    "matchId": "", // Empty if creating new formation
    "teamId": ""   // Empty if creating new formation
}
```

**Success Response (Example):**
```json
{
    "status": 200,
    "message": "Success",
    "data": [
        {
            "id": "uuid-123",
            "formation_name": "1-2-1",
            "team_size": 5,
            "positions": [
                { "role": "GK", "x": 50, "y": 92 },
                { "role": "LB", "x": 25, "y": 65 },
                { "role": "RB", "x": 75, "y": 65 },
                { "role": "CM", "x": 50, "y": 40 },
                { "role": "ST", "x": 50, "y": 15 }
            ],
            "activity_id": "d47c2ac4-e571-488f-a895-c1940726900f"
        }
    ]
}
```

---

### Save Team Formation API

**Endpoint:** `POST /api/save_team_formation`

**Description:** Saves or updates a team lineup configuration.

**Request Payload:**
```json
{
    "matchId": "match_001",
    "leagueId": "", 
    "teamId": "team_001",
    "lineup_name": "Starting line-up",
    "visibility": "All invitees",
    "teamSize": 5,
    "formation": "uuid-123",
    "positions": "[{\"role\":\"GK\",\"x\":50,\"y\":92,\"playerid\":\"p1\",\"image\":\"...\"},...]", // Stringified JSON
    "substitutes": "[{\"playerid\":\"s1\",\"name\":\"Dylan D\",\"image\":\"...\"},...]", // Stringified JSON
    "createdBy": "user_id"
}
```

---

### Get Match Participants API

**Endpoint:** `POST /api/league/GetIndividualMatchParticipant`

**Description:** Fetches players associated with a team for a specific match.

**Request Payload:**
```json
{
    "parentclubId": "club_uuid",
    "memberId": "user_uuid",
    "activityId": "activity_uuid",
    "MatchId": "match_uuid",
    "TeamId": "team_uuid",
    "action_type": 1,
    "device_type": 1,
    "app_type": 2
}
```

---

## Coordinate System

The pitch uses a percentage-based coordinate system (0-100) from the top-left corner.

```
      0 ────────────── x ────────────── 100
      │                                  │
    0 │  ┌──────────────────────────┐   │
      │  │        OPPONENT GOAL     │   │
      │  │                          │   │
      │  │      ATTACKING HALF      │   │
      │  │                          │   │
   y  │  ├──────────────────────────┤   │
      │  │                          │   │
      │  │      DEFENDING HALF      │   │
      │  │                          │   │
      │  │         OWN GOAL         │   │
  100 │  └──────────────────────────┘   │
      │                                  │
      └──────────────────────────────────┘
```

- **x = 0**: Left touchline
- **x = 100**: Right touchline
- **y = 0**: Opponent's goal line (Top)
- **y = 100**: Own goal line (Bottom)

---

*Last Updated: 2026-01-20*
