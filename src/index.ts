// import { MCPServer } from "mcp-framework";

// const server = new MCPServer({transport:{type:"sse", options: {port: 1337}}});

// server.start();

  import { MCPServer } from "mcp-framework";

const server = new MCPServer({
    transport: { 
      type: "stdio" 
    }
  });

server.start();