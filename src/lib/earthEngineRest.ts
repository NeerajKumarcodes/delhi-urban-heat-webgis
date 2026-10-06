import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import path from "path";

const PROJECT_ID = "eminent-tesla-467414-t6";

export function getEarthEngineCredentials() {
  const envCredentials =
    process.env.EARTH_ENGINE_SERVICE_ACCOUNT_KEY;

  if (envCredentials) {
    return JSON.parse(envCredentials);
  }

  const keyPath = path.join(
    process.cwd(),
    "earth-engine-key.json"
  );

  return JSON.parse(
    fs.readFileSync(keyPath, "utf8")
  );
}

export async function getEarthEngineAccessToken() {
  const credentials =
    getEarthEngineCredentials();

  const auth = new GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/earthengine",
      "https://www.googleapis.com/auth/cloud-platform",
    ],
  });

  const client = await auth.getClient();
  const tokenResponse =
    await client.getAccessToken();

  if (!tokenResponse.token) {
    throw new Error(
      "Unable to obtain Google Cloud access token"
    );
  }

  return tokenResponse.token;
}

export async function earthEngineRequest(
  endpoint: string,
  body: unknown
) {
  const accessToken =
    await getEarthEngineAccessToken();

  const response = await fetch(
    `https://earthengine.googleapis.com/v1/${endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Earth Engine REST error:",
      data
    );

    throw new Error(
      data?.error?.message ||
        "Earth Engine REST request failed"
    );
  }

  return data;
}

export async function createEarthEngineMap(
  expression: unknown,
  visualizationOptions: {
    min: number;
    max: number;
    paletteColors: string[];
  }
) {
  return earthEngineRequest(
    `projects/${PROJECT_ID}/maps`,
    {
      expression,

      fileFormat: "PNG",

      visualizationOptions: {
        ranges: [
          {
            min: visualizationOptions.min,
            max: visualizationOptions.max,
          },
        ],

        paletteColors:
          visualizationOptions.paletteColors,
      },
    }
  );
}