import { h, Component } from 'preact';

import Api from '../Helpers/Api';
import MaterialIcon from '../MaterialIcon';

export default class CreateCredentialModal extends Component {
    async onSubmit(ev) {
        ev.preventDefault();
        this.setState({loading: true});
        const form = new FormData(ev.target);
        this.props.crypto.encryptForm(form, ['location', 'description', 'username', 'password']);
        const newCred = await Api.createCredential(form);
        this.props.crypto.decryptFields(newCred, ['location', 'description', 'username', 'password']);
        this.props.updated(newCred);
    }

    constructor(props) {
        super(props);
        this.state.loading = false;
        this.onSubmit = this.onSubmit.bind(this);
    }

    render() {
        return (
            <div>
                <h5>Create credential</h5>
                <form onSubmit={this.onSubmit}>
                    <input class="u-full-width" type="text" name="location" placeholder="Location" required="required" />
                    <input class="u-full-width" type="text" name="description" placeholder="Description" />
                    <input class="u-full-width" type="text" name="username" placeholder="Username" />
                    <input class="u-full-width" type="password" name="password" placeholder="Password" required="required" />
                    <input class="u-full-width" type="hidden" name="category_id" value={this.props.categoryId} />
                    {this.state.loading
                        ? <MaterialIcon className="spin" icon="autorenew" />
                        : <input class="right-align" type="submit" value="Add" />}
                </form>
            </div>
        );
    }
}