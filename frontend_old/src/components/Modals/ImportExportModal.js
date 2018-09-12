import { h, Component } from 'preact';

export default class ImportExportModal extends Component {
	onSubmit(ev) {
		ev.preventDefault();
	}

	constructor(props) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}

	render() {
		return (
			<div>
				<div class="six columns">
					<b>Export</b>
					<p>Download a backup of your encrypted data</p>
				</div>
				<form class="six columns" onSubmit={this.onSubmit} id="import-form">
					<b>Import</b>
					<p>Upload a backup file and import the content</p>
					<input class="u-full-width" type="file" name="file" required="required" />
				</form>
				<div class="u-full-width">
					<div class="six columns">
						<a href="/export" target="_blank">
							<button class="u-full-width">Download backup</button>
						</a>
					</div>
					<div class="six columns">
						<input class="u-full-width" type="submit" value="Upload backup" />
					</div>
				</div>
			</div>
		);
	}
}