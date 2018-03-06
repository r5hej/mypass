import { h, Component } from 'preact';

export default class Category extends Component {
	constructor(props) {
		super(props);
		this.clicked = this.clicked.bind(this);
		this.altClicked = this.altClicked.bind(this);
	}

	clicked(ev) {
		this.props.click(this.props.category, ev);
	}
	altClicked(ev) {
		this.props.altClick(this.props.category, ev);
	}

	render() {
		return (
			<li key={this.props.category} class={this.props.active ? 'truncate selected' : 'truncate'} onClick={this.clicked} onContextMenu={this.altClicked}>{this.props.category.name}</li>
		);
	}
}