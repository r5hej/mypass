import { h, Component } from 'preact';

import Api from '../Helpers/Api';


export default class CreateCategoryModal extends Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
    }

    async submit(ev) {
        ev.preventDefault();
        const form = new FormData(ev.target);
        this.props.crypto.encryptForm(form, ['name']);
        let newCat = await Api.createCategory(form);
        this.props.crypto.decryptFields(newCat, ['name']);
        this.props.updated(newCat);
    }

    render() {
        return (
            <div>
                <h5>Create category</h5>
                <form onSubmit={this.submit}>
                    <input class="u-full-width" type="text" name="name" placeholder="Category name" required="required" />
                    <input class="u-full-width btn-submit" type="submit" value="Add" />
                </form>
            </div>
        );
    }
}
