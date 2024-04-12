import nodejs from "nodejs-mobile-react-native";
import eventEmitter from "./eventEmitter";
import RNFS from "react-native-fs";

export const channelInit = () => {
  nodejs.start("main.js");
  nodejs.channel.addListener("message", (msg) => {
    try {
      const res = JSON.parse(msg);
      eventEmitter.emit(res.action, res);
    } catch (err) {}
  });
  nodejs.channel.send(
    JSON.stringify({
      action: "SET_FILES_DIR",
      data: {
        path: RNFS.DocumentDirectoryPath,
      },
    })
  );
};

export const login = (password: string) => {
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/login", data: { password } })
  );
};

export const create = (command: string) => {
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/create", data: { command } })
  );
};
