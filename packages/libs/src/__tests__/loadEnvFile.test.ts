import { loadEnvFile } from "../index";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
  afterEach,
} from "vitest";
import { mkdir, rm, rmdir, writeFile } from "fs/promises";

const mockErrorLog = vi.fn();

vi.mock("../logger", () => ({
  getLogger: vi.fn(() => ({
    error: mockErrorLog,
  })),
}));

describe("loadEnvFile", () => {
  describe("with valid .env file", () => {
    const openApiKeyPropName = "OPENAI_API_KEY";

    afterEach(() => {
      delete process.env[openApiKeyPropName];
    });

    describe("no filePath argument", () => {
      const apiKey = "123";
      const envFileName = ".env";

      beforeAll(async () => {
        await writeFile(envFileName, `${openApiKeyPropName}=${apiKey}`);
      });

      afterAll(async () => {
        await rm(envFileName);
      });

      beforeEach(() => {
        loadEnvFile();
      });

      it(`loaded ${openApiKeyPropName}`, () => {
        expect(process.env[openApiKeyPropName]).toBe(apiKey);
      });
    });

    describe("filePath argument", () => {
      const apiKey = "456";
      const envFileDir = "./dir";
      const envFilePath = `./${envFileDir}/.env`;

      beforeAll(async () => {
        await mkdir(envFileDir);
        await writeFile(envFilePath, `${openApiKeyPropName}=${apiKey}`);
      });

      afterAll(async () => {
        await rm(envFilePath);
        await rmdir(envFileDir);
      });

      beforeEach(() => {
        loadEnvFile(envFilePath);
      });

      it(`loaded ${openApiKeyPropName}`, () => {
        expect(process.env[openApiKeyPropName]).toBe(apiKey);
      });
    });
  });

  describe("without valid .env file", () => {
    const runErrorLoadEnvFile = () => loadEnvFile("./nodir/.env");

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("throw Error", async () => {
      expect(runErrorLoadEnvFile).toThrowError();
    });

    it("called error log", async () => {
      try {
        runErrorLoadEnvFile();
      } catch (e) {
        expect(mockErrorLog).toBeCalled();
      }
    });
  });
});
