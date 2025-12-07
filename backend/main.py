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
from datetime import datetime



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
    model_config = ConfigDict(
        json_encoders={ObjectId: str},
    )

class LeetCodeUpdateRequest(BaseModel):
    id: str
    lcUsername: str


class LeetCodeUpdateResponse(BaseModel):
    lcUsername: str
    leetcodeProfile: dict

class TournamentParticipant(BaseModel):
    id: str
    username: str
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
    startTime: str = Field(...)
    endTime: str = Field(...)
    participants: list[TournamentParticipant] = []

    model_config = ConfigDict(
        populate_by_name=True,
    )

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
    new_user = user.model_dump(by_alias=True, exclude=["id"])
    result = await users_collection.insert_one(new_user)
    new_user["_id"] = result.inserted_id

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
async def create_tournament(tournament: TournamentModel):
    new_tournament = tournament.model_dump(by_alias=True, exclude=["id"])
    result = await tournaments_collection.insert_one(new_tournament)
    new_tournament["_id"] = result.inserted_id

    return new_tournament

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
    
    tournament_id = tournament["_id"]
    
    #user needs to exist (this is probably redundant)
    user = await users_collection.find_one({"_id": ObjectId(data.id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    #user needs to have linked their lc profile
    if not user.get("leetcodeProfile"):
        raise HTTPException(status_code=400, detail="User has not linked their LeetCode Profile.")
    
    #setting fields for a new participant
    initialTotalSolved = user["leetcodeProfile"]["totalSolved"]
    initialEasySolved = user["leetcodeProfile"]["easySolved"]
    initialMediumSolved = user["leetcodeProfile"]["mediumSolved"]
    initialHardSolved = user["leetcodeProfile"]["hardSolved"]
    participant = {
        "id": data.id,
        "username": user["username"],
        "initialTotalSolved": initialTotalSolved,
        "currentTotalSolved": initialTotalSolved,
        "initialEasySolved": initialEasySolved,
        "currentEasySolved": initialEasySolved,
        "initialMediumSolved": initialMediumSolved,
        "currentMediumSolved": initialMediumSolved,
        "initialHardSolved": initialHardSolved,
        "currentHardSolved": initialHardSolved,
        "score": 0
    }

    #adding the new participant to Mongo
    update_result = await tournaments_collection.find_one_and_update(
        {"_id": ObjectId(tournament_id)},
        {"$push": {"participants": participant}},
        return_document=ReturnDocument.AFTER
    )

    return update_result
