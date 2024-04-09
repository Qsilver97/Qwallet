var rn_bridge = require("rn-bridge");
var createModule = require("./utils/a.out");

var wasm = createModule();
rn_bridge.channel.on("message", async (msg) => {
  const result = await wasm.ccall(
    "qwallet",
    "string",
    ["string"],
    ["checkavail", "login"]
  );
  const message = {
    type: "S2C",
    data: result,
  };
  try {
    if (JSON.parse(msg).type == "C2S")
      rn_bridge.channel.send(JSON.stringify(message));
  } catch (err) {}
});

// rn_bridge.channel.send("Node was initialized.");
