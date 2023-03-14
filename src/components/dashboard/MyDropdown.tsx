import { useRef, useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MyDropdown (props): JSX.Element {
    
    return (
        <>
        <br/>
        <Dropdown>
            <Dropdown.Toggle variant="success">{props.toggleLabel}</Dropdown.Toggle>
            <Dropdown.Menu>
            {props.items.map((item) => (
                <Dropdown.Item onClick={() => props.setSelectedItem(item)}>
                {item}
                </Dropdown.Item>
            ))}
            </Dropdown.Menu>
        </Dropdown>
        </>
    );
}
  