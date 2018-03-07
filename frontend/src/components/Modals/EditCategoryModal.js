import { h, Component } from 'preact';

import Api from '../Helpers/Api';


export default class EditCategoryModal extends Component {
	constructor(props) {
		super(props);
		this.submit = this.submit.bind(this);
		this.state.name = props.category ? props.category.name : '';
	}

	async submit(ev) {
		ev.preventDefault();
        this.props.category.name = this.newNameField.value;
        const encCopy = this.props.crypto.encryptedCopy(this.props.category, ['name']);
        await Api.updateCategory(encCopy);
        this.props.updated();
	}

	render() {
		return (
			<div>
				<h5>Edit category</h5>
				<form onSubmit={this.submit}>
					<input class="u-full-width" type="text" name="name" placeholder="Category name" required="required"
						value={this.props.category.name} ref={element => this.newNameField = element}
					/>
					<input class="u-full-width btn-submit" type="submit" value="Update" />
				</form>
			</div>
		);
	}
}
