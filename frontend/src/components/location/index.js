import { h, Component } from 'preact';
import style from './style.css';
import Card from 'preact-material-components/Card';
import Typography from 'preact-material-components/Typography';
import Button from 'preact-material-components/Button';
import Icon from 'preact-material-components/Icon';
import TextField from 'preact-material-components/TextField';
import 'preact-material-components/TextField/style.css';
import 'preact-material-components/Icon/style.css';
import 'preact-material-components/Button/style.css';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Typography/style.css';

import AutoHider from '../autoHider';

const fullWidth0tools = {
	width: '100%'
};
const fullWidth1tool = {
	width: 'calc(100% - 30px)'
};
const fullWidth3tools = {
	width: 'calc(100% - 90px)'
};

export default class Location extends Component {

	state = {
		hidden: true,
		toolAction: 'edit',
		editable: false
	};

	toggleHidden = () => this.setState({ hidden: !this.state.hidden });

	addEmpty = () => {
		this.props.location.credentials.push({
			username: '',
			password: ''
		});
		this.setState(s => {});
	};

	toolAction = () => {
		if (this.state.toolAction === 'edit') {
			// make fields editable
			this.setState({
				hidden: false,
				toolAction: 'save',
				editable: true
			});
		}
		else {
			// do save
			this.setState({
				toolAction: 'edit',
				editable: false
			});
		}
	};

	renderCredential = credential =>  {
		if (credential.__remove === undefined) {
			credential.__remove = () => {
				const index = this.props.location.credentials.findIndex(c => c.username === credential.username);
				this.props.location.credentials.splice(index, 1);
				this.setState(s => {});
			};
			credential.updateUsername = ev => credential.username = ev.target.value;
			credential.updatePassword = ev => credential.password = ev.target.value;
		}
		return (
			<div class={style.credential}>

				{this.state.editable && (
					<Icon class={style.edit} onClick={credential.__remove}>clear</Icon>
				)}

				{this.state.editable ? (
					<div>
						<TextField outerStyle={fullWidth1tool} onInput={credential.updateUsername} label="Username" value={credential.username} />
					</div>
				) : (
					<div>
						<Typography body1>
							Username: {credential.username}
						</Typography>
					</div>
				)}

				{this.state.editable ? (
					<div>
						<TextField outerStyle={fullWidth1tool} onInput={credential.updatePassword} label="Password" value={credential.password} />
					</div>
				) : (
					<div>
						<Typography body1>
							Password: {credential.password}
						</Typography>
					</div>
				)}

			</div>
		);
	};


	render(props, state) {
		return (
			<Card class={style.location}>
				<div>
					{state.editable ? (
						<TextField outerStyle={fullWidth3tools} label="Title" value={props.location.location} />
					) : (
						<Typography headline5>
							{props.location.location}
						</Typography>
					)}
					<Icon class={style.edit} onClick={this.toolAction}>{state.toolAction}</Icon>
					{state.editable && [
						<Icon class={style.edit} onClick={this.addEmpty}>delete_outlined</Icon>,
						<Icon class={style.edit} onClick={this.addEmpty}>add</Icon>
					]}
				</div>
				<div>
					{state.editable ? (
						<TextField outlined outerStyle={fullWidth0tools} label="Description" value={props.location.description} />
					) : (
						<Typography body1>
							<AutoHider content={props.location.description} />
						</Typography>
					)}
				</div>
				{!state.hidden && (
					<div>
						{props.location.credentials.map(this.renderCredential)}
					</div>
				)}
				<Button onClick={this.toggleHidden}>{(state.hidden ? 'Show credentials' : 'Hide credentials')}</Button>
			</Card>
		);
	}
}