declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        MIRO_ACCESS_TOKEN: string;
      }
    }
  }
}
