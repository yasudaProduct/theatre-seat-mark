import { Prefecture } from "./Prefecture"

export type Region = {
    id: number
    name: string
    name_kana: string
    prefectures: Prefecture[]
}