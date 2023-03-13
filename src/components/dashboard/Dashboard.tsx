import { useRef, useState } from 'react'
import { getUserInfo } from './User'
import MyDropdown from './MyDropdown';
import MyCard from './MyCard';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Dashboard (): JSX.Element {

  const [selectedItem, setSelectedItem] = useState("day");

  const info = getUserInfo()

  return (
    <div>
      <MyDropdown 
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
      />
      <MyCard
      selectedItem={selectedItem}
      info={info}
      />
    </div>
  )
}
