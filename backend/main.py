#you will need to install the following packages (IN .venv NOT YOUR GLOBAL ENVIRONMENT):
#pip install requests
#pip install pymongo
#pip install "fastapi[standard]"

#to run the backend server you will need to run:
#fastapi dev main.py

#then click the localhost url it spits out to checkout the Swagger UI backend (sorta like view the React pages)

import os
from typing import List, Optional

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

#user document for mongo
class UserModel(BaseModel):
    id: PyObjectId | None = Field(alias="_id", default=None)
    username: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    points: int = Field(default=0)
    lcUsername: str | None = None
    leetcodeProfile: dict | None = None
    avatar: str | None = None
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
    lcUsername: str | None = None
    leetcodeProfile: dict | None = None
    avatar: str | None = None
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

        if user and user.get("lcUsername"):
            latest_profile = fetch_leetcode_profile(user["lcUsername"])
            if latest_profile:
                participant["lcUsername"] = user["lcUsername"]
                await users_collection.update_one(
                    {"_id": ObjectId(participant["id"])},
                    {"$set": {"leetcodeProfile": latest_profile}},
                )
                participant = apply_profile_to_participant(participant, latest_profile)
            elif should_check_streak:
                streak_survived = False

        if should_check_streak and latest_profile:
            if latest_profile["totalSolved"] <= previous_total:
                streak_survived = False
        elif should_check_streak and not latest_profile:
            #if we cannot fetch data, treat it as a broken streak for safety
            streak_survived = False

        #ensure score is present even if we did not fetch an update
        participant.setdefault("score", calculate_score(participant))
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
    result = await users_collection.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)

    return new_user


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
        return user
    
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
    return user

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
            return update_result
        else:
            raise HTTPException(status_code=404, detail=f"User {id} not found")
        
    if (existing_user := await users_collection.find_one({"_id": id})) is not None:
        return existing_user
    
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

    update_result = await users_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "lcUsername": lc_username,
            "leetcodeProfile": solved
        }},
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"User {id} not found")

    return {
        "lcUsername": lc_username,
        "leetcodeProfile": solved
    }

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

    await users_collection.update_one(
        {"_id": ObjectId(tournament.creatorId)},
        {"$set": {"leetcodeProfile": fresh_profile}},
    )

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
        if datetime.utcnow() - start_time > timedelta(days=1):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tournaments can only be joined in the first 24 hours after they start.",
            )
    except (KeyError, ValueError):
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
    await users_collection.update_one(
        {"_id": ObjectId(data.id)},
        {"$set": {"leetcodeProfile": fresh_profile}},
    )
    
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
