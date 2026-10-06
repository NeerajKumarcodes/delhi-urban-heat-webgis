import ee from "@google/earthengine";

const credentials = require("../../earth-engine-key.json");

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