import { h, render, Component } from 'preact';

import MaterialButton from '../MaterialButton';
import Category from './Category';
import { Menu, Item } from '../Dropdown';
import ModalsJs from '../../ModalsJs';
import CreateCategoryModal from '../Modals/CreateCategoryModal';
import EditCategoryModal from '../Modals/EditCategoryModal';
import Api from '../Helpers/Api';

export default class CategoryList extends Component {
	onCreateCategoryClicked() {
        console.log('crypto', this.props.crypto);
		ModalsJs.open("<div id='modal-root'></div>");
		render((<CreateCategoryModal updated={this.onCategoriesUpdated} crypto={this.props.crypto} />), document.getElementById('modal-root'));
	}

	onCategoriesUpdated(category) {
        ModalsJs.close();
	    if (category) {
	        this.setState(oldState => oldState.categories.push(category))
        }
        else {
            this.setState({});
        }
	}


    onCategoryClicked(category, ev) {
        this.props.select(category, ev);
        this.setState({activeCategory: category});
    }

	onCategoryAltClicked(category, ev) {
	    if (ev.ctrlKey) return;
		ev.preventDefault();
		ev.stopPropagation();
		this.dropdown.open(ev.pageX, ev.pageY, category);
	}

	async onDropdownOptionSelected(option, item) {
		switch (option) {
			case 'name':
				ModalsJs.open("<div id='modal-root'></div>");
				render((<EditCategoryModal category={item} updated={this.onCategoriesUpdated} crypto={this.props.crypto} />), document.getElementById('modal-root'));
				break;
			case 'delete':
			    const resp = await ModalsJs.prompt({ title: 'Are you sure you want to delete this category and all credentials in it?' });
			    if (!resp) return;
                await Api.deleteCategory(item);
                let i = this.state.categories.indexOf(item);
                this.setState(oldState => {
                    oldState.categories.splice(i, 1);
                    if (oldState.activeCategory === item)
                        oldState.activeCategory = undefined;
                });
				break;
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			categories: props.categories,
            activeCategory: undefined
		};
		this.onCreateCategoryClicked = this.onCreateCategoryClicked.bind(this);
		this.onCategoryClicked = this.onCategoryClicked.bind(this);
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
						(<Category active={(category === this.state.activeCategory)} category={category} click={this.onCategoryClicked} altClick={this.onCategoryAltClicked} />))}
				</ul>
				<Menu ref={element => this.dropdown = element} optionSelected={this.onDropdownOptionSelected}>
					<Item item="name" title="Edit category" icon="mode_edit" />
					<Item item="delete" title="Delete category" icon="delete_forever" />
				</Menu>
			</div>
		);
	}
}