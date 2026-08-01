# The Astlands — campaign site

A simple website chronicling The Astlands campaign. No build tools, no installs —
just HTML and CSS files that any browser can open directly.

## Files

- `index.html` — Story So Far (homepage)
- `sessions.html` — session-by-session log
- `party.html` — player characters
- `npcs.html` — NPCs
- `world.html` — locations, factions, races, bestiary, items
- `lore.html` — world lore + Professor Godt's journals
- `style.css` — shared styling for all pages

## Publishing it for free with GitHub Pages

You said you've already got a GitHub account — here's the whole path from zero to a live link.

1. **Create a new repository.** Go to github.com, click the **+** in the top right → **New repository**. Name it anything, e.g. `astlands`. Leave it **Public**. Click **Create repository**.
2. **Upload the files.** On the new repo's page, click **Add file → Upload files**. Drag in all the files from this folder (`index.html`, `sessions.html`, `party.html`, `npcs.html`, `world.html`, `lore.html`, `style.css`). Scroll down and click **Commit changes**.
3. **Turn on Pages.** In the repo, go to **Settings → Pages** (left sidebar). Under "Build and deployment," set **Source** to **Deploy from a branch**, then set **Branch** to `main` and folder to `/ (root)`. Click **Save**.
4. **Wait a minute, then visit your site.** GitHub will show a link at the top of that same Pages settings screen, something like:
   `https://YOUR-USERNAME.github.io/astlands/`
   It can take a minute or two to go live the first time.

That's it — no command line, no build step. To update the site later, just go back into the repo and use **Add file → Upload files** again with the changed page, or click into a file and use the pencil (edit) icon to change it directly in the browser.

## Making changes yourself

Every page is plain HTML — you can open any `.html` file in a text editor (or edit it
right in GitHub using the pencil icon) and change the words between the tags. A few
useful spots:

- New session: copy one `<article class="session-entry">…</article>` block in
  `sessions.html` and edit the text inside it.
- New character or NPC: copy one `<div class="card">…</div>` block in `party.html` or
  `npcs.html`.
- New location/faction/race/item: copy one `<div class="item">…</div>` block in
  `world.html`.

If you'd rather just tell me what changed in the campaign, paste it here and I'll
update the HTML for you.
