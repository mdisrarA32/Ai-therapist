# 🧠 AI Therapist — Intelligent Mental Health Support System

> An AI-powered mental health support platform that provides real-time, session-aware conversations, emotion detection, and safe, structured responses using modern web technologies and NLP.

---

## 📸 Project Preview

(Add your screenshots here — dashboard, chat UI, therapy session)

---

## 🌟 Key Features

### 🤖 AI-Powered Therapy Chat

* Real-time conversational AI using NLP
* Context-aware responses across sessions
* Calm, structured, and user-friendly replies
* Supports continuous conversation flow

---

### 🧠 Emotion & Risk Detection

* Detects user emotions from messages
* Classifies risk levels (low → high)
* Enables safety-first response system
* Helps identify stress, anxiety, and distress signals

---

### ⚠️ Safety & Crisis Handling

* Built-in crisis detection logic
* Safe response generation for sensitive cases
* Escalation-aware design (non-harmful, supportive replies)
* Designed with ethical AI principles

---

### 📊 Session & Activity Tracking

* Stores therapy sessions in database
* Tracks mood and activity logs
* Provides session history
* Enables future analytics & insights

---

### 🎤 Voice Interaction (Optional Feature)

* Speech-to-text for user input
* Text-to-speech AI responses
* Hands-free conversational experience

---

## 🛠 Tech Stack

### Frontend

* Next.js (React)
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* MongoDB

### AI Integration

* Google Gemini API / Local LLM (Ollama)

---

## 🏗 System Architecture

* Frontend communicates with backend via REST APIs
* Backend processes:

  * Authentication
  * Chat sessions
  * Emotion detection
  * AI response generation
* AI service generates structured therapy responses
* MongoDB stores sessions, users, and logs

---

## 🔒 Security & Privacy

* Environment variables for sensitive data
* JWT-based authentication
* Minimal user data storage (privacy-first approach)
* No exposure of API keys (.env protected)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mdisrarA32/Ai-therapist.git
cd Ai-therapist
```

---

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

### 3. Setup environment variables

Create `.env` files in both folders:

#### Backend `.env`

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_api_key
```

#### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### 4. Run the project

#### Backend

```bash
npm run dev
```

#### Frontend

```bash
npm run dev
```

---

## 📈 Future Improvements

* Advanced emotion classification using ML models
* Improved crisis detection accuracy
* Dashboard analytics & visual insights
* Multi-language support
* Deployment (Vercel + Render/Railway)
* Human-in-the-loop moderation system

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Md Israr
Computer Science Student | AI & Full Stack Developer

---

<p align="center">
Built with ❤️ for safe and accessible mental health support
</p>
