import { h, Component } from 'preact';

import { Menu, Item } from '../Dropdown';
import Credential from './Credential';

export default class CredentialTable extends Component {
	constructor(props) {
		super(props);
	}

	moreClicked(credential, ev) {
		if (ev.ctrlKey) return;
		ev.preventDefault();
		ev.stopPropagation();
		this.dropdown.open(ev.pageX, ev.pageY, credential);
	}

	render() {
		return (
			<div>
				<table class="u-full-width credential-table box">
					<thead>
						<tr>
							<th>Location</th>
							<th class="credential-desc">Description</th>
							<th>Username</th>
							<th>Password</th>
							<th style={{ width: '44px' }} />
						</tr>
					</thead>
					<tbody>
						{this.props.credentials.map(credential => (<Credential key={credential._id} credential={credential} crypto={this.props.crypto} moreClick={this.moreClicked} />))}
					</tbody>
				</table>
				<Menu ref={element => this.dropdown = element} optionSelected={this.onDropdownOptionSelected}>
					<Item item="edit" title="Edit credential" icon="mode_edit" />
					<Item item="delete" title="Delete credential" icon="delete_forever" />
				</Menu>
			</div>
		);
	}
}

