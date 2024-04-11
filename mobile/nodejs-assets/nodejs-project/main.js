var rn_bridge = require("rn-bridge");
const { login } = require("./controller");
const wasmManager = require("./managers/wasmManager");
const stateManager = require("./managers/stateManager");

const init = () => {
  wasmManager.init();
  stateManager.init();
};

init();

rn_bridge.channel.on("message", async (msg) => {
  try {
    const message = JSON.parse(msg);
    if (message.action === "C2S/login") {
      const success = await login({ password: message.data?.password });
      if (typeof success != "string") {
        rn_bridge.channel.send(
          JSON.stringify({
            action: "S2C/login",
            success: true,
            data: success,
          })
        );
      } else {
        rn_bridge.channel.send(
          JSON.stringify({
            action: "S2C/login",
            success: false,
            error: "Invalid password",
          })
        );
      }
    }
  } catch (err) {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/error",
        error: err.message,
      })
    );
  }
});

rn_bridge.channel.send("Node was initialized.");
