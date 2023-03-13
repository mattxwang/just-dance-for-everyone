import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import { BPMAvgInfo, MinutesInfo, User, SongsInfo, ScoreAvgInfo} from './User'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MyCard(props): JSX.Element {
    const info: User = props.info
    const bpmAvgInfo = info.bpmAvgInfo[props.selectedItem]
    const minutesInfo = info.minutesInfo[props.selectedItem]
    const songsInfo = info.songsInfo[props.selectedItem]
    const scoreAvgInfo = info.scoreAvgInfo[props.selectedItem]
    return(
        <CardGroup>
        <Card>
            <Card.Body>
            <Card.Title>Average BPM</Card.Title>
            <Card.Text>
                {bpmAvgInfo}
            </Card.Text>
            </Card.Body>
        </Card>
        <Card>
            <Card.Body>
            <Card.Title>Minutes Danced</Card.Title>
            <Card.Text>
                {minutesInfo}
            </Card.Text>
            </Card.Body>
        </Card>
        <Card>
            <Card.Body>
            <Card.Title>Number of Songs</Card.Title>
            <Card.Text>
                {songsInfo}
            </Card.Text>
            </Card.Body>
        </Card>
        <Card>
            <Card.Body>
            <Card.Title>Average Score</Card.Title>
            <Card.Text>
                {scoreAvgInfo}
            </Card.Text>
            </Card.Body>
        </Card>
        </CardGroup>
    )
}