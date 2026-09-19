# n8n-nodes-apivault-facebook-reels

An [n8n](https://n8n.io) community node for **Facebook Reels & Video Scraper - MP4, Transcript, No Login**, powered by the [`apivault_labs/facebook-reels-video-scraper` Apify Actor](https://apify.com/apivault_labs/facebook-reels-video-scraper).

Run Facebook Reels & Video Scraper - MP4, Transcript, No Login through the hosted Apify Actor and return structured Dataset results.

The node is a thin connector: collection, analysis, retries and billing run in the hosted Actor. It contains no private scraper implementation or embedded credentials.

## Installation

1. Open **Settings → Community Nodes** in your n8n instance.
2. Select **Install**.
3. Enter `n8n-nodes-apivault-facebook-reels` and confirm.

## Credentials

Create an **Apify API** credential in n8n and paste your personal token from [Apify Console → Integrations](https://console.apify.com/account/integrations). The token is sent to Apify as a bearer credential and is never bundled with this package.

## Usage

Add **Facebook Reels & Video Scraper - MP4, Transcript, No Login** to a workflow, fill the public Actor inputs below, and execute the node. Every Dataset result becomes one n8n item, so it can flow into Sheets, databases, CRMs, alerts or your own code. The node respects n8n's **Continue On Fail** behavior.

## Ready-to-import workflow

Import [`examples/quickstart-workflow.json`](examples/quickstart-workflow.json), select your Apify API credential in the Actor node, replace the sample business inputs and run it. The workflow returns destination-ready rows without exposing Actor internals.

| Input | Type | Description |
|---|---|---|
| `workflow` | `string` | Choose one route for a clearer Console and MCP call. Auto-detect preserves existing API integrations and uses every supplied source. |
| `startUrls` | `array` | Public Facebook Reel or Video URLs. Paste real links from Facebook, one per line. Supports /reel/<id>, /watch/?v=<id>, /<page>/videos/<id>, fb.watch short links, bare IDs and copie |
| `searchQueries` | `array` | Optional. Keywords or #hashtags to discover public Reels/Videos via search engines (keyless) — results are resolved to reel/video pages and enriched. Use instead of, or together wi |
| `profileUrls` | `array` | Facebook page or profile URLs to discover and scrape ALL public reels. Supports facebook.com/nike, facebook.com/profile.php?id=..., or bare usernames. Up to maxReelsPerProfile reel |
| `maxReelsPerProfile` | `integer` | How many reels to discover per profile URL. Uses page data + search engine discovery. Defaults to the maximum 200; the actual count depends on what Facebook exposes publicly. |
| `maxResults` | `integer` | Hard cap on the number of videos scraped and billed. Protects against runaway cost from large searches. 0 = no cap. |
| `outputPreset` | `string` | Compact is best for AI agents and excludes long captions/transcripts. Engagement adds social metrics. Full preserves every available legacy field. |
| `maxCostUsd` | `number` | Estimated video-event budget in USD, using an internal estimate of $0.004/video. Actual tier pricing, actor-start and platform usage may differ. Use Apify run charge limits for a t |
| `sinceDays` | `integer` | Recency filter (gap feature — only 1/12 competitors have it). Keep only videos published within the last N days. Empty = no date filter. |
| `keywordFilter` | `string` | Optional. Keep only videos whose caption/description contains this keyword (case-insensitive). |
| `enrichDetailPage` | `boolean` | Fetch the full video page for richer data — view count, exact publish time, full caption, captions/subtitle track, creator follower count (gap feature — only 1/12). Slightly slower |
| `downloadMp4` | `boolean` | Extract direct MP4 (HD/SD) playable URLs for each video. URLs are time-limited by Facebook — download promptly. |
| `includeTranscript` | `boolean` | When the video has Facebook auto-generated or uploaded captions, fetch and parse them into plain-text transcript + timed cues. Free (no third-party ASR). |
| `dedupe` | `boolean` | Drop duplicate input URLs and duplicate output videos (same video ID), so the same Reel is never scraped or billed twice. |

## Pricing

The package is free. Actor runs are billed by Apify using the pricing shown on the [Actor page](https://apify.com/apivault_labs/facebook-reels-video-scraper); platform usage may also apply.

## Resources

- [Actor and live input schema](https://apify.com/apivault_labs/facebook-reels-video-scraper)
- [Source repository](https://github.com/apivault-labs/n8n-nodes-apivault-facebook-reels)
- [n8n community-node documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT. The hosted Actor is a separate paid service governed by Apify terms.
