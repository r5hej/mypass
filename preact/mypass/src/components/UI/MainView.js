import { h, render, Component } from 'preact';

import CategoryList from './CategoryList';
import CredentialTable from './CredentialTable';

import Api from '../Helpers/Api';
import ModalsJs  from '../../ModalsJs';
import InviteModal from '../Modals/InviteModal';
import CredentialModal from '../Modals/CredentialModal';
import PassgenModal from '../Modals/PassgenModal';
import ImportExportModal from '../Modals/ImportExportModal';
import DecryptModal from '../Modals/DecryptModal';
import CreateDecryptModal from '../Modals/CreateDecryptModal';
import MaterialButton from '../MaterialButton';
import Crypto from '../Helpers/Crypto';

export default class MainView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			categories: props.categories,
			category: undefined,
			credentials: []
		};
		this.onCategorySelected = this.onCategorySelected.bind(this);
		this.decryptPasswordEntered = this.decryptPasswordEntered.bind(this);
	}

	componentDidMount() {
		ModalsJs.open("<div id='modal-root'></div>", {
			warning: true,
			warningOptions: { title: 'You must enter your encryption key to use MyPass. Are you sure you want to close?' },
			onClose: () => {
				if (this.crypto === undefined) window.location.reload();
			}
		});
	    if (this.state.categories.length !== 0)
			render((<DecryptModal submit={this.decryptPasswordEntered} />), document.getElementById('modal-root'));
		else
			render((<CreateDecryptModal submit={this.decryptPasswordEntered} />), document.getElementById('modal-root'));
	}

	onCategorySelected(category, ev) {
		this.setState({ category, credentials: category.credentials });
	}

	decryptPasswordEntered(password) {
		const crypto = new Crypto(password);
		this.setState(oldState => {
			oldState.crypto = crypto;
			crypto.decryptCategories(oldState.categories);
		});
		ModalsJs.close(true);
	}

	static openAddCredentialModal(credential){
		ModalsJs.open("<div id='modal-root'></div>", { warning: true });
		render((<CredentialModal credential={credential} />), document.getElementById('modal-root'));
	}
	static openGeneratePassModal(){
		ModalsJs.open("<div id='modal-root'></div>");
		render((<PassgenModal />), document.getElementById('modal-root'));
	}
	static openInviteModal(){
		ModalsJs.open("<div id='modal-root'></div>");
		render((<InviteModal />), document.getElementById('modal-root'));
	}
	static openImportExportModal(){
		ModalsJs.open("<div id='modal-root'></div>");
		render((<ImportExportModal />), document.getElementById('modal-root'));
	}
	static async logout(){
		await Api.logout();
		window.location.reload();
	}

	render() {
		return (
			<div>
				<CategoryList categories={this.state.categories} select={this.onCategorySelected} />
				<div class="nine columns">
					<MaterialButton title="Add new credential" icon="add" align="left" click={MainView.openAddCredentialModal} />
					<MaterialButton title="Generate new pass" icon="sync" align="left" click={MainView.openGeneratePassModal} />
					{this.props.admin && (<MaterialButton title="Create registration token" icon="mail_outline" align="left" click={MainView.openInviteModal} />)}
					<MaterialButton title="Import / Export backup" icon="save" align="left" click={MainView.openImportExportModal} />
					<MaterialButton title="Logout" icon="exit_to_app" align="right" click={MainView.logout} />
					<CredentialTable credentials={this.state.credentials} crypto={this.state.crypto} />
				</div>
			</div>
		);
	}
}