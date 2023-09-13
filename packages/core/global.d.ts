declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        OPENAI_API_KEY: string;
      }
    }
  }
}
