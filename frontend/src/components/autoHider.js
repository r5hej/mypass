import { h, Component } from 'preact';

const MAX_LENGTH = 75;

export default class AutoHider extends Component {

	state = {
		hidden: true
	};

	toggleHidden = () => this.setState({ hidden: !this.state.hidden });

	render(props, state) {
		return (
			<div onClick={this.toggleHidden}>
				{state.hidden ? (
					<div>{props.content.substr(0, MAX_LENGTH)}{props.content.length > MAX_LENGTH && '...'}</div>
				) : (
					<div>{props.content}</div>
				)}
			</div>
		);
	}
}