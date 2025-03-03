import { MCPResource } from "mcp-framework";

const postgresClient = {
  getCustomers: async () => {
    return [{ id: 1, name: "John Doe" }];
  },
};

class HelloWorldResource extends MCPResource {
  uri = "resource://hello-world";
  name = "Hello World";
  description = "Hello World Resource";
  mimeType = "application/json";

  async read() {
    const customers = await postgresClient.getCustomers();

    const helloWorldResource = {
      uri: this.uri,
      mimeType: this.mimeType,
      text: JSON.stringify({
        customers,
      }),
    };

    return [helloWorldResource];
  }
}

export default HelloWorldResource;