import { useRef, useState } from 'react'
import { getUserInfo } from './User'
import MyDropdown from './MyDropdown';
import MyCard from './MyCard';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Stack } from 'react-bootstrap';
import MyChart from './MyChart';
import * as user from '../../user.json'

const toUnixTime = (year, month, day) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return Math.floor(date.getTime());
}

const cardItems = ["day", "week", "month", "total"];
const propItems = ["minutes", "score", "songs", "bpm"]

export default function Dashboard (): JSX.Element {

  const [selectedItem, setSelectedItem] = useState("day");
  const [selectedProp, setSelectedProp] = useState("minutes");
  const info = getUserInfo()

  return (
    <div>
      <MyDropdown 
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
      items={cardItems}
      toggleLabel={'set view'}
      />
      <br></br>
      <MyCard
      selectedItem={selectedItem}
      info={info}
      />
      <br></br>
      <MyDropdown 
      selectedItem={selectedProp}
      setSelectedItem={setSelectedProp}
      items={propItems}
      toggleLabel={'set property'}
      />
      <br></br>
      <MyChart
      info={info}
      property={selectedProp}
      />
    </div>
  )
}
