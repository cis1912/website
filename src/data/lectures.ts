export interface Lecture {
	date: string
	type: "lec" | "hw"
	title: string
	slides?: string
	lab?: string
}

import raw from "./lectures.json"
export const lectures: Lecture[] = raw as Lecture[]
