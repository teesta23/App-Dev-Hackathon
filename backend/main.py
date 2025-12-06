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
print (MONGO_URL)
# CREATE A VIRTUAL ENVIRONMENT AND INSTALL THE REQUIRED FASTAPI PACKAGES

app = FastAPI()

client = AsyncMongoClient(MONGO_URL)
db = client[MONGO_DB]
users_collection = db.get_collection("users")

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

class UserModel(BaseModel):
    id: PyObjectId | None = Field(alias="_id", default=None)
    username: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    lcUsername: str | None = None
    leetcodeProfile: dict | None = None
    model_config = ConfigDict(
        populate_by_name=True,
    )

class UpdateUserModel(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
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
    initialSolved: int
    currentSolved: int
    score: int

class TournamentModel(BaseModel):
    id: PyObjectId | None = Field(alias="_id", default=None)
    name: str
    password: str
    startTime: str
    endTime: str
    participants: list[TournamentParticipant] = []

    model_config = ConfigDict(
        populate_by_name=True,
    )

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


#getting a student
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