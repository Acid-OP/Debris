import net from "net";

const PORT = 4000;
const store = new Map<string, string>();

const server = net.createServer((socket) => {
  console.log("Client connected");

  let buffer = ""; // For handling partial messages

  socket.on("data", (data) => {
    buffer += data.toString();

    // Try parsing multiple commands in the buffer
    let command;
    while ((command = parseRESP(buffer))) {
      const { args, rawLength } = command;
      buffer = buffer.slice(rawLength); // Remove parsed part from buffer

      handleCommand(args, socket);
    }
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`RESP TCP Server running on port ${PORT}`);
});

// --- RESP Parser ---
function parseRESP(raw: string): { args: string[]; rawLength: number } | null {
  const lines = raw.split("\r\n");
  if (!lines[0].startsWith("*")) return null;

  const count = parseInt(lines[0].substring(1));
  const args: string[] = [];
  let i = 1;
  let consumed = lines[0].length + 2; // *count\r\n

  while (args.length < count && i < lines.length) {
    if (!lines[i].startsWith("$")) return null;
    const len = parseInt(lines[i].substring(1));
    const value = lines[i + 1];
    if (value.length !== len) return null;
    args.push(value);

    // Each bulk string consumes: $len\r\nvalue\r\n
    consumed += lines[i].length + 2 + value.length + 2;
    i += 2;
  }

  return args.length === count ? { args, rawLength: consumed } : null;
}

// --- Command Handler ---
function handleCommand(args: string[], socket: net.Socket) {
  const cmd = args[0].toUpperCase();

  switch (cmd) {
    case "PING":
      socket.write("+PONG\r\n");
      break;

    case "SET":
      if (args.length === 3) {
        store.set(args[1], args[2]);
        socket.write("+OK\r\n");
      } else {
        socket.write("-ERR wrong number of arguments for 'SET'\r\n");
      }
      break;

    case "GET":
      if (args.length === 2) {
        const value = store.get(args[1]);
        if (value !== undefined) {
          socket.write(`$${value.length}\r\n${value}\r\n`);
        } else {
          socket.write("$-1\r\n"); // Null bulk string
        }
      } else {
        socket.write("-ERR wrong number of arguments for 'GET'\r\n");
      }
      break;

    default:
      socket.write(`-ERR unknown command '${cmd}'\r\n`);
  }
}
