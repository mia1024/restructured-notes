export * from "./config"
export * from "./style"
export * from "./git"
export * from './notebook'
import {v5 as uuidv5} from 'uuid'
export function uuid() {
    return uuidv5('restructurednotes.com',uuidv5.DNS)
}