import {v5 as uuidv5} from "uuid";

export function sleep(ms: number): Promise<void> {
    return new Promise((r => setTimeout(r, ms)))
}

export function uuid() {
    return uuidv5('restructurednotes.com', uuidv5.DNS)
}
