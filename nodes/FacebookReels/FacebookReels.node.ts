import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

const ACTOR_ID = 'apivault_labs~facebook-reels-video-scraper';

export class FacebookReels implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Facebook Reels & Video Scraper - MP4, Transcript, No Login',
		name: 'facebookReels',
		icon: 'file:facebookreels.svg',
		group: ['transform'],
		version: 1,
		description: 'Run Facebook Reels & Video Scraper - MP4, Transcript, No Login through the hosted Apify Actor and return structured Dataset results.',
		defaults: { name: 'Facebook Reels & Video Scraper - MP4, Transcript, No Login' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'apifyApi', required: true }],
		properties: [
   {
      "displayName": "What do you want to scrape?",
      "name": "workflow",
      "description": "Choose one route for a clearer Console and MCP call. Auto-detect preserves existing API integrations and uses every supplied source.",
      "type": "options",
      "options": [
         {
            "name": "Auto-detect from my inputs (recommended)",
            "value": "auto"
         },
         {
            "name": "Specific Reel or Video URLs",
            "value": "videoUrls"
         },
         {
            "name": "Search by keyword or hashtag",
            "value": "search"
         },
         {
            "name": "Scrape a Profile or Page",
            "value": "profiles"
         },
         {
            "name": "Combine two or more sources",
            "value": "combined"
         }
      ],
      "default": "auto"
   },
   {
      "displayName": "Facebook Reel / Video URLs",
      "name": "startUrls",
      "description": "Public Facebook Reel or Video URLs. Paste real links from Facebook, one per line. Supports /reel/<id>, /watch/?v=<id>, /<page>/videos/<id>, fb.watch short links, bare IDs and copied Markdown links. Multiple representations of the same video are deduplicated. (comma or new-line separated)",
      "type": "string",
      "default": ""
   },
   {
      "displayName": "Keyword / hashtag search (optional)",
      "name": "searchQueries",
      "description": "Optional. Keywords or #hashtags to discover public Reels/Videos via search engines (keyless) — results are resolved to reel/video pages and enriched. Use instead of, or together with, URLs. (comma or new-line separated)",
      "type": "string",
      "default": ""
   },
   {
      "displayName": "Profile / Page URLs (scrape all reels)",
      "name": "profileUrls",
      "description": "Facebook page or profile URLs to discover and scrape ALL public reels. Supports facebook.com/nike, facebook.com/profile.php?id=..., or bare usernames. Up to maxReelsPerProfile reels scraped per profile. (comma or new-line separated)",
      "type": "string",
      "default": ""
   },
   {
      "displayName": "Max reels per profile",
      "name": "maxReelsPerProfile",
      "description": "How many reels to discover per profile URL. Uses page data + search engine discovery. Defaults to the maximum 200; the actual count depends on what Facebook exposes publicly.",
      "type": "number",
      "default": 200,
      "typeOptions": {
         "minValue": 1,
         "maxValue": 200
      }
   },
   {
      "displayName": "Max results (cost cap)",
      "name": "maxResults",
      "description": "Hard cap on the number of videos scraped and billed. Protects against runaway cost from large searches. 0 = no cap.",
      "type": "number",
      "default": 25,
      "typeOptions": {
         "minValue": 0,
         "maxValue": 5000
      }
   },
   {
      "displayName": "Output detail",
      "name": "outputPreset",
      "description": "Compact is best for AI agents and excludes long captions/transcripts. Engagement adds social metrics. Full preserves every available legacy field.",
      "type": "options",
      "options": [
         {
            "name": "Compact — small MCP response",
            "value": "compact"
         },
         {
            "name": "Engagement — compact plus social metrics",
            "value": "engagement"
         },
         {
            "name": "Full — every available field (legacy default)",
            "value": "full"
         }
      ],
      "default": "full"
   },
   {
      "displayName": "Max cost USD (cost cap)",
      "name": "maxCostUsd",
      "description": "Estimated video-event budget in USD, using an internal estimate of $0.004/video. Actual tier pricing, actor-start and platform usage may differ. Use Apify run charge limits for a total budget. 0 = no estimated video-event cap.",
      "type": "number",
      "default": 0,
      "typeOptions": {
         "minValue": 0
      }
   },
   {
      "displayName": "Only videos from last N days",
      "name": "sinceDays",
      "description": "Recency filter (gap feature — only 1/12 competitors have it). Keep only videos published within the last N days. Empty = no date filter.",
      "type": "number",
      "default": 0,
      "typeOptions": {
         "minValue": 1,
         "maxValue": 3650
      }
   },
   {
      "displayName": "Caption keyword filter",
      "name": "keywordFilter",
      "description": "Optional. Keep only videos whose caption/description contains this keyword (case-insensitive).",
      "type": "string",
      "default": ""
   },
   {
      "displayName": "Detail-page enrichment",
      "name": "enrichDetailPage",
      "description": "Fetch the full video page for richer data — view count, exact publish time, full caption, captions/subtitle track, creator follower count (gap feature — only 1/12). Slightly slower per video.",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Extract MP4 download URL",
      "name": "downloadMp4",
      "description": "Extract direct MP4 (HD/SD) playable URLs for each video. URLs are time-limited by Facebook — download promptly.",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Include native captions / transcript",
      "name": "includeTranscript",
      "description": "When the video has Facebook auto-generated or uploaded captions, fetch and parse them into plain-text transcript + timed cues. Free (no third-party ASR).",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Deduplicate",
      "name": "dedupe",
      "description": "Drop duplicate input URLs and duplicate output videos (same video ID), so the same Reel is never scraped or billed twice.",
      "type": "boolean",
      "default": true
   }
],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			try {
				const body: Record<string, unknown> = {};
				body["workflow"] = this.getNodeParameter("workflow", i);
				{ const _v = this.getNodeParameter("startUrls", i, '') as string; const _a = _v.split(/[,\n]/).map(s=>s.trim()).filter(s=>s.length>0); if (_a.length) body["startUrls"] = _a; }
				{ const _v = this.getNodeParameter("searchQueries", i, '') as string; const _a = _v.split(/[,\n]/).map(s=>s.trim()).filter(s=>s.length>0); if (_a.length) body["searchQueries"] = _a; }
				{ const _v = this.getNodeParameter("profileUrls", i, '') as string; const _a = _v.split(/[,\n]/).map(s=>s.trim()).filter(s=>s.length>0); if (_a.length) body["profileUrls"] = _a; }
				body["maxReelsPerProfile"] = this.getNodeParameter("maxReelsPerProfile", i);
				body["maxResults"] = this.getNodeParameter("maxResults", i);
				body["outputPreset"] = this.getNodeParameter("outputPreset", i);
				body["maxCostUsd"] = this.getNodeParameter("maxCostUsd", i);
				body["sinceDays"] = this.getNodeParameter("sinceDays", i);
				body["keywordFilter"] = this.getNodeParameter("keywordFilter", i);
				body["enrichDetailPage"] = this.getNodeParameter("enrichDetailPage", i);
				body["downloadMp4"] = this.getNodeParameter("downloadMp4", i);
				body["includeTranscript"] = this.getNodeParameter("includeTranscript", i);
				body["dedupe"] = this.getNodeParameter("dedupe", i);
				const options: IRequestOptions = {
					method: 'POST' as IHttpRequestMethods,
					url: `https://api.apify.com/v2/acts/${ACTOR_ID}/runs`,
					body,
					json: true,
				};
				const started = await this.helpers.requestWithAuthentication.call(this, 'apifyApi', options);
				const runId = started?.data?.id;
				if (!runId) throw new NodeOperationError(this.getNode(), 'Apify did not return a run ID', { itemIndex: i });
				let run = started.data;
				const deadline = Date.now() + 60 * 60 * 1000;
				while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) {
					if (Date.now() >= deadline) throw new NodeOperationError(this.getNode(), 'Waiting timed out; check the existing run in Apify before retrying', { itemIndex: i });
					const polled = await this.helpers.requestWithAuthentication.call(this, 'apifyApi', { method: 'GET', url: `https://api.apify.com/v2/actor-runs/${runId}?waitForFinish=20`, json: true });
					run = polled.data;
				}
				if (run.status !== 'SUCCEEDED') throw new NodeOperationError(this.getNode(), 'Apify run ended with status ' + run.status, { itemIndex: i });
				let offset = 0;
				while (true) {
					const page = await this.helpers.requestWithAuthentication.call(this, 'apifyApi', { method: 'GET', url: `https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?clean=1&limit=1000&offset=${offset}`, json: true });
					if (!Array.isArray(page)) throw new NodeOperationError(this.getNode(), 'Unexpected Dataset response', { itemIndex: i });
					for (const result of page) returnData.push({ json: result as IDataObject, pairedItem: { item: i } });
					offset += page.length;
					if (page.length < 1000) break;
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}
		return [returnData];
	}
}
