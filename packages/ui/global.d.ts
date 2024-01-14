declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        MIRO_API_KEY: string;
        NOTION_API_KEY: string;
        TRELLO_API_KEY: string;
        TRELLO_API_TOKEN: string;
      }
    }
  }
}
