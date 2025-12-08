#you will need to install the following packages (IN .venv NOT YOUR GLOBAL ENVIRONMENT):
#pip install requests
#pip install pymongo
#pip install "fastapi[standard]"

#to run the backend server you will need to run:
#fastapi dev main.py

#then click the localhost url it spits out to checkout the Swagger UI backend (sorta like view the React pages)

import os
from typing import Literal

#for leetcode graphql
import requests
from datetime import datetime, timedelta, timezone



from fastapi import FastAPI, HTTPException, status
from fastapi.responses import Response
from pydantic import ConfigDict, BaseModel, Field, EmailStr
from pydantic.functional_validators import BeforeValidator

from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

from typing_extensions import Annotated

#mongodb stuff
from bson import ObjectId
from pymongo import AsyncMongoClient
from pymongo import ReturnDocument
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
MONGO_DB = os.getenv("MONGO_DB")

app = FastAPI()

#mongodb strings imported from .env file check out google doc for the contents of what your .env is supposed to look like
client = AsyncMongoClient(MONGO_URL)
db = client[MONGO_DB]
users_collection = db.get_collection("users")
tournaments_collection = db.get_collection("tournaments")

#this allows comms between frontend and backend
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PyObjectId = Annotated[str, BeforeValidator(str)]
SkillLevel = Literal["beginner", "intermediate", "advanced"]

#user document for mongo
class UserModel(BaseModel):
    id: PyObjectId | None = Field(alias="_id", default=None)
    username: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    points: int = Field(default=0)
    streakSaves: int = Field(default=0)
    lcUsername: str | None = None
    leetcodeProfile: dict | None = None
    avatar: str | None = None
    skillLevel: SkillLevel | None = None
    completedLessons: list[str] = Field(default_factory=list)
    roomItems: list["RoomItemModel"] = Field(default_factory=list)
    model_config = ConfigDict(
        populate_by_name=True,
    )
#DIFFERENT MODELS USED, we will 
#user doc update (this will probably be used to settings page)
class UpdateUserModel(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    points: int | None = None
    streakSaves: int | None = None
    lcUsername: str | None = None
    leetcodeProfile: dict | None = None
    avatar: str | None = None
    skillLevel: SkillLevel | None = None
    completedLessons: list[str] | None = None
    model_config = ConfigDict(
        json_encoders={ObjectId: str},
    )

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LeetCodeUpdateRequest(BaseModel):
    id: str
    lcUsername: str


class LeetCodeUpdateResponse(BaseModel):
    lcUsername: str
    leetcodeProfile: dict


class PurchaseStreakSaveRequest(BaseModel):
    count: int = Field(..., ge=1, le=3)

class RoomItemModel(BaseModel):
    id: str
    owned: bool = False
    placed: bool = False
    x: float | None = Field(default=None, ge=0, le=100)
    y: float | None = Field(default=None, ge=0, le=100)

class RoomItemsPayload(BaseModel):
    items: list[RoomItemModel]

class RoomPurchaseRequest(BaseModel):
    itemId: str

class SkillLevelRequest(BaseModel):
    skillLevel: SkillLevel

class LessonCompleteResponse(BaseModel):
    skillLevel: SkillLevel
    lessons: list[dict]
    points: int
    pointsAwarded: int

UserModel.model_rebuild()

class TournamentParticipant(BaseModel):
    id: str
    username: str
    lcUsername: str | None = None
    initialTotalSolved: int
    currentTotalSolved: int
    initialEasySolved: int
    currentEasySolved: int
    initialMediumSolved: int
    currentMediumSolved: int
    initialHardSolved: int
    currentHardSolved: int
    score: int

class TournamentModel(BaseModel):
    id: PyObjectId | None = Field(alias="_id", default=None)
    name: str = Field(...)
    password: str = Field(...)
    creatorId: str | None = None
    startTime: str = Field(...)
    endTime: str = Field(...)
    participants: list[TournamentParticipant] = []
    streak: int = Field(default=0)
    lastChecked: str | None = None

    model_config = ConfigDict(
        populate_by_name=True,
    )

class CreateTournamentRequest(BaseModel):
    name: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    creatorId: str = Field(...)
    durationHours: int | None = Field(default=24 * 7, ge=1)

class JoinTournamentRequest(BaseModel):
    id: str
    name: str
    password: str

#this is how we get user data from leetcode
LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

LEETCODE_QUERY = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}
"""

POINT_VALUES = {
    "easy": 10,
    "medium": 20,
    "hard": 30,
}

STREAK_SAVE_PRICING = {
    1: 120,
    2: 260,
    3: 480,
}

LESSON_POINT_VALUE = 20

ROOM_CATALOG: dict[str, dict] = {
    "dirtyshower": {"cost": 0, "default_owned": True, "x": 12.0, "y": 56.0},
    "bathtub": {"cost": 420, "default_owned": False, "x": 72.0, "y": 62.0},
    "candle": {"cost": 140, "default_owned": False, "x": 64.0, "y": 40.0},
    "mirror": {"cost": 260, "default_owned": False, "x": 18.0, "y": 20.0},
    "rubberduck": {"cost": 90, "default_owned": False, "x": 62.0, "y": 70.0},
    "rug": {"cost": 180, "default_owned": False, "x": 50.0, "y": 86.0},
    "sink": {"cost": 240, "default_owned": False, "x": 20.0, "y": 62.0},
    "speaker": {"cost": 220, "default_owned": False, "x": 38.0, "y": 18.0},
}

LESSON_TRACKS: dict[SkillLevel, list[dict]] = {
    "beginner": [
        {
            "id": "hello-world",
            "title": "hello world + printing",
            "focus": "output + syntax",
            "duration": "8 min read",
            "points": 60,
            "icon": "{}",
            "url": "https://www.freecodecamp.org/news/python-hello-world/",
        },
        {
            "id": "variables",
            "title": "variables + types",
            "focus": "data basics",
            "duration": "10 min read",
            "points": 70,
            "icon": "Aa",
            "url": "https://www.w3schools.com/python/python_variables.asp",
        },
        {
            "id": "conditions",
            "title": "conditionals in python",
            "focus": "logic",
            "duration": "12 min read",
            "points": 80,
            "icon": "??",
            "url": "https://www.programiz.com/python-programming/if-elif-else",
        },
        {
            "id": "loops",
            "title": "loops that make sense",
            "focus": "loops",
            "duration": "12 min read",
            "points": 90,
            "icon": "LO",
            "url": "https://realpython.com/python-for-loop/",
        },
        {
            "id": "functions",
            "title": "functions 101",
            "focus": "functions",
            "duration": "14 min read",
            "points": 100,
            "icon": "fx",
            "url": "https://www.freecodecamp.org/news/functions-in-python-a-beginners-guide/",
        },
        {
            "id": "lists",
            "title": "lists + arrays",
            "focus": "collections",
            "duration": "14 min read",
            "points": 110,
            "icon": "[]",
            "url": "https://realpython.com/python-lists-tuples/",
        },
    ],
    "intermediate": [
        {
            "id": "arrays",
            "title": "array and string review",
            "focus": "arrays",
            "duration": "12 min read",
            "points": 80,
            "icon": "AR",
            "url": "https://www.geeksforgeeks.org/array-data-structure/",
        },
        {
            "id": "two-pointers",
            "title": "two-pointer patterns",
            "focus": "patterns",
            "duration": "14 min read",
            "points": 90,
            "icon": "<>",
            "url": "https://www.geeksforgeeks.org/two-pointers-technique/",
        },
        {
            "id": "recursion",
            "title": "recursion drills",
            "focus": "recursion",
            "duration": "16 min read",
            "points": 100,
            "icon": "RE",
            "url": "https://www.geeksforgeeks.org/recursion/",
        },
        {
            "id": "dfs",
            "title": "depth-first search",
            "focus": "tree/graph traversal",
            "duration": "15 min read",
            "points": 110,
            "icon": "TR",
            "url": "https://www.programiz.com/dsa/graph-dfs",
        },
        {
            "id": "bfs",
            "title": "breadth-first search",
            "focus": "graph traversal",
            "duration": "14 min read",
            "points": 120,
            "icon": "BF",
            "url": "https://www.programiz.com/dsa/graph-bfs",
        },
        {
            "id": "dp",
            "title": "dynamic programming starter",
            "focus": "dp",
            "duration": "18 min read",
            "points": 140,
            "icon": "DP",
            "url": "https://www.geeksforgeeks.org/dynamic-programming/",
        },
    ],
    "advanced": [
        {
            "id": "goroutines",
            "title": "go routines primer",
            "focus": "concurrency",
            "duration": "12 min read",
            "points": 100,
            "icon": "GO",
            "url": "https://gobyexample.com/goroutines",
        },
        {
            "id": "channels",
            "title": "channels + pipelines",
            "focus": "communication",
            "duration": "12 min read",
            "points": 110,
            "icon": "CH",
            "url": "https://gobyexample.com/channels",
        },
        {
            "id": "ownership",
            "title": "rust ownership",
            "focus": "memory",
            "duration": "16 min read",
            "points": 120,
            "icon": "RS",
            "url": "https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html",
        },
        {
            "id": "lifetimes",
            "title": "lifetimes by example",
            "focus": "borrowing",
            "duration": "14 min read",
            "points": 120,
            "icon": "LT",
            "url": "https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html",
        },
        {
            "id": "ts-generics",
            "title": "typescript generics",
            "focus": "type systems",
            "duration": "12 min read",
            "points": 110,
            "icon": "<T>",
            "url": "https://www.typescriptlang.org/docs/handbook/2/generics.html",
        },
        {
            "id": "perf",
            "title": "concurrency patterns",
            "focus": "performance",
            "duration": "16 min read",
            "points": 140,
            "icon": "PF",
            "url": "https://doc.rust-lang.org/book/ch16-00-concurrency.html",
        },
    ],
}

def default_room_items() -> list[dict]:
    return [
        {
            "id": item_id,
            "owned": bool(meta.get("default_owned", False)),
            "placed": bool(meta.get("default_owned", False)),
            "x": float(meta.get("x", 50.0)),
            "y": float(meta.get("y", 50.0)),
        }
        for item_id, meta in ROOM_CATALOG.items()
    ]


def normalize_room_items(room_items: list[dict] | None) -> list[dict]:
    merged: dict[str, dict] = {}
    for item in room_items or []:
        item_id = item.get("id")
        if item_id in ROOM_CATALOG and item_id not in merged:
            merged[item_id] = {
                "id": item_id,
                "owned": bool(item.get("owned", False)),
                "placed": bool(item.get("placed", False)),
                "x": clamp_percent(item.get("x", ROOM_CATALOG[item_id].get("x", 50.0))),
                "y": clamp_percent(item.get("y", ROOM_CATALOG[item_id].get("y", 50.0))),
            }

    normalized: list[dict] = []
    for item_id, meta in ROOM_CATALOG.items():
        existing = merged.get(item_id, {})
        owned_default = bool(meta.get("default_owned", False))
        normalized.append(
            {
                "id": item_id,
                "owned": existing.get("owned", owned_default),
                "placed": existing.get("placed", owned_default),
                "x": clamp_percent(existing.get("x", meta.get("x", 50.0))),
                "y": clamp_percent(existing.get("y", meta.get("y", 50.0))),
            }
        )
    return normalized


def clamp_percent(value: float) -> float:
    return max(0.0, min(100.0, float(value)))


def get_lesson_track(skill_level: SkillLevel | None) -> list[dict]:
    if skill_level in LESSON_TRACKS:
        return LESSON_TRACKS[skill_level]  # type: ignore[index]
    return LESSON_TRACKS["intermediate"]


def build_lesson_progress(
    user: dict,
) -> dict:
    skill_level: SkillLevel | None = user.get("skillLevel")  # type: ignore[assignment]
    completed = set(user.get("completedLessons") or [])
    track = get_lesson_track(skill_level)
    lessons: list[dict] = []
    found_current = False

    for lesson in track:
        status = "locked"
        if lesson["id"] in completed:
            status = "done"
        elif not found_current:
            status = "current"
            found_current = True
        lessons.append(
            {
                **lesson,
                "status": status,
                "type": lesson.get("type", "lesson"),
                "points": LESSON_POINT_VALUE,
            }
        )

    if not found_current:
        # all lessons completed, mark the last one as current to avoid empty states
        if lessons:
            lessons[-1]["status"] = "current"

    return {
        "skillLevel": skill_level or "intermediate",
        "lessons": lessons,
    }

#score calculation based on deltas from when the participant joined
def calculate_score(participant: dict) -> int:
    easy_gain = max(
        0, participant.get("currentEasySolved", 0) - participant.get("initialEasySolved", 0)
    )
    medium_gain = max(
        0, participant.get("currentMediumSolved", 0) - participant.get("initialMediumSolved", 0)
    )
    hard_gain = max(
        0, participant.get("currentHardSolved", 0) - participant.get("initialHardSolved", 0)
    )

    return (
        easy_gain * POINT_VALUES["easy"]
        + medium_gain * POINT_VALUES["medium"]
        + hard_gain * POINT_VALUES["hard"]
    )


def serialize_tournament(tournament: dict) -> dict:
    tournament["_id"] = str(tournament["_id"])
    if "streak" not in tournament:
        tournament["streak"] = 0
    if "lastChecked" not in tournament:
        tournament["lastChecked"] = None
    if "participants" not in tournament:
        tournament["participants"] = []
    #normalize times to include timezone for frontend parsing
    for key in ("startTime", "endTime"):
        ts = tournament.get(key)
        if isinstance(ts, str) and ts and "Z" not in ts and "+" not in ts:
            tournament[key] = f"{ts}Z"
    return tournament


def apply_profile_to_participant(participant: dict, profile: dict) -> dict:
    participant["currentTotalSolved"] = profile["totalSolved"]
    participant["currentEasySolved"] = profile["easySolved"]
    participant["currentMediumSolved"] = profile["mediumSolved"]
    participant["currentHardSolved"] = profile["hardSolved"]
    participant["score"] = calculate_score(participant)
    return participant


async def award_user_points(user: dict, latest_profile: dict) -> int:
    """
    Adds account points for newly solved problems since the user's last stored profile.
    Points are awarded once per newly solved problem across all tournaments.
    """
    previous_profile = user.get("leetcodeProfile") or {}
    baseline = {
        "easySolved": previous_profile.get("easySolved", latest_profile["easySolved"]),
        "mediumSolved": previous_profile.get("mediumSolved", latest_profile["mediumSolved"]),
        "hardSolved": previous_profile.get("hardSolved", latest_profile["hardSolved"]),
    }

    easy_gain = max(0, latest_profile["easySolved"] - baseline["easySolved"])
    medium_gain = max(0, latest_profile["mediumSolved"] - baseline["mediumSolved"])
    hard_gain = max(0, latest_profile["hardSolved"] - baseline["hardSolved"])

    total_gain = (
        easy_gain * POINT_VALUES["easy"]
        + medium_gain * POINT_VALUES["medium"]
        + hard_gain * POINT_VALUES["hard"]
    )

    if total_gain > 0:
        new_points = int(user.get("points", 0)) + total_gain
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"points": new_points, "leetcodeProfile": latest_profile}},
        )
    else:
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"leetcodeProfile": latest_profile}},
        )

    return total_gain


def ensure_user_defaults(user: dict) -> dict:
    user.setdefault("points", 0)
    user.setdefault("streakSaves", 0)
    user.setdefault("skillLevel", None)
    user.setdefault("completedLessons", [])
    user["roomItems"] = normalize_room_items(user.get("roomItems"))
    return user


async def consume_streak_save(user_id: ObjectId) -> bool:
    """
    Atomically consume a streak save if the user has one available.
    """
    result = await users_collection.find_one_and_update(
        {"_id": user_id, "streakSaves": {"$gt": 0}},
        {"$inc": {"streakSaves": -1}},
        return_document=ReturnDocument.AFTER,
    )
    return result is not None


def build_participant_from_profile(user: dict, profile: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "lcUsername": user.get("lcUsername"),
        "initialTotalSolved": profile["totalSolved"],
        "currentTotalSolved": profile["totalSolved"],
        "initialEasySolved": profile["easySolved"],
        "currentEasySolved": profile["easySolved"],
        "initialMediumSolved": profile["mediumSolved"],
        "currentMediumSolved": profile["mediumSolved"],
        "initialHardSolved": profile["hardSolved"],
        "currentHardSolved": profile["hardSolved"],
        "score": 0,
    }


async def refresh_tournament(tournament: dict) -> dict:
    participants = tournament.get("participants", [])
    today = datetime.utcnow().date().isoformat()
    should_check_streak = tournament.get("lastChecked") != today
    streak_survived = True
    updated_participants: list[dict] = []

    for participant in participants:
        previous_total = participant.get("currentTotalSolved", participant.get("initialTotalSolved", 0))
        user = await users_collection.find_one({"_id": ObjectId(participant["id"])})
        latest_profile = None
        save_used = False
        streak_broken = False

        if user and user.get("lcUsername"):
            user = ensure_user_defaults(user)
            latest_profile = fetch_leetcode_profile(user["lcUsername"])
            if latest_profile:
                participant["lcUsername"] = user["lcUsername"]
                await award_user_points(user, latest_profile)
                participant = apply_profile_to_participant(participant, latest_profile)
            elif should_check_streak:
                streak_broken = True

        if should_check_streak and latest_profile:
            if latest_profile["totalSolved"] <= previous_total:
                streak_broken = True
        elif should_check_streak and not latest_profile:
            #if we cannot fetch data, treat it as a broken streak for safety
            streak_broken = True

        if streak_broken and user:
            save_used = await consume_streak_save(user["_id"])
            streak_broken = not save_used

        if streak_broken:
            streak_survived = False

        #ensure score is present even if we did not fetch an update
        participant.setdefault("score", calculate_score(participant))
        if save_used:
            participant["streakSaveUsedOn"] = today
        updated_participants.append(participant)

    updated_participants.sort(key=lambda p: p.get("score", 0), reverse=True)

    update_fields: dict = {"participants": updated_participants}
    if should_check_streak:
        if updated_participants and streak_survived:
            update_fields["streak"] = int(tournament.get("streak", 0)) + 1
        else:
            update_fields["streak"] = 0
        update_fields["lastChecked"] = today

    updated = await tournaments_collection.find_one_and_update(
        {"_id": tournament["_id"]},
        {"$set": update_fields},
        return_document=ReturnDocument.AFTER,
    )

    if updated is None:
        updated = {**tournament, **update_fields}
    return serialize_tournament(updated)

#this is used when updated a users leetcode profile
def fetch_leetcode_profile(username: str):
    response = requests.post(
        LEETCODE_GRAPHQL_URL,
        json={"query": LEETCODE_QUERY, "variables": {"username": username}},
        headers={"Content-Type": "application/json"},
        timeout=10
    )

    data = response.json()

    if "data" not in data or data["data"]["matchedUser"] is None:
        return None

    stats = data["data"]["matchedUser"]["submitStats"]["acSubmissionNum"]

    return {
        "totalSolved": stats[0]["count"],
        "easySolved": stats[1]["count"],
        "mediumSolved": stats[2]["count"],
        "hardSolved": stats[3]["count"],
        "lastUpdated": datetime.utcnow().isoformat(),
    }

#adding a user
@app.post(
    "/users/",
    response_description="Register new user",
    response_model=UserModel,
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def register_user(user: UserModel):
    normalized_email = user.email.lower()
    existing_user = await users_collection.find_one(
        {"$or": [{"email": normalized_email}, {"username": user.username}]}
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with that email or username already exists.",
        )

    new_user = user.model_dump(by_alias=True, exclude=["id"])
    new_user["email"] = normalized_email
    new_user.setdefault("streakSaves", 0)
    new_user.setdefault("skillLevel", None)
    new_user["completedLessons"] = []
    new_user["roomItems"] = default_room_items()
    result = await users_collection.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)

    return ensure_user_defaults(new_user)


#getting a user
#this is for getting user data when they are ALREADY logged in
#(to populate the webpages with their data)
#the id for the user would be stored in "localStorage" in the frontend
#this would get stored upon a successful login/registration

#the id is the mongo id (remember "_id" ?) as a string, checkout the mongo acc there are some entries there
#there should probably be a app.get request via user and password, when that succeeds,
#store the associated user id in localStorage

#i hope this makes sense
#in short a class for LoginRequest will be needed. It has two fields, username and password
#they are both strings

#then an app.get endpoint will be needed probably called login_user or something like that

@app.get(
    "/users/{id}",
    response_description="Get a user",
    response_model=UserModel,
    response_model_by_alias=False,
)
async def get_user(id: str):
    if (
        user := await users_collection.find_one({"_id": ObjectId(id)})
    ) is not None:
        user["_id"] = str(user["_id"])
        return ensure_user_defaults(user)
    
    raise HTTPException(status_code=404, detail=f"User {id} not found")

@app.post(
    "/login",
    response_description="Login a user",
    response_model=UserModel,
    response_model_by_alias=False,
)
async def login_user(credentials: LoginRequest):
    email = credentials.email.lower()
    user = await users_collection.find_one({"email": email})

    if not user or user.get("password") != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user["_id"] = str(user["_id"])
    return ensure_user_defaults(user)

#updating a user
#can be used for updating settings
@app.put(
    "/users/{id}",
    response_description="Update a user",
    response_model=UserModel,
    response_model_by_alias=False,
)
async def update_user(id: str, user: UpdateUserModel):
    #same thing
    user = {
        k: v for k, v in user.model_dump(by_alias=True).items() if v is not None
    }
    avatar_data = user.get("avatar")
    if avatar_data and len(avatar_data) > 8_000_000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Avatar is too large. Please upload an image under 5MB.",
        )
    if len(user) >= 1:
        update_result = await users_collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": user},
            return_document=ReturnDocument.AFTER,
        )
        if update_result is not None:
            return ensure_user_defaults(update_result)
        else:
            raise HTTPException(status_code=404, detail=f"User {id} not found")
        
    if (existing_user := await users_collection.find_one({"_id": id})) is not None:
        return ensure_user_defaults(existing_user)
    
    raise HTTPException(status_code=404, detail=f"User {id} not found")

#this updates a user document based on the user id (data.id) and
#lc_username
@app.put(
    "/leetcode/update",
    response_description="Retrieve and update user's LeetCode stats",
    response_model=LeetCodeUpdateResponse,
    response_model_by_alias=False,
)
async def update_leetcode_stats(data: LeetCodeUpdateRequest):
    id = data.id
    lc_username = data.lcUsername

    solved = fetch_leetcode_profile(lc_username)

    if solved is None:
        raise HTTPException(status_code=404, detail=f"LeetCode user {lc_username} not found")

    user = await users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=404, detail=f"User {id} not found")

    await award_user_points(user, solved)

    update_result = await users_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"lcUsername": lc_username}},
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"User {id} not found")

    return {
        "lcUsername": lc_username,
        "leetcodeProfile": solved
    }


@app.get(
    "/users/{id}/refresh-points",
    response_description="Refresh a user's points from their linked LeetCode profile",
    response_model=UserModel,
    response_model_by_alias=False,
)
async def refresh_user_points(id: str):
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    lc_username = user.get("lcUsername")
    if not lc_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has not linked a LeetCode profile.",
        )

    profile = fetch_leetcode_profile(lc_username)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"LeetCode user {lc_username} not found")

    await award_user_points(user, profile)

    refreshed_user = await users_collection.find_one({"_id": ObjectId(id)})
    if not refreshed_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found after refresh")

    refreshed_user["_id"] = str(refreshed_user["_id"])
    return ensure_user_defaults(refreshed_user)


@app.put(
    "/users/{id}/skill-level",
    response_description="Set a user's skill level and reset lesson progress",
    response_model=UserModel,
    response_model_by_alias=False,
)
async def set_skill_level(id: str, payload: SkillLevelRequest):
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    updated = await users_collection.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": {"skillLevel": payload.skillLevel, "completedLessons": []}},
        return_document=ReturnDocument.AFTER,
    )

    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    updated["_id"] = str(updated["_id"])
    return ensure_user_defaults(updated)


@app.get(
    "/users/{id}/lessons",
    response_description="Get a user's lesson track and progress",
    response_model=LessonCompleteResponse,
    response_model_by_alias=False,
)
async def get_lessons(id: str):
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    user = ensure_user_defaults(user)
    payload = build_lesson_progress(user)

    return {
        **payload,
        "points": int(user.get("points", 0)),
        "pointsAwarded": 0,
    }


@app.post(
    "/users/{id}/lessons/{lesson_id}/complete",
    response_description="Mark a lesson complete and award points",
    response_model=LessonCompleteResponse,
    response_model_by_alias=False,
)
async def complete_lesson(id: str, lesson_id: str):
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    user = ensure_user_defaults(user)
    track = get_lesson_track(user.get("skillLevel"))
    lesson_meta = next((lesson for lesson in track if lesson["id"] == lesson_id), None)
    if not lesson_meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found for this track.")

    completed = set(user.get("completedLessons") or [])
    points_awarded = 0
    if lesson_id not in completed:
        completed.add(lesson_id)
        points_awarded = LESSON_POINT_VALUE
        new_points = int(user.get("points", 0)) + points_awarded
        await users_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"completedLessons": list(completed), "points": new_points}},
        )
    else:
        await users_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"completedLessons": list(completed)}},
        )

    refreshed_user = await users_collection.find_one({"_id": ObjectId(id)})
    if not refreshed_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found after completion")

    refreshed_user["_id"] = str(refreshed_user["_id"])
    refreshed_user = ensure_user_defaults(refreshed_user)
    payload = build_lesson_progress(refreshed_user)

    return {
        **payload,
        "points": int(refreshed_user.get("points", 0)),
        "pointsAwarded": points_awarded,
    }


@app.post(
    "/users/{id}/streak-saves",
    response_description="Purchase streak saves with points",
    response_model=UserModel,
    response_model_by_alias=False,
)
async def purchase_streak_saves(id: str, purchase: PurchaseStreakSaveRequest):
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    cost = STREAK_SAVE_PRICING.get(purchase.count)
    if cost is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported streak save quantity.",
        )

    updated = await users_collection.find_one_and_update(
        {"_id": ObjectId(id), "points": {"$gte": cost}},
        {"$inc": {"points": -cost, "streakSaves": purchase.count}},
        return_document=ReturnDocument.AFTER,
    )

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough points to buy streak saves.",
        )

    updated["_id"] = str(updated["_id"])
    return ensure_user_defaults(updated)


@app.post(
    "/users/{id}/room/purchase",
    response_description="Purchase a room item with points",
    response_model=UserModel,
    response_model_by_alias=False,
)
async def purchase_room_item(id: str, purchase: RoomPurchaseRequest):
    item_id = purchase.itemId
    item_meta = ROOM_CATALOG.get(item_id)
    if not item_meta:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown room item.")
    if item_meta.get("default_owned"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Starter items cannot be purchased.",
        )

    user = await users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    user = ensure_user_defaults(user)
    room_items = normalize_room_items(user.get("roomItems"))

    for item in room_items:
        if item["id"] == item_id and item.get("owned"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already own this item.",
            )

    updated_room = []
    for item in room_items:
        if item["id"] == item_id:
            updated_room.append(
                {
                    **item,
                    "owned": True,
                    "placed": True,
                    "x": clamp_percent(item_meta.get("x", item.get("x", 50.0))),
                    "y": clamp_percent(item_meta.get("y", item.get("y", 50.0))),
                }
            )
        else:
            updated_room.append(item)

    cost = int(item_meta.get("cost", 0))
    updated = await users_collection.find_one_and_update(
        {"_id": ObjectId(id), "points": {"$gte": cost}},
        {"$set": {"roomItems": updated_room}, "$inc": {"points": -cost}},
        return_document=ReturnDocument.AFTER,
    )

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough points to buy this item.",
        )

    updated["_id"] = str(updated["_id"])
    return ensure_user_defaults(updated)


@app.put(
    "/users/{id}/room",
    response_description="Save room layout for a user",
    response_model=UserModel,
    response_model_by_alias=False,
)
async def save_room_layout(id: str, payload: RoomItemsPayload):
    user = await users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    user = ensure_user_defaults(user)
    room_items = normalize_room_items(user.get("roomItems"))
    incoming = {item.id: item for item in payload.items if item.id in ROOM_CATALOG}

    updated_room: list[dict] = []
    for item in room_items:
        candidate = incoming.get(item["id"])
        if candidate and item.get("owned"):
            updated_room.append(
                {
                    "id": item["id"],
                    "owned": True,
                    "placed": bool(candidate.placed),
                    "x": clamp_percent(candidate.x if candidate.x is not None else item.get("x", 50.0)),
                    "y": clamp_percent(candidate.y if candidate.y is not None else item.get("y", 50.0)),
                }
            )
        else:
            updated_room.append(item)

    updated = await users_collection.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": {"roomItems": updated_room}},
        return_document=ReturnDocument.AFTER,
    )

    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    updated["_id"] = str(updated["_id"])
    return ensure_user_defaults(updated)

#creating a new tourny. a tourny has a name, pass, start time, end time
# and the participants
@app.post(
    "/tournaments/",
    response_description="Create a tournament",
    response_model=TournamentModel,
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def create_tournament(tournament: CreateTournamentRequest):
    existing = await tournaments_collection.find_one({"name": tournament.name})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="A tournament with that name already exists."
        )

    creator = await users_collection.find_one({"_id": ObjectId(tournament.creatorId)})
    if not creator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator not found.")
    if not creator.get("lcUsername"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Link your LeetCode account first.")

    fresh_profile = fetch_leetcode_profile(creator["lcUsername"])
    if fresh_profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unable to fetch LeetCode profile.")

    await award_user_points(creator, fresh_profile)

    creator_participant = build_participant_from_profile(creator, fresh_profile)

    start_time = datetime.now(timezone.utc)
    end_time = start_time + timedelta(hours=tournament.durationHours or 24)

    new_tournament = {
        "name": tournament.name,
        "password": tournament.password,
        "creatorId": tournament.creatorId,
        "startTime": start_time.isoformat(),
        "endTime": end_time.isoformat(),
        "participants": [creator_participant],
        "streak": 0,
        "lastChecked": None,
    }

    result = await tournaments_collection.insert_one(new_tournament)
    new_tournament["_id"] = result.inserted_id

    return serialize_tournament(new_tournament)


@app.get(
    "/tournaments/",
    response_description="List tournaments with standings",
    response_model=list[TournamentModel],
    response_model_by_alias=False,
)
async def list_tournaments(userId: str | None = None):
    query = {}
    if userId:
        query = {"participants.id": userId}
    tournaments = await tournaments_collection.find(query).to_list(length=1000)
    refreshed: list[dict] = []
    for tournament in tournaments:
        refreshed.append(await refresh_tournament(tournament))
    return refreshed

#adding a new participant to a tournament
#needs a user id, tornament name, and torny pass
# 
# There is no real way to track "questions solved since a specific time"
# via the LeetCode GraphQL. So, we track the number of solves for each
# difficulty from when the user first joined the tournament
# compared to their current number of solves we can deduce the amount
# they solved while in the tournament   
@app.put(
    "/tournaments/",
    response_description="Join a tournament by name & password",
    response_model=TournamentModel,
    response_model_by_alias=False,
)
async def join_tournament(data: JoinTournamentRequest):
    
    #lookup tourny that matches tourny_user/tourney pass combo
    tournament = await tournaments_collection.find_one({
        "name": data.name,
        "password": data.password
    })

    if not tournament:
        raise HTTPException(status_code=404, detail=f"Invalid tournament name/password.")
    
    try:
        start_time = datetime.fromisoformat(tournament["startTime"])
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if now - start_time > timedelta(days=1):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tournaments can only be joined in the first 24 hours after they start.",
            )
    except (KeyError, ValueError, TypeError):
        pass

    tournament_id = tournament["_id"]
    
    #user needs to exist (this is probably redundant)
    user = await users_collection.find_one({"_id": ObjectId(data.id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    #user needs to have linked their lc profile
    if not user.get("lcUsername"):
        raise HTTPException(status_code=400, detail="User has not linked their LeetCode Profile.")
    
    if any(p.get("id") == data.id for p in tournament.get("participants", [])):
        raise HTTPException(status_code=400, detail="User already joined this tournament.")

    fresh_profile = fetch_leetcode_profile(user["lcUsername"])
    if fresh_profile is None:
        raise HTTPException(status_code=404, detail=f"LeetCode user {user['lcUsername']} not found")
    await award_user_points(user, fresh_profile)
    
    participant = build_participant_from_profile(user, fresh_profile)

    #adding the new participant to Mongo
    update_result = await tournaments_collection.find_one_and_update(
        {"_id": ObjectId(tournament_id)},
        {"$push": {"participants": participant}},
        return_document=ReturnDocument.AFTER
    )

    if update_result is None:
        raise HTTPException(status_code=500, detail="Unable to join tournament right now.")

    return await refresh_tournament(update_result)
