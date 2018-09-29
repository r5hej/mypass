import { h, Component } from 'preact';
import linkState from 'linkstate';
import Card from 'preact-material-components/Card';
import Fab from 'preact-material-components/Fab';
import TextField from 'preact-material-components/TextField';
import FormField from 'preact-material-components/FormField';
import Icon from 'preact-material-components/Icon';
import 'preact-material-components/Icon/style.css';
import 'preact-material-components/FormField/style.css';
import 'preact-material-components/TextField/style.css';
import 'preact-material-components/Fab/style.css';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import style from './style.css';
import Location from '../../components/location';

const searchInput = {
	width: 'calc(100% - 26px)'
};

const fabStyle = {
	position: 'fixed',
	right: '20px',
	bottom: '20px'
};

export default class Home extends Component {

	state = {
		search: '',
		locations: [
			{
				location: 'https://facebook.com',
				description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
				credentials: [
					{
						username: 'charlie',
						password: 'byrdam'
					},
					{
						username: 'malte',
						password: 'rosenbjerg'
					}
				]
			},
			{
				location: 'https://messenger.com',
				description: 'fb messenger',
				credentials: [
					{
						username: 'charlie',
						password: 'byrdam'
					}
				]
			}
		]
	};

	renderLocation = location => (
		<Location location={location} />
	);

	render(props, state) {
		return (
			<div class={style.home}>
				<Card class={style.card}>
					<FormField>
						<TextField outerStyle={searchInput} onInput={linkState(this, 'search')} label="Search" />
						<Icon>search</Icon>
					</FormField>
				</Card>

				{state.locations
					.filter(l => l.location.includes(state.search))
					.map(this.renderLocation)}
				<Fab style={fabStyle}><Fab.Icon>add</Fab.Icon></Fab>

			</div>
		);
	}
}
