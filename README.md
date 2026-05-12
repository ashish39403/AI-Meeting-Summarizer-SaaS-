# 🚀 MeetWise – AI Meeting Summarizer



AI-powered meeting summarization platform built with Django, React, TypeScript, and OpenAI-compatible LLMs.

Transform long meeting transcripts into structured summaries, action items, decisions, and sentiment insights in seconds.


---

# ✨ Features

MeetWise is a full-stack AI-powered meeting summarization platform built with Django, React, TypeScript, and OpenAI-compatible LLMs. The application helps users convert long meeting transcripts into structured summaries, key decisions, action items, and sentiment analysis in seconds.

---

# 🧠 Core AI Features

* AI-generated meeting summaries
* Automatic extraction of:

  * Key decisions
  * Action items
  * Key discussion points
  * Attendees
  * Sentiment analysis
* JWT Authentication
* Protected Routes
* Modern responsive UI
* Meeting history management
* REST API with Django REST Framework
* OpenAI / OpenAI-compatible LLM integration
* Retry mechanism for LLM failures
* Token usage and cost tracking

---

---





# ⚡ Installation

# 1. Clone Repository

```bash
git clone https://github.com/your-username/ai-meeting-summarizer.git
cd ai-meeting-summarizer
```

---

# 🐍 Backend Setup

## 1. Create Virtual Environment

```bash
python -m venv venv
```

## 2. Activate Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Create .env

```env
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=your_base_url
SECRET_KEY=your_secret_key
DEBUG=True
```

## 5. Run Migrations

```bash
python manage.py migrate
```

## 6. Start Backend Server

```bash
python manage.py runserver
```

Backend runs on:

```bash
http://127.0.0.1:8000/
```

---

## 💻 Frontend Setup

## 1. Navigate to Frontend

```bash
cd frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173/
```

---

---

## 📄 Example AI Output

```json
{
  "summary": "The team reviewed the current project progress and discussed infrastructure issues affecting deployment timelines.",
  "short_summary": "Deployment blockers and project priorities discussed.",
  "decisions": [
    "Decision: Prioritize infrastructure fixes before deployment"
  ],
  "action_items": [
    "Rohan: Fix deployment pipeline",
    "Someone: Review API documentation"
  ],
  "key_points": [
    "Infrastructure stability concerns raised",
    "Authentication issues discussed",
    "Frontend improvements pending"
  ],
  "attendees": [
    "Rohan"
  ],
  "sentiment": "neutral"
}
```

---

---

## 🛡️ Security

* JWT Authentication
* Protected API routes
* Environment variable management
* Secure password hashing
* Token refresh flow

---

---

## 🚀 Future Improvements

* Real-time transcription
* Audio upload support
* WebSocket integration
* Team collaboration
* PDF export
* Email summary delivery
* Multi-model AI support
* Vector database integration

---

---

## 📸 Screenshots

Add screenshots of:

* Login Page
* Dashboard
* Meeting Summary
* AI Generated Output


This project is licensed under the MIT License.
