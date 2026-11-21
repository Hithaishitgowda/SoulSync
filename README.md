# SoulSync ♥

**A dating app that matches people on habits and values, not just photos.**
Built for the verified eLitmus candidate community: young professionals who already trust the brand.

**Live app:** `<your-live-url>`  ·  **Code:** `<your-github-url>`

---

## The idea

Most dating apps rank people by looks and ask for almost nothing else, so matches are shallow and conversations die after two messages. SoulSync flips the order:

1. Verify who you are and where you want to look.
2. Take the **pH Test** (personality and habits) once.
3. See people **ranked by real compatibility**, with the shared traits that explain the score.

Why it fits eLitmus: the user base is already career-focused, in a narrow age band, and tied to a trusted brand. That helps with trust (verified identity) and with the empty-room problem every new dating app faces.

## What makes it different

| Typical dating app | SoulSync |
|---|---|
| Photo-first swiping | Compatibility-first ranking, photos second |
| One-sided filters | **Two-way** score: you fit their wishes *and* they fit yours |
| Vague "what I want" | Separate **about me** and **about my partner** questions, with **dealbreakers** |
| Black-box matching | Every card shows *why* you match (shared traits, in plain words) |
| Anyone can message anyone | Chat opens only after a **mutual like**, enforced in the database |

## Features

- Email signup and login, with a separate session per browser tab
- Profile with name, DOB, gender, who you want to date, country, state, district
- Demo Aadhaar-style ID check (see Legal and safety)
- **Region search:** within 5, 10, 25, 50, 100 or 250 km, same district, same state, same country, or anywhere
- Up to 5 photos, with a profile picture you can change
- **pH Test:** 15 questions about you and 15 about your ideal partner, multi-select, optional write-in answer, dealbreaker toggle
- Match feed ranked by compatibility %, with a ring score and shared-trait tags
- Likes, with live "someone liked you" alerts
- Live chat with toast, sound, unread badge and browser notifications

## How a user moves through the app

```
Sign up / Log in
      │
Create profile  ──►  Matches (filtered by gender + region)
                          │
                    Take the pH Test  (Part 1: about you, Part 2: your partner)
                          │
                    Matches re-ranked by compatibility %
                          │
                    Like  ──►  mutual like  ──►  Live chat
```

## How matching works

1. **Hard filters.** Gender interest must match both ways, and each person's region setting must accept the other. A broken **dealbreaker** removes the person entirely.
2. **Directional fit.** For each of your partner wishes, check whether the other person's answers overlap with what you accept. A dealbreaker counts 3×, a normal wish 1×. Do this in both directions to get `x` (you → them) and `y` (them → you).
3. **Similarity.** Average overlap (Jaccard) between your "about me" answers.
4. **Final score**

```
match % = 100 × ( 0.7 × √(x × y)  +  0.3 × similarity )
```

The geometric mean `√(x × y)` punishes one-sided matches: a 95% / 20% pair scores about 44%, not 57%. People who haven't taken the test yet still appear (so the feed is never empty) but show a heart instead of a percentage.

Written-in answers are saved and the first one shows on your card as a quote. They are **not** used in scoring.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Plain HTML, CSS and JavaScript | No build step, deploys anywhere, easy to read |
| Backend, auth, database | Supabase (Postgres, Auth, Row Level Security) | Free tier, relational data suits matching |
| Live updates | Supabase Realtime | Chat and likes without running a server |
| Hosting | Vercel (or Netlify) | Free static hosting |

```
 Browser (index.html + style.css + app.js)
        │  supabase-js
        ▼
 Supabase ── Auth (email + password)
          ── Postgres + Row Level Security (profiles, likes, messages)
          ── Realtime (new messages, new likes)
```

Matching runs in the browser from the data your account is allowed to read. That is fine for a demo; at scale it would move to a database function.

## Data model

| Table | Holds |
|---|---|
| `profiles` | identity, location, region setting, `answers` (about you), `wants` (partner wishes and dealbreakers), `notes` (write-ins), `photos` |
| `likes` | `from_id → to_id` |
| `messages` | `from_id`, `to_id`, `body` |

Row Level Security rules: you can read all profiles, edit only your own, see only likes that involve you, and send a message **only if the other person has also liked you**.

## Run it yourself

**1. Supabase**
1. Create a free project at supabase.com.
2. Authentication → Providers → Email: turn **off** "Confirm email".
3. SQL Editor: run `schema.sql`, then `realtime.sql`.
4. Project Settings → API: copy the **Project URL** and the **anon public** key into the top of `app.js` (and `seed.html`). Never use the `service_role` or `sb_secret_` key in this project.

**2. Run locally**
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

**3. Add demo people (optional)**
Open `http://localhost:8000/seed.html` and click **Create demo accounts**.

**Upgrading an older database?** Run `update.sql`, `photos.sql` and `realtime.sql` instead of `schema.sql`. `clean.sql` clears leftover demo profiles.

## Deploy

Push the folder to GitHub (leave `seed.html` out), import the repo in Vercel with framework **Other** and no build command, then set your Vercel address as the **Site URL** in Supabase → Authentication → URL Configuration.

## Demo logins

All passwords: `Soul@1234`

| Email | Notes |
|---|---|
| `rahul.demo@gmail.com` | man, Bengaluru. Already likes Neha |
| `neha.demo@gmail.com` | woman, Bengaluru. Already likes Rahul, so chat is ready |
| `<firstname>.demo@gmail.com` | 16 more: aarav, diya, kabir, meera, rohan, ananya, vikram, ishita, arjun, sneha, karan, priya, nikhil, riya, aditya, tara |

To see chat sync live, log in as Rahul in one window and Neha in a **private window**.

## Legal and safety

- **Identity check is a demo.** The app checks that a 12-digit number was entered, **never stores it**, and saves only a `verified` flag. Production plan: **DigiLocker API** (or Aadhaar offline e-KYC), which avoids holding Aadhaar numbers. Private companies cannot call UIDAI authentication freely since the 2018 Puttaswamy judgment.
- **18+ only.** DOB is required and under-18s are blocked (DPDP Act 2023 restricts children's data).
- **Location privacy.** Only district-level data and coordinates rounded to about 1 km are stored, and only if the user taps "Use my location".
- **Chat gate.** Messaging requires a mutual like, enforced by database policy and not just the interface.

## Monetization (planned, not built)

- **Free:** profile, test, a limited number of daily matches.
- **Premium:** unlimited matches, see who liked you, priority placement.
- **Trust badge:** optional eLitmus score or pH-test badge on a profile.

## Known limitations and next steps

- Any logged-in user can read other profiles, including DOB. Tighten before launch.
- Photos are stored as compressed images in the database; move to Supabase Storage for real use.
- Signup uses email because phone OTP needs a paid SMS provider.
- Not built yet: report and block, DPDP consent screen and data deletion, DigiLocker verification, written-answer matching, matching as a database function.

## Project structure

```
index.html     page shell
style.css      all styling
app.js         app logic: auth, profile, test, matching, feed, chat
seed.html      one-off page that creates the demo accounts
schema.sql     tables and security rules (fresh setup)
realtime.sql   turns on live chat and like alerts
update.sql, photos.sql, clean.sql   upgrade and cleanup helpers
```

## Disclosures

- **Third-party services and libraries:** Supabase, supabase-js (loaded from jsDelivr), Google Fonts (Playfair Display, Nunito). No templates or open-source app code were used.
- **AI assistance:** the code and design were built with help from Claude (Anthropic). Product decisions, scope and testing were my own.