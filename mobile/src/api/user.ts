import nodejs from "nodejs-mobile-react-native";

export const channelInit = () => {
  nodejs.start("main.js");
  nodejs.channel.addListener("message", (msg) => {});
};
export const login = (password: string) => {
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/login", data: { password } })
  );
};
