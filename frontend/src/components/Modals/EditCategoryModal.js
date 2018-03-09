import { h, Component } from 'preact';
import 'linkstate/polyfill';

import Api from '../Helpers/Api';
import MaterialIcon from '../MaterialIcon';

export default class EditCategoryModal extends Component {
	async submit(ev) {
		ev.preventDefault();
        this.setState({loading: true});
        const encCopy = this.props.crypto.encryptedCopy(this.props.category, ['name']);
        await Api.updateCategory(encCopy);
        this.props.updated();
	}

    constructor(props) {
        super(props);
        this.state = {
            category: props.category,
            loading: false
        };
        this.submit = this.submit.bind(this);
    }
	render() {
		return (
			<div>
				<h5>Edit category</h5>
				<form onSubmit={this.submit}>
					<input class="u-full-width" type="text" name="name" placeholder="Category name" required="required"
						value={this.state.category.name} onInput={this.linkState('category.name')}
					/>
                    {this.state.loading
                        ? <MaterialIcon className="spin" icon="autorenew" />
                        : <input class="right-align" type="submit" value="Update" />}
				</form>
			</div>
		);
	}
}
