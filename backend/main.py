from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

#mongodb stuff
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
MONGO_DB = os.getenv("MONGO_DB")

# CREATE A VIRTUAL ENVIRONMENT AND INSTALL THE REQUIRED FASTAPI PACKAGES

app = FastAPI()

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

@app.post("/register")
async def register_user(data: RegisterRequest):
    #for right now just success response. no interaction with mongodb
    return {
        "message": "User registered successfully",
        "username": data.username,
        "email": data.email,
    }

@app.post("/login")
async def login_user(data: LoginRequest):
    #same thing, this is just so frontend can use it
    return {
        "message": "Login successful",
        "username": data.username
    }

@app.post("/link")
async def link_user(data: LeetCodeLinkRequest):
    #same thing
    return {
        "message": "Link successful",
        "lcUsername": data.lcUsername
    }