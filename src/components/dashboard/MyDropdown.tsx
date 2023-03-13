import { useRef, useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';

const items = ["day", "week", "month", "total"];
const itemToText ={"day": "last 24 hours", "week": "last 7 days", "month": "last 30 days", "total": "all-time"}

export default function MyDropdown (props): JSX.Element {
    
    return (
        <>
        <br/>
        <Dropdown>
            <Dropdown.Toggle variant="success">set view</Dropdown.Toggle>
            <Dropdown.Menu>
            {items.map((item) => (
                <Dropdown.Item onClick={() => props.setSelectedItem(item)}>
                {item}
                </Dropdown.Item>
            ))}
            </Dropdown.Menu>
        </Dropdown>
        <pre>{itemToText[props.selectedItem]}</pre>
        </>
    );
}
  