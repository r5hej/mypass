import { h, render, Component } from 'preact';

import CategoryList from './CategoryList';
import CredentialTable from './CredentialTable';

import Api from '../Helpers/Api';
import ModalsJs  from '../../ModalsJs';
import InviteModal from '../Modals/InviteModal';
import EditCredentialModal from '../Modals/EditCredentialModal';
import CreateCredentialModal from '../Modals/CreateCredentialModal';
import PassgenModal from '../Modals/PassgenModal';
import ImportExportModal from '../Modals/ImportExportModal';
import DecryptModal from '../Modals/DecryptModal';
import CreateDecryptModal from '../Modals/CreateDecryptModal';
import MaterialButton from '../MaterialButton';
import Crypto from '../Helpers/Crypto';
import { Menu, Item } from '../Dropdown';
import Credential from './Credential';

export default class MainView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			categories: props.categories,
			category: undefined,
            crypto: undefined,
			credentials: []
		};
		this.onCategorySelected = this.onCategorySelected.bind(this);
		this.openAddCredentialModal = this.openAddCredentialModal.bind(this);
		this.decryptPasswordEntered = this.decryptPasswordEntered.bind(this);
		this.moreClicked = this.moreClicked.bind(this);
		this.onDropdownOptionSelected = this.onDropdownOptionSelected.bind(this);
		this.onCredentialsUpdated = this.onCredentialsUpdated.bind(this);
	}

	componentDidMount() {
		ModalsJs.open("<div id='modal-root'></div>", {
			warning: true,
			warningOptions: { title: 'You must enter your encryption key to use MyPass. Are you sure you want to close?' },
			onClose: () => {
				console.log("closed", this.state.crypto);
				// if (this.state.crypto === undefined) window.location.reload();
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

	openAddCredentialModal(){
	    if (!this.state.category) return;
		ModalsJs.open("<div id='modal-root'></div>", { warning: true });
        render((<CreateCredentialModal categoryId={this.state.category._id} crypto={this.state.crypto} updated={this.onCredentialsUpdated}/>), document.getElementById('modal-root'));
	}
    moreClicked(credential, ev) {
        if (ev.ctrlKey) return;
        ev.preventDefault();
        ev.stopPropagation();
        this.dropdown.open(ev.pageX, ev.pageY, credential);
    }
    onCredentialsUpdated(credential) {
        ModalsJs.close(true);
        if (credential) {
            this.setState(oldState => oldState.credentials.push(credential))
        }
        else {
            this.setState({});
        }
    }
    async onDropdownOptionSelected(option, item) {
        switch (option) {
            case 'edit':
                ModalsJs.open("<div id='modal-root'></div>", { warning: true });
                render((<EditCredentialModal credential={item} crypto={this.state.crypto} updated={this.onCredentialsUpdated}/>), document.getElementById('modal-root'));
                break;
            case 'delete':
                const resp = await ModalsJs.prompt({ title: 'Are you sure you want to delete this credential?' });
                if (!resp) return;
                await Api.deleteCredential(item);
                let i = this.state.credentials.indexOf(item);
                this.setState(oldState => oldState.credentials.splice(i, 1));
                break;
        }
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
				<CategoryList categories={this.state.categories} select={this.onCategorySelected} crypto={this.state.crypto} />
				<div class="nine columns">
					<MaterialButton title="Add new credential" icon="add" align="left" click={this.openAddCredentialModal} disabled={!this.state.category} />
					<MaterialButton title="Generate new pass" icon="sync" align="left" click={MainView.openGeneratePassModal} />
					{this.props.admin && (<MaterialButton title="Create registration token" icon="mail_outline" align="left" click={MainView.openInviteModal} />)}
					<MaterialButton title="Import / Export backup" icon="save" align="left" click={MainView.openImportExportModal} />
					<MaterialButton title="Logout" icon="exit_to_app" align="right" click={MainView.logout} />
					{/*<CredentialTable credentials={this.state.credentials} crypto={this.state.crypto} />*/}
                    <table class="u-full-width credential-table box">
                        <thead>
                        <tr>
                            <th class="truncate">Location</th>
                            <th class="truncate credential-desc">Description</th>
                            <th class="truncate">Username</th>
                            <th class="truncate">Password</th>
                            <th style={{ width: '44px' }} />
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.credentials.map(credential => (<Credential key={credential._id} credential={credential} moreClick={this.moreClicked} />))}
                        </tbody>
                    </table>
                    <Menu ref={element => this.dropdown = element} optionSelected={this.onDropdownOptionSelected}>
                        <Item item="edit" title="Edit credential" icon="mode_edit" />
                        <Item item="delete" title="Delete credential" icon="delete_forever" />
                    </Menu>
				</div>
			</div>
		);
	}
}