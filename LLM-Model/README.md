# 🧠  Mental Health Chatbot

Mental health chatbot is an AI-powered Mental Health Chatbot built using **FastAPI**, **BERT**, and **Ollama LLM**.  
The chatbot first classifies the user's mental health condition using a fine-tuned BERT model and then generates supportive and empathetic responses using a local Large Language Model (LLM).

---

# 🚀 Features

- Mental health text classification using BERT
- Detects:
  - Anxiety
  - Depression
  - Normal
  - Suicidal
- AI-generated supportive responses
- FastAPI backend
- Ollama LLM integration
- REST API support
- Frontend can be connected easily
- Runs locally on your machine

---

# 🛠️ Technologies Used

## Backend
- Python
- FastAPI
- Uvicorn

## Machine Learning
- BERT
- Transformers
- PyTorch
- Scikit-learn

## LLM
- Ollama
- TinyLlama

---

# 📓 Google Colab Notebook

You can view the complete BERT fine-tuning notebook here:

👉 [Open in Google Colab](https://colab.research.google.com/drive/1bAJg3UtE7GlLnSJrFiT8EJ4rZ9MPJaFN?usp=sharing)

---

# 📊 Dataset

Dataset used for training the mental health classification model:

👉 [Mental Health Text Classification Dataset](https://huggingface.co/datasets/ourafla/Mental-Health_Text-Classification_Dataset/tree/main)

---

# 📂 Project Structure

```bash
MENTAL_HEALTH_CHATBOT/
│
├── env/
│
├── model/
│   ├── bert_tweet_model/
│   ├── results/
│   ├── classification.py
│   ├── llm.py
│   ├── main.py
│
├── Finetune_bert.ipynb
├── requirements.txt
├── .gitignore
│
└── README.md
```

---

# ⚙️ How It Works

## Step 1: User sends a message

Example:

```text
I feel stressed and anxious all the time
```

---

## Step 2: BERT Model Classification

The BERT model predicts the mental health category.

Example:

```text
Anxiety
```

The classification logic is implemented in:

```python
predict_text(text)
```

using:
- BertTokenizer
- BertForSequenceClassification

:contentReference[oaicite:0]{index=0}

---

## Step 3: LLM Response Generation

The predicted class and user query are passed to Ollama LLM.

The chatbot:
- Gives supportive responses
- Avoids harmful advice
- Refuses unrelated topics
- Encourages professional help for suicidal intent

Implemented in:

```python
generate_response(user_query, predicted_class)
```

using:
- Ollama
- TinyLlama

:contentReference[oaicite:1]{index=1}

---

## Step 4: FastAPI Returns Response

FastAPI handles API requests and returns the chatbot response.

Available endpoints:

### GET `/`

Checks if API is running.

### POST `/chat`

Send user message and receive AI response.

Implemented in:

```python
@app.post("/chat")
```

:contentReference[oaicite:2]{index=2}

---

# 📦 Installation

## 1️⃣ Clone Repository

```bash
git clone  https://github.com/Lovekumar-Creative/Mental-Health-chatbot.git
```

---

## 2️⃣ Open Project Folder

```bash
cd MENTAL_HEALTH_CHATBOT
```

---

## 3️⃣ Create Virtual Environment

```bash
python -m venv env
```

---

## 4️⃣ Activate Virtual Environment

### Windows

```bash
.\env\Scripts\activate
```

### Linux / Mac

```bash
source env/bin/activate
```

---

## 5️⃣ Install Requirements

```bash
pip install -r requirements.txt
```

Dependencies used:

```text
transformers
torch
scikit-learn
fastapi
uvicorn
ollama
pydantic
```

:contentReference[oaicite:3]{index=3}

---

# 🤖 Install Ollama

Download Ollama:

```text
https://ollama.com/download
```

---

# 📥 Pull TinyLlama Model

```bash
ollama run tinyllama
```

This downloads the TinyLlama model locally.

---

# ▶️ Run FastAPI Server

From project root folder:

```bash
uvicorn model.main:app --reload
```

---

# 🌐 API URLs

## Home Route

```text
http://127.0.0.1:8000
```

---

## Swagger Documentation

```text
http://127.0.0.1:8000/docs
```

---

# 📮 API Request Example

## POST `/chat`

### Request Body

```json
{
  "message": "I feel lonely and depressed"
}
```

---

### Response

```json
{
  "response": "I'm sorry you're feeling this way. Talking to someone you trust may help."
}
```

---

# 🧪 Model Training

The BERT model was fine-tuned using:

```text
Finetune_bert.ipynb
```

Training includes:
- Tokenization
- Label Encoding
- Fine-tuning BERT
- Saving trained model

---

# 🔒 Safety Features

The chatbot:
- Only answers mental health related questions
- Avoids harmful responses
- Does not provide medical diagnosis
- Encourages professional help during crisis situations

---

# 📌 Future Improvements

- Better frontend UI
- User authentication
- Chat history
- Database integration
- Deployment on cloud
- Voice support
- Multi-language support

---

# 👨‍💻 Author

## Love Kumar

BTech Computer Science Engineering

---

# ⭐ If You Like This Project

Give this repository a star ⭐