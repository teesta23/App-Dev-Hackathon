# App-Dev-Hackathon

DOCUMENT FOR EACH USER:
username: string (required, unique)
email: string (required, unique)
password: string (hashed)
leetcode_username: string
points: number (default 0)
problems_solved: number (default 0)
daily_streak: number (default 0)
tournaments: array (default [])
tournaments_played: number (default 0)
tournaments_won: number (default 0)
bathroom: array (default [0,0,0,0,0,0,0,0,0,0])
    each index represents a different part of the bathroom
    i0-floor
    i1-walls
    i2-mirror
    i3-sink
    i4-toilet
    i5-trashcan
    i6-bathtub
    i7-shower curtain
    i8-shower head
    i9-rug
created_at: datetime
last_updated: datetime

To set up backend you have to run a couple commands on the terminal.

In the backend directory, run this command:
    Windows: python -m venv .venv
    Mac/Linux: python3 -m venv .venv

This creates a .venv dir for you in the backend folder.

Now you must run I GOT TIRED AND WENT TO BED I WILL FINISH TMR

