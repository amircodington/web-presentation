# 05 — Kiosk Deployment

## The setup

```text
┌──────────────────────────────────────────┐
│  Touchscreen TV  (HDMI + USB touch)      │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────┴───────────────────────┐
│  Mini-PC at the booth                    │
│    Docker → Next.js standalone :8080     │
│    Chromium in kiosk mode → localhost    │
│    Autostart on boot, no login prompt    │
└──────────────────────────────────────────┘
```

Everything runs locally. **The app must work with the network cable unplugged**, and that gets
tested before the machine leaves the office — not discovered at the venue.

## Bringing it up

```bash
git clone <repo> && cd web-presentation
git checkout v1.0.0                       # always a tag, never a branch
docker compose -f docker-compose.prod.yml up -d --build
curl -f http://localhost:8080/api/health
```

## Chromium in kiosk mode

```bash
chromium \
  --kiosk http://localhost:8080 \
  --incognito \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --autoplay-policy=no-user-gesture-required \
  --check-for-update-interval=31536000
```

Each flag earns its place. `--incognito` guarantees no state survives between visitors.
`--disable-pinch` and `--overscroll-history-navigation=0` stop the browser hijacking gestures
the app handles itself — without them, a two-finger swipe navigates *back* out of the kiosk,
which is the most visible possible failure. `--autoplay-policy` is what lets background video
start without a tap. `--disable-session-crashed-bubble` prevents a "Chrome didn't shut down
correctly" dialog from being the thing on screen after a power cut.

## Machine preparation checklist

- [ ] Auto-login to the desktop session, no password prompt
- [ ] Docker starts on boot (`systemctl enable docker`)
- [ ] Chromium autostarts after the container is healthy (wrapper script that polls
      `/api/health` first — starting the browser before the app is up shows an error page)
- [ ] Screen blanking, screensaver, sleep and hibernate **all disabled**
- [ ] Automatic OS and browser updates **disabled** — an unattended update mid-festival is
      an unattended outage
- [ ] Notifications disabled
- [ ] Mouse cursor hidden (`unclutter -idle 0`)
- [ ] On-screen keyboard configured if the lead form is enabled
- [ ] Display resolution and orientation set and verified with the real content
- [ ] Touch input calibrated — especially near the screen edges, where mis-calibration is
      worst and where the back and reset controls live
- [ ] Volume muted at the OS level
- [ ] Container `restart: unless-stopped`, and a full power-cycle test passes unattended

## The day-before rehearsal

Do this in full, with the real machine and the real TV:

1. Cold boot. The attract loop must appear with no interaction. **Time it.**
2. Walk the complete journey on the actual touchscreen — not a laptop trackpad. Touch targets
   that feel fine with a mouse can be unreachable with a thumb at standing height.
3. Leave it idle past the timeout. Confirm it returns to attract and the session is clear.
4. Start the quiz, walk away mid-way, come back. The next visitor must see a clean start.
5. **Unplug the network.** Repeat steps 1–4.
6. Pull the power mid-transition. Confirm it comes back unattended.
7. Check every QR code with an actual phone. A QR pointing at a dead URL is worse than no QR.
8. Verify prices, dates and the offer toggle against what the client signed off that morning.
9. Look at the screen from ten metres. If it does not stop you, the attract loop needs work.

## On-site operation

The hidden admin overlay (five taps in the top-left corner) shows the running `APP_VERSION`,
exports buffered leads as CSV, reloads content without a restart, and force-resets the session.

**Recovering a bad build**, in order of preference:

```bash
# 1. Roll back to a known-good tagged image — no rebuild, no network
APP_VERSION=1.1.0 docker compose -f docker-compose.prod.yml up -d

# 2. Restart the container
docker compose -f docker-compose.prod.yml restart

# 3. Reboot the machine
```

Print this section and tape it inside the booth. The person standing next to the screen when
something breaks is not going to be the person who wrote it.
