import { h, Component } from 'preact';

import Api from '../Helpers/Api';


export default class CategoryModal extends Component {
	constructor(props) {
		super(props);
		this.submit = this.submit.bind(this);
		this.state.name = props.category ? props.category.name : '';
	}

	async submit(ev) {
		ev.preventDefault();
		if (this.props.category) {
			this.props.category.name = this.state.name;
			await Api.updateCategory(this.props.category);
		}
		else {
			await Api.createCategory({ name: this.state.name });
		}
		this.props.updated();
	}

	render() {
		return (
			<div>
				<h5>{this.props.category ? 'Edit category' : 'Create category'}</h5>
				<form onSubmit={this.submit}>
					<input class="u-full-width" type="text" name="name" placeholder="Category name" required="required"
						value={this.state.name}
					/>
					<input class="u-full-width btn-submit" type="submit" value={this.props.category ? 'Update' : 'Add'} />
				</form>
			</div>
		);
	}
}
