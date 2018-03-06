import { h, render, Component } from 'preact';

import MaterialButton from '../MaterialButton';
import Category from './Category';
import { Menu, Item } from '../Dropdown';
import ModalsJs from '../../ModalsJs';
import CategoryModal from '../Modals/CategoryModal';
import Api from '../Helpers/Api';

export default class CategoryList extends Component {
	onCreateCategoryClicked() {
		ModalsJs.open("<div id='modal-root'></div>");
		render((<CategoryModal submit={this.onCategoriesUpdated} />), document.getElementById('modal-root'));
	}

	onCategoriesUpdated() {
		this.setState({});
	}

	onCategoryAltClicked(category, ev) {
	    if (ev.ctrlKey) return;
		ev.preventDefault();
		ev.stopPropagation();
		this.dropdown.open(ev.pageX, ev.pageY, category);
	}

	onDropdownOptionSelected(option, item) {
		switch (option) {
			case 'name':
				ModalsJs.open("<div id='modal-root'></div>");
				render((<CategoryModal category={item} updated={this.onCategoriesUpdated} />), document.getElementById('modal-root'));
				break;
			case 'delete':
				ModalsJs.prompt({ title: 'Are you sure you want to delete this category and all credentials in it?' }).then(resp => {
				    if (!resp) return;
					Api.deleteCategory(item._id).then(() => {
						let i = this.state.categories.indexOf(item);
						this.setState(oldState => oldState.categories.splice(i, 1));
					});
				});
				break;
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			categories: props.categories
		};
		this.onCreateCategoryClicked = this.onCreateCategoryClicked.bind(this);
		this.onCategoryAltClicked = this.onCategoryAltClicked.bind(this);
		this.onDropdownOptionSelected = this.onDropdownOptionSelected.bind(this);
		this.onCategoriesUpdated = this.onCategoriesUpdated.bind(this);
	}

	render() {
		return (
			<div class="three columns categories">
				<div class="u-full-width">
					<MaterialButton icon="add" align="right" title="Add new category"
						click={this.onCreateCategoryClicked}
					/>
				</div>
				<ul class="u-full-width box category-lst">
					{this.state.categories.map(category =>
						(<Category active={(category === this.state.activeCategory)} category={category} click={this.props.select} altClick={this.onCategoryAltClicked} />))}
				</ul>
				<Menu ref={element => this.dropdown = element} optionSelected={this.onDropdownOptionSelected}>
					<Item item="name" title="Edit category" icon="mode_edit" />
					<Item item="delete" title="Delete category" icon="delete_forever" />
				</Menu>
			</div>
		);
	}
}