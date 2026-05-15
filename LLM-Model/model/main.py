from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from classification import predict_text
from llm import generate_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Mental Health Chatbot API is Running"
    }

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chatbot(request: ChatRequest):

    user_query = request.message

    predicted_class = predict_text(user_query)

    response = generate_response(user_query, predicted_class)

    return {
        "response": response
    }