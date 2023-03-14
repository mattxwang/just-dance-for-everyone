import * as user from '../../user.json'
import 'bootstrap/dist/css/bootstrap.min.css';

export interface BPMAvgInfo {
    total: number
    day: number
    week: number
    month: number
}

export interface MinutesInfo {
    total: number
    day: number
    week: number
    month: number
}

export interface SongsInfo {
    total: number
    day: number
    week: number
    month: number
}

export interface ScoreAvgInfo {
    total: number
    day: number
    week: number
    month: number
}


export interface User {
    name: string
    bpmAvgInfo: BPMAvgInfo
    minutesInfo: MinutesInfo
    songsInfo: SongsInfo
    scoreAvgInfo: ScoreAvgInfo
    week: Attempt[]
    month: Attempt[]
}

interface UserInfo {
    user: string
    attempts: Attempt[]
}

interface Attempt {
    id: number
    timestamp: number
    song: Song
    grade: number
    month: string
    day: number
}

interface Song {
    name: string
    bpm: number
    length: number
}

const toUnixTime = (year, month, day) => {
    const date = new Date(Date.UTC(year, month - 1, day));
    return Math.floor(date.getTime());
}

function getInfo(arr: Attempt[]): number[] {
    const arr_len = arr.length
    let bpmavg = 0
    let minutes = 0 
    let songs = arr_len
    let scoreavg = 0
    for (let i = 0; i < arr_len; i++) {
        const attempt = arr[i]
        bpmavg += attempt.song.bpm
        minutes += attempt.song.length
        scoreavg += attempt.grade
    }
    bpmavg /= arr_len
    scoreavg /= arr_len
    minutes /= 60 

    return [Math.floor(bpmavg), minutes, songs, Math.floor(scoreavg)]
}

export function getUserInfo(): User {
    const my_user: UserInfo = user
    const user_name = my_user.user
    const user_attempts = my_user.attempts

    let week = []
    let month = []
    let day = []

    let today = new Date()
    const td = today.getDate()
    const tm = today.getMonth() + 1
    const ty = today.getFullYear()

    const dayMultiplier = 60*60*24*1000

    const rn = toUnixTime(ty, tm, td);

    //const rn = Date.now()

    //get date range
    for (let i = 0; i < user_attempts.length; i++) {
        const attempt = user_attempts[i]
        const ts = attempt.timestamp * 1000


        if(rn - ts > 0) {
            if (rn - 30*dayMultiplier < ts) {
                month.push(attempt)
                if (rn - 7*dayMultiplier < ts) {
                    week.push(attempt)
                    if(rn - dayMultiplier < ts)
                        day.push(attempt)
                }
            }
        }
    } 

    const day_info = getInfo(day)
    const week_info = getInfo(week)
    const month_info = getInfo(month)
    const all_info = getInfo(user_attempts)

    const bpmAvgInfo: BPMAvgInfo = {total: all_info[0], day: day_info[0], week: week_info[0], month: month_info[0]}
    const minutesInfo: MinutesInfo = {total: all_info[1], day: day_info[1], week: week_info[1], month: month_info[1]}
    const songsInfo: SongsInfo = {total: all_info[2], day: day_info[2], week: week_info[2], month: month_info[2]}
    const scoreAvgInfo: ScoreAvgInfo = {total: all_info[3], day: day_info[3], week: week_info[3], month: month_info[3]}

    const ret_user: User = {name: user_name, bpmAvgInfo, minutesInfo, songsInfo, scoreAvgInfo, week, month}
    return ret_user
}