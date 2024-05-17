import { EventEmitter } from "events";

const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(30);

export default eventEmitter;
