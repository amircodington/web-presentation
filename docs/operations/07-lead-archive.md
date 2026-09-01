# 07 — The Lead Archive

Everyone the booth met, from both places they can be logged. Background and reasoning:
[ADR 0007](../architecture/adr/0007-lead-archive-on-a-volume.md).

## Two capture surfaces, one archive

| | Kiosk form | Booth tablet |
|---|---|---|
| URL | the TV itself | `/booth?token=…` |
| Filled in by | the visitor | a member of staff |
| Who it captures | schools and organisations | anyone — teenager, parent, konkur, school, org |
| Extra fields | track, role, city | follow-up status |
| `source` in the record | `kiosk` | `booth` |

They exist separately because they are different conversations. A head teacher who chose to
leave a number will type it; a fourteen-year-old and their parent will not, and most of the
booth's traffic is that second kind — so staff log them afterwards, in about six taps.

Both write to the same directory and appear together in the archive, the CSV and the PDF.

## What happens when someone is logged

1. The visitor taps **ثبت درخواست همکاری** on a collaboration scene, *or* staff press
   **ثبت و نفر بعدی** on the tablet.
2. It posts to `POST /api/leads`, which validates it and writes one JSON file.
3. The file lands in `LEADS_DATA_DIR` — a named Docker volume in production, so it survives a
   rebuild, a rollback and a `docker compose down`.

Filenames sort chronologically: `20260901-141500-a1b2c3d4.json`.

## The tablet keeps working when the venue wifi does not

A submission that cannot reach the server is queued in the tablet's own storage and retried —
on the next save, when the browser reports the network is back, and whenever staff press
**تلاش دوباره**. The banner shows how many are still waiting.

The counter increments either way. The lead is captured the moment staff pressed save; whether
it has reached the disk yet is the queue's problem, not theirs, and a counter that stalls makes
them re-enter a visitor who has already walked away.

**The queue is the only copy until it drains.** Do not close the tab or clear the browser while
the banner is showing a number.

## Opening the archive

The archive is reached by **one secret link and nothing else**. No button on the kiosk links to
it, and the page returns an ordinary 404 without a valid token.

```
http://<SERVER_HOST>:<PROD_PORT>/leads?token=<LEADS_ACCESS_TOKEN>    # read and export
http://<SERVER_HOST>:<PROD_PORT>/booth?token=<LEADS_ACCESS_TOKEN>    # staff capture tablet
```

Both use the same token, so one link opens capture and one opens the archive.

Set the token before the festival:

```bash
cp .env.secrets.example .env.secrets
echo "LEADS_ACCESS_TOKEN=$(openssl rand -hex 24)" > .env.secrets
docker compose -f docker-compose.prod.yml up -d
```

`.env.secrets` is git-ignored and read by both compose files and by `next.config.ts` (so a bare
`npm run dev` sees it too). **An unset token closes the archive rather than opening it** — every
archive route answers 404 to everyone, including you.

Send the link to the booth lead once, privately. Anyone holding it can read and delete every
lead, so treat it like a password: it does not go in a QR code, a group chat, or a slide.

## What the page can do

| Action | Route |
|---|---|
| List every lead, newest first | the page itself |
| Every lead as raw JSON, for scripting a backup | `GET /api/leads/archive?format=json` |
| The same JSON as a saved file, for the nightly backup | `GET /api/leads/archive?format=json&download=1` |
| Download all as a Persian PDF | `GET /api/leads/archive?format=pdf` |
| Download all as CSV for Excel | `GET /api/leads/archive?format=csv` |
| Download one lead as a PDF | `GET /api/leads/archive/<id>` |
| Delete one lead | `DELETE /api/leads/archive/<id>` |
| Delete everything | `DELETE /api/leads/archive` |

Every route takes the same `?token=` (or an `x-leads-token` header). The PDF is rendered on
demand from the stored JSON with the same Vazirmatn the screen uses, so changing the layout
re-renders the whole history rather than leaving the archive in two designs.

Deletion is permanent — there is no bin. **Download before you delete.**

## Backing it up

The volume is the only copy. Before the machine is packed up, or before anyone clears the
archive:

```bash
# Everything, as one PDF and one CSV
curl -o leads.pdf "http://<host>:<port>/api/leads/archive?format=pdf&token=<token>"
curl -o leads.csv "http://<host>:<port>/api/leads/archive?format=csv&token=<token>"

# Or the raw JSON files, straight off the volume
docker compose -f docker-compose.prod.yml run --rm \
  kiosk tar -C /data/leads -cf - . > leads-backup.tar
```

Restore by extracting the tar back into the same directory; the files are self-describing and
the page picks them up on the next load.

## Retention

The archive holds names and phone numbers on the booth machine. Decide before the festival how
long they stay there, and use **حذف همه** once the leads have been moved into whatever the sales
team actually works from. A cleared archive is the end state, not an accident.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `/leads` 404s with the right link | `LEADS_ACCESS_TOKEN` is unset in the container — check `.env.secrets` is present and re-run `up -d` |
| The form says ثبت نشد | The volume is unwritable or full. `docker compose logs kiosk` |
| The archive is empty after a redeploy | The volume was removed (`down -v`), or `LEADS_DATA_DIR` was overridden to a path inside the container |
| The PDF has boxes instead of Persian | `public/fonts/` did not reach the image — see `public/fonts/README.md` |
