# Game Night Satisfaction Survey™

Lives at `/survey/` (so `https://thomassteckmann.com/survey/`).

## What's here

```
survey/
  index.html           # the survey
  results.html         # public results dashboard at /survey/results.html
  styles.css           # shared styles
  results.css          # extra styles for the results page
  app.js               # survey interactive logic + Supabase submit
  results.js           # results aggregation + rendering
  config.js            # tokens go here — fill in before going live
  schema.sql           # run this once in Supabase SQL editor
  edge-function/
    reformat/
      index.ts         # Supabase Edge Function for the Haiku rewrite
```

The results page lives at `/survey/results.html` and reads
`gn_responses` directly via the anon key. `schema.sql` includes a
`select` policy for the anon role on `gn_responses` (events stay
write-only). If you'd rather keep results private, drop that policy
and the page will show "Could not load results."

## Setup checklist

### 1. Database
Open the Supabase SQL editor for whichever project you're using and run
`schema.sql`. This creates `gn_responses` and `gn_events` with anon-insert-only
RLS, so it cannot interfere with anything else in the project.

### 2. Edge function for the Haiku reformatter
From the project root with the Supabase CLI installed and logged in:

```bash
# from this directory:
supabase functions deploy reformat --project-ref <your-project-ref> --no-verify-jwt
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref <your-project-ref>
```

The function source lives in `edge-function/reformat/index.ts`. The Supabase CLI
expects functions under `supabase/functions/<name>/index.ts`, so you may want to
either symlink or move the file when deploying:

```bash
mkdir -p supabase/functions/reformat
cp edge-function/reformat/index.ts supabase/functions/reformat/index.ts
supabase functions deploy reformat --no-verify-jwt
```

After deploy, the function URL will look like
`https://<project-ref>.supabase.co/functions/v1/reformat`.

### 3. Fill in `config.js`
Replace the three `REPLACE_ME` values with:
- `SUPABASE_URL` — from project settings → API
- `SUPABASE_ANON_KEY` — the **anon public** key from the same screen
- `REFORMAT_FN_URL` — the URL printed after `functions deploy`

For local testing without the edge function, set
`DISABLE_REFORMATTER: true` and the page will skip the rewrite and just
submit the raw text.

### 4. Test locally
```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000/survey/
```

### 5. Ship it
Push to GitHub. GitHub Pages picks up the `/survey/` directory automatically
since this is a Pages site.

## Reading the data

The anon key cannot read anything — only insert. To look at responses, use
the Supabase dashboard's table editor on `gn_responses` and `gn_events`,
or query with the service-role key from a private context.

Useful queries:

```sql
-- everything
select created_at, payload, feedback_original, feedback_rewritten, rage_score
from gn_responses order by created_at desc;

-- focaccia naming-and-shaming leaderboard
select payload->>'q2_focaccia' as accused, count(*)
from gn_responses
group by 1 order by 2 desc;

-- who fought hardest with the survey
select payload->>'q2_focaccia' as name, rage_score
from gn_responses order by rage_score desc limit 10;

-- nonsense slider averages
select
  avg((payload->>'ns_thomas_fight')::int) as thomas_fight,
  avg((payload->>'ns_snacks')::int)        as snacks,
  avg((payload->>'ns_seating')::int)       as seating,
  avg((payload->>'ns_noise')::int)         as noise,
  avg((payload->>'ns_vibes')::int)         as vibes
from gn_responses;
```

## Notes

- Adding these tables to an existing Supabase project is safe — table names
  are prefixed `gn_` and RLS is configured per-table, so existing tables and
  policies are unaffected.
- The anon key embedded in `config.js` is public by design; it can only do
  what your RLS policies allow. As long as your *other* tables have proper
  RLS (anon can only do what you'd let any visitor do), this is fine.
- If you'd rather isolate completely, spin up a separate free Supabase project
  for this — takes about 90 seconds.
