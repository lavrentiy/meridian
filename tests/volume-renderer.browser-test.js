"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "meridian-chrome-"));
const server = spawn("python3", ["-m", "http.server", "8137", "--bind", "127.0.0.1"], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"]
});
const chrome = spawn("google-chrome", [
  "--headless=new",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--no-first-run",
  "--no-default-browser-check",
  "--enable-unsafe-swiftshader",
  "--use-angle=swiftshader",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "--remote-allow-origins=*",
  "http://127.0.0.1:8137/#viewer"
], { stdio: ["ignore", "ignore", "pipe"] });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function devtoolsUrl(){
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => reject(new Error(`Chrome DevTools endpoint timed out: ${buffer}`)), 15000);
    chrome.stderr.on("data", chunk => {
      buffer += chunk;
      const match = buffer.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match){ clearTimeout(timer); resolve(match[1]); }
    });
    chrome.once("exit", code => reject(new Error(`Chrome exited before DevTools was ready (${code})`)));
  });
}

function cdp(wsUrl){
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const job = pending.get(message.id);
    if (!job) return;
    pending.delete(message.id);
    if (message.error) job.reject(new Error(message.error.message));
    else job.resolve(message.result);
  };
  const ready = new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("Chrome DevTools websocket failed"));
  });
  return {
    ready,
    close: () => ws.close(),
    send(method, params = {}, sessionId) {
      const id = nextId++;
      const message = { id, method, params };
      if (sessionId) message.sessionId = sessionId;
      ws.send(JSON.stringify(message));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    }
  };
}

async function main(){
  const endpoint=devtoolsUrl();
  await delay(300);
  const browser = cdp(await endpoint);
  await browser.ready;
  const { targetInfos } = await browser.send("Target.getTargets");
  const page = targetInfos.find(target => target.type === "page");
  assert(page, "Chrome did not create a page target");
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId:page.targetId, flatten:true });
  await browser.send("Runtime.enable", {}, sessionId);
  await delay(700);

  const evaluate = async (expression, awaitPromise = false) => {
    const result = await browser.send("Runtime.evaluate", {
      expression,
      awaitPromise,
      returnByValue:true
    }, sessionId);
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || "Page evaluation failed");
    return result.result.value;
  };

  const baseline = await evaluate(`(() => {
    const n = 40, vol = new Int16Array(n*n*n);
    for (let z=0; z<n; z++) for (let y=0; y<n; y++) for (let x=0; x<n; x++){
      const dx=x-(n-1)/2, dy=y-(n-1)/2, dz=z-(n-1)/2;
      const r=Math.hypot(dx,dy,dz);
      vol[x+n*(y+n*z)] = r < 8 ? 1200 : r < 14 ? 80 : -1000;
    }
    Object.assign(S, {
      vol, nx:n, ny:n, nz:n, sx:0.8, sy:0.8, sz:1.25,
      slope:1, intercept:0, minV:-1000, maxV:1200, wc:250, ww:2200,
      ix:20, iy:20, iz:20, rowD:[1,0,0], colD:[0,1,0], nrm:[0,0,1],
      labels:{XY:"AXIAL",XZ:"CORONAL",YZ:"SAGITTAL"},
      seriesList:[{modality:"CT", slices:[]}], curIdx:0
    });
    $("viewerBlank").hidden=true; $("grid").hidden=false; $("rail").hidden=false;
    navigate("viewer", false); initViews();
    return { renderer:!!R3, width:$("v3d").width, height:$("v3d").height,diagnostics:R3?.diagnostics() };
  })()`);
  assert.equal(baseline.renderer, true, "synthetic volume should create the real 3D renderer");
  assert(baseline.width > 1 && baseline.height > 1, "3D canvas should be laid out and rendered");
  assert.equal(baseline.diagnostics.glError,0,JSON.stringify(baseline.diagnostics));
  const proxyFactor=await evaluate("volumeProxyFactor(512,512,1000,2048,64*1048576)");
  assert.equal(proxyFactor,2,"large CT should receive a bounded rendering proxy");

  const imageLength = await evaluate('$("v3d").toDataURL("image/png").length');
  assert(imageLength > 1000, "rendered 3D canvas should contain image data");

  const controls = await evaluate(`(() => {
    $("tf3d").value="mixed";applyTransfer("mixed");
    $("slices3d").value="2";$("slices3d").dispatchEvent(new Event("change"));
    $("mode3d").value="1";$("mode3d").dispatchEvent(new Event("change"));
    $("view3d").value="anterior";$("view3d").dispatchEvent(new Event("change"));
    $("cropX0").value=.1;applyCrop($("cropX0"));
    S.rotK="XY";S.rotAng=.28;obInit();R3.syncCrosshair();
    toggleVolumeMax(true);const maximized=$("v3d").parentElement.classList.contains("volume-max");toggleVolumeMax(false);
    return {diagnostics:R3.diagnostics(),sliceMode:$("slices3d").value,transfer:$("tf3d").value,maximized,oblique:S.rotK};
  })()`);
  assert.equal(controls.diagnostics.downsample, 1, "small synthetic volume should retain full resolution");
  assert.deepEqual(controls.diagnostics.texture, [40,40,40]);
  assert.equal(controls.diagnostics.glError, 0, JSON.stringify(controls.diagnostics.programs));
  assert.equal(controls.sliceMode, "2");
  assert.equal(controls.transfer, "mixed");
  assert.equal(controls.maximized, true);
  assert.equal(controls.oblique, "XY");

  const reinitialized = await evaluate(`(() => { const before=R3;try{init3D();return {ok:!!R3&&R3!==before};}catch(error){return {ok:false,error:error.stack||String(error)}} })()`);
  assert.equal(reinitialized.ok, true, reinitialized.error || "renderer should reinitialize cleanly");

  const recovered = await evaluate(`new Promise(resolve => {
    const before=R3, gl=$("v3d").getContext("webgl2"), ext=gl&&gl.getExtension("WEBGL_lose_context");
    if(!ext)return resolve({supported:false,recovered:false});
    $("v3d").addEventListener("webglcontextlost",()=>setTimeout(()=>ext.restoreContext(),120),{once:true});
    ext.loseContext();
    const started=performance.now(), poll=()=>{
      if(R3&&R3!==before)return resolve({supported:true,recovered:true,status:$("volumeStatus").dataset.state});
      if(performance.now()-started>5000)return resolve({supported:true,recovered:false,status:$("volumeStatus").dataset.state});
      setTimeout(poll,50);
    };poll();
  })`, true);
  if (!recovered.recovered) console.error("Context recovery diagnostics:", recovered);
  assert.equal(recovered.recovered, true, "WebGL context restoration should rebuild the renderer");
  assert.equal(recovered.status, "ready");

  const screenshotPath=process.argv[2];
  if (screenshotPath){
    await evaluate('toggleVolumeMax(true);set3DToolsOpen(true);toggleCropPanel(true)');
    await delay(200);
    await browser.send("Page.enable", {}, sessionId);
    const shot=await browser.send("Page.captureScreenshot", {format:"png"}, sessionId);
    fs.writeFileSync(screenshotPath,Buffer.from(shot.data,"base64"));
  }
  browser.close();
  console.log("PASS synthetic CT render, advanced controls, and WebGL context recovery");
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
}).finally(async () => {
  chrome.kill("SIGTERM");
  server.kill("SIGTERM");
  await delay(100);
  fs.rmSync(profile, { recursive:true, force:true });
});
