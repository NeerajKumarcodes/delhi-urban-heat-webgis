import ee from "@google/earthengine";

import {
  getEarthEngineCredentials,
} from "./earthEngineRest";

const credentials =
  getEarthEngineCredentials();

export function initializeEarthEngine(): Promise<void> {
  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      credentials,
      () => {
        ee.initialize(
          null,
          null,
          () => resolve(),
          (error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
}