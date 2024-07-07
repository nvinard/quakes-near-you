from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from typing import Annotated
from fastapi import Depends

# requirements to connect fastapi application to the sqlite db
URL_DATABASE = 'sqlite:///./quakes_near_me.db'
engine = create_engine(URL_DATABASE, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
db_dependency = Annotated[SessionLocal, Depends(get_db)]