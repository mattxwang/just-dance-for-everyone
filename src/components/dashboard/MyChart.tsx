import { useRef, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
//import faker from 'faker';
import { BPMAvgInfo, MinutesInfo, User, SongsInfo, ScoreAvgInfo} from './User'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const toUnixTime = (year, month, day) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return Math.floor(date.getTime());
}
const propItems = ["minutes", "score", "songs", "bpm"]

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

export default function MyChart(props): JSX.Element {

  const week = props.info.week
  const month = props.info.month

  const sortedWeek = week.sort(function(a, b){return b.timestamp - a.timestamp})
  const sortedMonth = month.sort(function(a, b){return b.timestamp - a.timestamp})

  let weekMap = new Map<number, number>()
  let monthMap = new Map<number, number>()

  let weekLabels = []
  let weekDataset = []

  let monthLabels = []
  let monthDataset = []

  if (props.property == "minutes") {
    for (let i = 0; i < sortedWeek.length; i++) {
      const attempt = sortedWeek[i]
      if (weekMap.has(attempt.timestamp)) {
        weekMap.set(attempt.timestamp, weekMap.get(attempt.timestamp) + attempt.song.length)
      } else {
        weekMap.set(attempt.timestamp, attempt.song.length)
      }
    }

    weekMap.forEach((value: number, key: number) => {
      let day = new Date(key*1000)
      const td = day.getDate()
      const tm = day.getMonth() + 1
      const label = tm + '/' + td
      weekLabels.push(label)
      weekDataset.push(Math.floor(value/60))
    });

    for (let i = 0; i < sortedMonth.length; i++) {
      const attempt = sortedMonth[i]
      if (monthMap.has(attempt.timestamp)) {
        monthMap.set(attempt.timestamp, monthMap.get(attempt.timestamp) + attempt.song.length)
      } else {
        monthMap.set(attempt.timestamp, attempt.song.length)
      }
    }

    monthMap.forEach((value: number, key: number) => {
      let day = new Date(key*1000)
      const td = day.getDate()
      const tm = day.getMonth() + 1
      const label = tm + '/' + td
      monthLabels.push(label)
      monthDataset.push(Math.floor(value/60))
    });


  } else if (props.property == "score") {

    let weekCountMap = new Map<number, number>()
    let monthCountMap = new Map<number, number>()

    for (let i = 0; i < sortedWeek.length; i++) {
      const attempt = sortedWeek[i]
      if (weekMap.has(attempt.timestamp)) {
        weekMap.set(attempt.timestamp, weekMap.get(attempt.timestamp) + attempt.grade)
        weekCountMap.set(attempt.timestamp, weekCountMap.get(attempt.timestamp) + 1)
      } else {
        weekMap.set(attempt.timestamp, attempt.grade)
        weekCountMap.set(attempt.timestamp, 1)
      }
    }

    weekMap.forEach((value: number, key: number) => {
      let day = new Date(key*1000)
      const td = day.getDate()
      const tm = day.getMonth() + 1
      const label = tm + '/' + td
      weekLabels.push(label)
      weekDataset.push(Math.floor(value/weekCountMap.get(key)))
    });

    for (let i = 0; i < sortedMonth.length; i++) {
      const attempt = sortedMonth[i]
      if (monthMap.has(attempt.timestamp)) {
        monthMap.set(attempt.timestamp, monthMap.get(attempt.timestamp) + attempt.grade)
        monthCountMap.set(attempt.timestamp, monthCountMap.get(attempt.timestamp) + 1)
      } else {
        monthMap.set(attempt.timestamp, attempt.grade)
        monthCountMap.set(attempt.timestamp, 1)
      }
    }

    monthMap.forEach((value: number, key: number) => {
      let day = new Date(key*1000)
      const td = day.getDate()
      const tm = day.getMonth() + 1
      const label = tm + '/' + td
      monthLabels.push(label)
      monthDataset.push(Math.floor(value/monthCountMap.get(key)))
    });

  } else if (props.property == "songs") {
    for (let i = 0; i < sortedWeek.length; i++) {
      const attempt = sortedWeek[i]
      if (weekMap.has(attempt.timestamp)) {
        weekMap.set(attempt.timestamp, weekMap.get(attempt.timestamp) + 1)
      } else {
        weekMap.set(attempt.timestamp, 1)
      }
    }

    weekMap.forEach((value: number, key: number) => {
      let day = new Date(key*1000)
      const td = day.getDate()
      const tm = day.getMonth() + 1
      const label = tm + '/' + td
      weekLabels.push(label)
      weekDataset.push(value)
    });

    for (let i = 0; i < sortedMonth.length; i++) {
      const attempt = sortedMonth[i]
      if (monthMap.has(attempt.timestamp)) {
        monthMap.set(attempt.timestamp, monthMap.get(attempt.timestamp) + 1)
      } else {
        monthMap.set(attempt.timestamp, 1)
      }
    }

    monthMap.forEach((value: number, key: number) => {
      let day = new Date(key*1000)
      const td = day.getDate()
      const tm = day.getMonth() + 1
      const label = tm + '/' + td
      monthLabels.push(label)
      monthDataset.push(value)
    });

  } else if (props.property == "bpm") {
    let weekCountMap = new Map<number, number>()
    let monthCountMap = new Map<number, number>()

    for (let i = 0; i < sortedWeek.length; i++) {
      const attempt = sortedWeek[i]
      if (weekMap.has(attempt.timestamp)) {
        weekMap.set(attempt.timestamp, weekMap.get(attempt.timestamp) + attempt.song.bpm)
        weekCountMap.set(attempt.timestamp, weekCountMap.get(attempt.timestamp) + 1)
      } else {
        weekMap.set(attempt.timestamp, attempt.song.bpm)
        weekCountMap.set(attempt.timestamp, 1)
      }
    }

    weekMap.forEach((value: number, key: number) => {
      let day = new Date(key*1000)
      const td = day.getDate()
      const tm = day.getMonth() + 1
      const label = tm + '/' + td
      weekLabels.push(label)
      weekDataset.push(Math.floor(value/weekCountMap.get(key)))
    });

    for (let i = 0; i < sortedMonth.length; i++) {
      const attempt = sortedMonth[i]
      if (monthMap.has(attempt.timestamp)) {
        monthMap.set(attempt.timestamp, monthMap.get(attempt.timestamp) + attempt.song.bpm)
        monthCountMap.set(attempt.timestamp, monthCountMap.get(attempt.timestamp) + 1)
      } else {
        monthMap.set(attempt.timestamp, attempt.song.bpm)
        monthCountMap.set(attempt.timestamp, 1)
      }
    }

    monthMap.forEach((value: number, key: number) => {
      let day = new Date(key*1000)
      const td = day.getDate()
      const tm = day.getMonth() + 1
      const label = tm + '/' + td
      monthLabels.push(label)
      monthDataset.push(Math.floor(value/monthCountMap.get(key)))
    });
  
  }

  const weekDatasets = [{label: props.property, data: weekDataset,  borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)'}]
  const monthDatasets = [{label: props.property, data: monthDataset,  borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)'}]

  const weekData = {labels: weekLabels, datasets: weekDatasets}
  const monthData = {labels: monthLabels, datasets: monthDatasets}

  return (
    <div>
    <Line options={options} data={weekData} />
    <br></br>
    <Line options={options} data={monthData} />
    </div>
  )
}