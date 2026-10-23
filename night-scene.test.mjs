import {test, after} from "node:test";
import assert from "node:assert/strict";
import handler from "./netlify/functions/night-scene.mjs";
const originalFetch=globalThis.fetch,originalKey=process.env.OPENAI_API_KEY;
after(()=>{globalThis.fetch=originalFetch;if(originalKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=originalKey;});
const req=(body,headers={})=>new Request("https://example.com/.netlify/functions/night-scene",{method:"POST",headers:{"Content-Type":"application/json",...headers},body:JSON.stringify(body)});
test("rejects cross-origin, invalid and oversized scenes before model use",async()=>{
 assert.equal((await handler(req({scene:"A quiet scene."},{origin:"https://other.test"}))).status,403);
 assert.equal((await handler(req(null))).status,400);
 assert.equal((await handler(req({scene:"a".repeat(2001)}))).status,400);
});
test("missing key returns useful setup error without model call",async()=>{
 delete process.env.OPENAI_API_KEY;
 globalThis.fetch=()=>{throw Error("must not call");};
 const response=await handler(req({scene:"A quiet room with a soft chair."}));
 assert.equal(response.status,503);assert.equal((await response.json()).code,"NOT_CONFIGURED");
});
test("generation uses server key, nonstored structured output and validates passages",async()=>{
 process.env.OPENAI_API_KEY="test-key";
 const passages=Array.from({length:5},(_,i)=>"A gentle passage number "+i+".");
 let sent;
 globalThis.fetch=async(url,options)=>{assert.equal(url,"https://api.openai.com/v1/responses");assert.equal(options.headers.Authorization,"Bearer test-key");sent=JSON.parse(options.body);return Response.json({status:"completed",output:[{type:"message",content:[{type:"output_text",text:JSON.stringify({passages,message:""})}]}]});};
 const response=await handler(req({scene:"A quiet room with a soft chair."}));
 assert.equal(response.status,200);assert.deepEqual((await response.json()).passages,passages);
 assert.equal(sent.store,false);assert.equal(sent.text.format.strict,true);
 assert.equal(response.headers.get("Cache-Control"),"no-store");
 globalThis.fetch=async()=>Response.json({status:"completed",output:[{type:"message",content:[{type:"output_text",text:'{"passages":["short"],"message":""}'}]}]});
 assert.equal((await handler(req({scene:"A quiet room with a soft chair."}))).status,502);
});
test("upstream quota, refusal and network failures stay explicit",async()=>{
 process.env.OPENAI_API_KEY="test-key";
 globalThis.fetch=async()=>new Response("private upstream diagnostics",{status:429});
 let response=await handler(req({scene:"A quiet room with a soft chair."}));assert.equal(response.status,429);assert.ok(!(await response.text()).includes("private upstream"));
 globalThis.fetch=async()=>Response.json({status:"completed",output:[{type:"message",content:[{type:"refusal"}]}]});
 assert.equal((await handler(req({scene:"A quiet room with a soft chair."}))).status,422);
 globalThis.fetch=async()=>{throw Error("secret diagnostics");};
 response=await handler(req({scene:"A quiet room with a soft chair."}));assert.equal(response.status,502);assert.ok(!(await response.text()).includes("secret"));
});
