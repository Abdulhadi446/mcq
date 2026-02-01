# 🧠 Infinite MCQ Generator

A simple static HTML app that generates endless multiple-choice questions using **Sodeom AI**. No server required — just open in a browser!

## Features

- **Infinite questions** — AI generates new MCQs on any topic
- **Instant feedback** — See if you're correct with explanations
- **Score tracking** — Track your progress and streaks
- **History** — Review past questions
- **Works offline** — Stats saved in localStorage
- **Mobile friendly** — Responsive design

## Quick Start

### Option 1: Open directly

Just double-click `index.html` to open in your browser.

### Option 2: Local server (recommended for best experience)

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx http-server . -p 8080

# Using PHP
php -S localhost:8080
```

Then open [http://localhost:8080](http://localhost:8080)

## How It Works

1. **Enter a topic** (e.g., "JavaScript", "World History", "Biology")
2. **Click Start** to generate your first question
3. **Select an answer** — you'll see immediate feedback
4. **Click Next** to get another question
5. **Keep going** — it's infinite!

## Tech Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- [Sodeom AI API](https://sodeom.com/ai) for question generation
- localStorage for persistence

## Files

```
mcq/
├── index.html          # Main page
├── assets/
│   └── css/
│       └── styles.css  # Styling
├── src/
│   ├── app.js          # Main app logic
│   ├── api.js          # Sodeom AI integration
│   └── storage.js      # localStorage helpers
└── README.md
```

## API Usage

The app uses Sodeom's `/ai` endpoint:

```
POST https://sodeom.com/ai
Content-Type: application/json

{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "Generate MCQ about..."}
  ]
}
```

Response: `{"answer": "{...JSON MCQ...}"}`

## Customization

Edit `src/api.js` to change:

- `SYSTEM_PROMPT` — How AI formats questions
- `temperature` — Higher = more creative, Lower = more consistent

## License

MIT — Use freely!
