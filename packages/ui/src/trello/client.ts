type ListResponse = {
  id: string;
  name: string;
  closed: boolean;
  pos: number;
  softLimit: string;
  idBoard: string;
  subscribed: boolean;
  limits: {
    attachments: {
      perBoard: any;
    };
  };
};

export class TrelloClient {
  private readonly apiKey: string;
  private readonly apiToken: string;

  constructor(apiKey: string, apiToken: string) {
    this.apiKey = apiKey;
    this.apiToken = apiToken;
  }

  async getLists(boardId: string): Promise<ListResponse[]> {
    const res = await fetch(
      `https://api.trello.com/1/boards/${boardId}/lists?key=${this.apiKey}&token=${this.apiToken}`,
    );
    return res.json();
  }

  async createCard(param: { listId: string; name: string }): Promise<void> {
    const res = await fetch(
      `https://api.trello.com/1/cards?key=${this.apiKey}&token=${this.apiToken}&idList=${param.listId}&name=${param.name}`,
      {
        method: "POST",
      },
    );
    return res.json();
  }
}
