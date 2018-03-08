import { h, Component } from 'preact';

const _handlers = [];

function clickOnBody(ev) {
	if (ev.target.matches('.dropdown-menu'))
		return;
	for (let i = 0; i < _handlers.length; i++) {
		_handlers[i]();
	}
}

function register(handler) {
	if (_handlers.length === 0)
		document.body.addEventListener('click', clickOnBody);
	_handlers.push(handler);
}
function unregister(handler) {
	let i = _handlers.indexOf(handler);
	if (i === -1) return;
	_handlers.splice(i, 1);
	if (_handlers.length === 0)
		document.body.removeEventListener('click', clickOnBody);
}

export class Item extends Component {
	constructor(props) {
		super(props);
		this.clicked = this.clicked.bind(this);
	}

	clicked() {
	    this.props.clicked(this.props.item);
	}

	render() {
		return (<li item={this.props.item} class="material-icons" title={this.props.title} onClick={this.clicked}>{this.props.icon}</li>);
	}
}

export class Menu extends Component {
	constructor(props) {
		super(props);
		this.setState({
			active: false,
			item: undefined
		});
		this.onFocusLost = this.onFocusLost.bind(this);
		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
		this.itemSelected = this.itemSelected.bind(this);
	}

	onFocusLost() {
	    this.close();
	}

	open(x, y, item) {
		this.setState({
			active: true,
			top: y + 'px',
			left: x + 'px',
			item
		});
		register(this.onFocusLost);
	}
	close() {
		unregister(this.onFocusLost);
		this.setState({
			active: false,
			item: undefined
		});
	}
	itemSelected(key) {
	    this.props.optionSelected(key, this.state.item);
		this.close();
	}

	render() {
		return (
			<ul ref={element => this.dropdown = element} style={{ top: this.state.top, left: this.state.left }} class={`dropdown-menu${this.state.active ? ' active' : ''}`}>
				{this.props.children.map(child => {
				    child.attributes.clicked = this.itemSelected;
				    return child;
				})}
			</ul>
		);
	}
}
