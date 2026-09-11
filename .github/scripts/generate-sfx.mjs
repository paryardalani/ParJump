import { readFile, mkdir, writeFile } from "node:fs/promises";

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY is not set. Add it under repo Settings > Secrets and variables > Actions.");
  process.exit(1);
}

const manifest = JSON.parse(await readFile("assets/sfx-manifest.json", "utf8"));
await mkdir("assets/sfx", { recursive: true });

for (const sound of manifest) {
  console.log(`Generating "${sound.id}"...`);

  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: sound.prompt,
      duration_seconds: sound.duration_seconds,
      prompt_influence: 0.4,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs request failed for "${sound.id}": ${res.status} ${body}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(`assets/sfx/${sound.id}.mp3`, buffer);
  console.log(`Saved assets/sfx/${sound.id}.mp3`);
}

console.log("All sound effects generated.");
