# Night immersion API
The night experiment is at /pre-sleep/night/. It uses a Netlify function at /.netlify/functions/night-scene.

## Setup
In the existing Netlify project for anikara.systems, set OPENAI_API_KEY as a secret environment variable available to Functions in the Production deploy context. Never add the value to Git, HTML, or a browser field. Redeploy after changing the environment variable.
OPENAI_MODEL is optional; the default is gpt-4o-mini. The model must support the Responses API and strict Structured Outputs.
API usage is billed to the OpenAI project associated with the key.

## Behavior
- One request prepares five passages; saved replay makes no model request.
- Scene drafts autosave and restore in the same browser and origin. Existing anikara_night_scene_v1 and anikara_scene_proof values migrate as fallbacks.
- Guidance and source scene are stored in browser localStorage. Storage can be unavailable or cleared; the UI reports saving failures. Cross-device syncing is not implemented.
- Prepared guidance is shown in large text with 24/28/32/36/40-second intervals, then fades into quiet.
- User text and generated text use textContent, never innerHTML.
- No scene text is logged by the function. OpenAI requests set store:false; this does not override the provider's other data-retention policies.
- Input/output size limits, a request timeout, explicit failure responses, and a Netlify domain-level limit of 8 requests per 60 seconds bound this prototype's endpoint. This is a public endpoint, not authenticated personal access.
- The optional evening note stays in the browser and is not sent to the model.

## Checks
Run node --test night-scene.test.mjs.
Mocked tests cover request validation, absent keys, structured output, upstream failures and refusals. A live generation test is still required after configuring the key. Evaluate that passages preserve supplied details without inventing them, including on short or vague scenes.

If Netlify supplies OPENAI_API_KEY and OPENAI_BASE_URL through its AI Gateway, the function respects that base URL; usage is then billed through Netlify credits. Otherwise it calls OpenAI directly with your configured key.
