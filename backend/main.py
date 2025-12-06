import os
from typing import List, Optional

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
    lcUsername: str = Field(...)
    model_config = ConfigDict(
        populate_by_name=True,
    )

class UpdateUserModel(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    lcUsername: str | None = None
    model_config = ConfigDict(
        json_encoders={ObjectId: str},
    )


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LeetCodeLinkRequest(BaseModel):
    lcUsername: str

class LoginRequest(BaseModel):
    username: str
    password: str

class HomeRequest(BaseModel):
    username: str
    points: int = 0
    #tournaments: 

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
