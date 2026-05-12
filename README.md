# 📌 What This Project Does
AI Meeting Summarizer is a production-ready SaaS backend that converts meeting transcripts into actionable insights using OpenAI GPT-4o-mini. Instead of reading hours of meeting notes, you get:

100-200 word executive summaries

Key decisions extracted automatically

Action items with assigned owners

Attendee detection and sentiment analysis

Token usage tracking and cost calculation

Built with Django REST Framework, JWT authentication, credit-based billing, and async processing (Celery + Redis).



# ✨ Why It's Useful

Problem	Solution
Long meetings = wasted time	AI summarizes in seconds
Missed action items	Auto-extracted tasks
No accountability	Track decisions + owners
Scaling costs	Pay-per-summary credit system
Slow API calls	Async processing (no timeout)
Perfect for: Teams, project managers, executives, students, or anyone who attends meetings.


# Installation

# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-meeting-summarizer-backend.git
cd ai-meeting-summarizer-backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 5. Run migrations
python manage.py migrate
python manage.py createsuperuser

# 6. Start services (3 terminals needed)
redis-server                                    # Terminal 1
celery -A core worker --pool=solo -l info      # Terminal 2
python manage.py runserver                      # Terminal 3



# 🚧 What's Coming

Live Voice Extraction

One Click Integration with Apps like ZOOM and Google Meet

Stripe/Razorpay integration

Docker + Docker Compose

Email notifications
