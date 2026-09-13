import RepeaterRow from './repeater-row';

export default class extends elementor.modules.controls.Repeater {
	constructor( ...args ) {
		super( ...args );

		this.childView = RepeaterRow;
	}

	ui() {
		const ui = elementor.modules.controls.Repeater.prototype.ui;
		ui.selectAllControl = '.elementor-repeater-tool-bulk-action-select-all';
		ui.selectAllCheckbox = '.elementor-repeater-tool-bulk-action-select-all input';
		ui.selectAllTextActive = '.elementor-repeater-tool-bulk-action-select-all .choose-select-all-active';
		ui.selectAllTextNotActive = '.elementor-repeater-tool-bulk-action-select-all .choose-select-all-not-active';

		return ui;
	}

	events() {
		const events = super.events();

		events[ 'click @ui.selectAllCheckbox' ] = 'onSelectAllClickInput';
		return events;
	}

	onSelectAllClickInput() {
		const currentValue = this.ui.selectAllCheckbox.is( ':checked' );
		if ( currentValue ) {
			this.ui.selectAllTextActive.show();
			this.ui.selectAllTextNotActive.hide();
		} else {
			this.ui.selectAllTextActive.hide();
			this.ui.selectAllTextNotActive.show();
		}

		this.model.set( 'selectAllChecked', currentValue );
		this.children.each( ( control ) => {
			 control.setBulkActionCheckbox( currentValue );
		} );
	}

	onRender() {
		super.onRender();
		const reply = elementor.channels.panelElements.request( 'the7-bulk-edit:checkbox:switch' );

		if ( ! reply ) {
			this.ui.selectAllControl.hide();
		}
		this.ui.selectAllTextActive.hide();
	}

	templateHelpers() {
		const templateHelpers = super.templateHelpers();

		templateHelpers.addButtonText = 'custom_colors' === this.model.get( 'name' ) ? __( 'Add Color', 'elementor' ) : __( 'Add Style', 'elementor' );
		return templateHelpers;
	}

	getDefaults() {
		const defaults = super.getDefaults();

		defaults.title = `${ __( 'New Item', 'elementor' ) } #${ this.children.length + 1 }`;

		return defaults;
	}

	getSortableParams() {
		const sortableParams = super.getSortableParams();

		sortableParams.placeholder = 'e-sortable-placeholder';
		sortableParams.cursor = 'move';

		return sortableParams;
	}

	className() {
		let classes = super.className();
		classes += ' elementor-control-type-global-style-repeater';
		return classes;
	}

	initialize( options ) {
		super.initialize( options );

		this.listenTo( elementor.channels.panelElements, 'the7-bulk-edit:checkbox:switch', this.onBulkEditSwitch );
	}
	onBulkEditSwitch( state ) {
		if ( state.value ) {
			this.ui.selectAllControl.show();
		} else {
			this.ui.selectAllControl.hide();
		}
	}
}
