import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^nanoid$": "<rootDir>/__mocks__/nanoid.ts",
  },
};

export default config;
