# Student Support Triage: How It Works

## Flow

```
┌─────────────────────────────────┐
│ 1. STUDENT'S RESPONSE           │
│                                 │
│  Rahul fills his own form:      │
│  • studies     • money          │
│  • mood        • social life    │
│  • daily routine • support      │
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│ 2. RESPONSES FROM HIS FRIENDS   │
│                                 │
│  Rohan    →  friend's response  │
│  Ananya   →  classmate response │
│  Karan    →  classmate response │
│  Meera    →  clubmate response  │
│                                 │
│  each one answers:              │
│  • how has Rahul been?          │
│  • what has changed recently?   │
│  • anything else noticed?       │
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│ 3. SERVER                       │
│                                 │
│  • combines Rahul's answers     │
│    + all 4 friends' responses   │
│  • adds the AI rulebook         │
│  • adds the secret API key      │
└────────────────┬────────────────┘
                 │  API call (HTTPS)
                 ▼
┌─────────────────────────────────┐
│ 4. AI  (Claude API)             │
│                                 │
│  • scores 5 areas out of 10     │
│  • checks if the friends back   │
│    up what Rahul said           │
│  • decides risk level + urgency │
│  • picks the departments        │
└────────────────┬────────────────┘
                 │  JSON reply
                 ▼
┌─────────────────────────────────┐
│ 5. SERVER CHECKS THE REPLY      │
│                                 │
│  • is it valid?                 │
│  • only real departments?       │
└────────────────┬────────────────┘
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 6. DETAILED ROUTING                                      │
│                                                          │
│  Risk: HIGH     Urgency: URGENT     Confidence: HIGH     │
│                                                          │
│  ① COUNSELLING       stress very high, mood low, sleep   │
│                      worse, wants wellbeing support      │
│  ② ACADEMIC AFFAIRS  workload very difficult, missed     │
│                      deadlines (Karan confirms)          │
│  ③ FINANCIAL AID     money worries affecting studies     │
│                                                          │
│  + key signals, friend corroboration, suggested next step│
└──────────────────────────────────────────────────────────┘

        The AI recommends. People review and decide.
```

## In short

Rahul answers about himself, and his friends answer about him. The server sends both to the AI. The AI weighs them together, and the case goes to the right teams in priority order, with a reason for each.

## Mermaid version

Renders as a diagram on GitHub and in VS Code's Markdown preview.

```mermaid
flowchart TD
    A["1. Student's response<br/>studies, money, mood, social, routine, support"] --> B
    B["2. Responses from his friends<br/>Rohan (friend), Ananya and Karan (classmates), Meera (clubmate)"] --> C
    C["3. Server<br/>combines answers + rulebook + secret API key"] -->|API call over HTTPS| D
    D["4. AI (Claude API)<br/>scores 5 areas, cross-checks friends,<br/>sets risk and urgency, picks departments"] -->|JSON reply| E
    E["5. Server checks the reply<br/>valid JSON, real departments only"] --> F
    F["6. Detailed routing<br/>risk, urgency, ordered departments with reasons"]
    F --> G1["Counselling"]
    F --> G2["Academic Affairs"]
    F --> G3["Financial Aid"]
    F --> G4["Student Life"]
    F --> G5["Health Services"]
    F --> G6["Crisis Response"]
```

## Where each part lives

| Step | File |
|---|---|
| 1-2. Form (student + friends) | `public/index.html` |
| 3, 5. Server | `server.js` |
| 4. AI rulebook | `prompt.txt` |
| Student details, fallback friend answers | `demo_data.json` |
| API key | `.env` |
