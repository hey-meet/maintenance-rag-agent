"""
Week 3 LLM Service
"""
import os
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import HumanMessage

load_dotenv()

LLM_MODEL = "mistral-small-2506"

LLM_TEMPARATURE = 0.5
