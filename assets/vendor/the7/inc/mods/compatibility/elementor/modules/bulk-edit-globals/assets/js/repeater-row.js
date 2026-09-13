export default class extends elementor.modules.controls.RepeaterRow {
	ui() {
		const ui = super.ui();

		ui.sortButton = '.elementor-repeater-tool-sort';
		ui.bulkActionInput = '.elementor-repeater-tool-bulk-action';

		return ui;
	}

	getTemplate() {
		return '#tmpl-the7-elementor-global-style-repeater-row';
	}

	events() {
		return {
			'click @ui.removeButton': 'onRemoveButtonClick',
			'keyup @ui.removeButton': 'onRemoveButtonPress',
			'click @ui.bulkActionInput': 'onBulkActionClickInput',
		};
	}

	onBulkActionClickInput() {
		const currentValue = this.ui.bulkActionInput.is( ':checked' );
		elementor.channels.panelElements.reply( 'the7-bulk-edit:' + this.model.get( '_id' ) + ':is-checked', currentValue );
	}

	setBulkActionCheckbox( value ) {
		this.ui.bulkActionInput.prop( 'checked', !! value );
		this.onBulkActionClickInput();
	}

	updateColorValue() {
		this.$colorValue.text( this.model.get( 'color' ) );
	}

	getDisabledRemoveButtons() {
		if ( ! this.ui.disabledRemoveButtons ) {
			this.ui.disabledRemoveButtons = this.$el.find( '.elementor-repeater-tool-remove--disabled' );
		}

		return this.ui.disabledRemoveButtons;
	}

	getRemoveButton() {
		return this.ui.removeButton.add( this.getDisabledRemoveButtons() );
	}

	triggers() {
		return {};
	}

	onRender() {
		super.onRender();
		const reply = elementor.channels.panelElements.request( 'the7-bulk-edit:checkbox:switch' );

		if ( ! reply ) {
			this.ui.bulkActionInput.hide();
		}
	}

	onChildviewRender( childView ) {
		const isColor = 'color' === childView.model.get( 'type' ),
			isPopoverToggle = 'popover_toggle' === childView.model.get( 'type' ),
			$controlInputWrapper = childView.$el.find( '.elementor-control-input-wrapper' );

		let globalType = '',
			globalTypeTranslated = '';

		if ( isColor ) {
			this.$colorValue = jQuery( '<div>', { class: 'e-global-colors__color-value elementor-control-unit-3' } );

			$controlInputWrapper
				.prepend( this.getRemoveButton(), this.$colorValue )
				.prepend( this.ui.sortButton );

			globalType = 'color';
			globalTypeTranslated = __( 'Color', 'elementor' );

			this.updateColorValue();
		}

		if ( isPopoverToggle ) {
			$controlInputWrapper
				.append( this.getRemoveButton() )
				.append( this.ui.sortButton );

			globalType = 'font';
			globalTypeTranslated = __( 'Font', 'elementor' );
		}

		if ( isColor || isPopoverToggle ) {
			const removeButtons = this.getDisabledRemoveButtons();

			this.ui.removeButton.data( 'e-global-type', globalType );

			this.ui.removeButton.tipsy( {
				/* Translators: %s: Font/Color. */
				title: () => sprintf( __( 'Delete Global %s', 'elementor' ), globalTypeTranslated ),
				gravity: () => 's',
			} );

			removeButtons.tipsy( {
				/* Translators: %s: Font/Color. */
				title: () => sprintf( __( 'System %s can\'t be deleted', 'elementor' ), globalTypeTranslated ),
				gravity: () => 's',
			} );
		}
	}

	onModelChange( model ) {
		if ( undefined !== model.changed.color ) {
			this.updateColorValue();
		}
	}

	onRemoveButtonClick() {
		const globalType = this.ui.removeButton.data( 'e-global-type' ),
			globalTypeTranslatedCapitalized = 'font' === globalType ? __( 'Font', 'elementor' ) : __( 'Color', 'elementor' ),
			globalTypeTranslatedLowercase = 'font' === globalType ? __( 'font', 'elementor' ) : __( 'color', 'elementor' ),
			/* Translators: 1: Font/Color, 2: typography/color. */
			translatedMessage = sprintf( __( 'You\'re about to delete a Global %1$s. Note that if it\'s being used anywhere on your site, it will inherit a default %1$s.', 'elementor' ), globalTypeTranslatedCapitalized, globalTypeTranslatedLowercase );

		this.confirmDeleteModal = elementorCommon.dialogsManager.createWidget( 'confirm', {
			className: 'e-global__confirm-delete',
			/* Translators: %s: Font/Color. */
			headerMessage: sprintf( __( 'Delete Global %s', 'elementor' ), globalTypeTranslatedCapitalized ),
			message: '<i class="eicon-info-circle"></i> ' + translatedMessage,
			strings: {
				confirm: __( 'Delete', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			hide: {
				onBackgroundClick: false,
			},
			onConfirm: () => {
				this.trigger( 'click:remove' );
			},
		} );

		this.confirmDeleteModal.show();
	}

	onRemoveButtonPress( event ) {
		const ENTER_KEY = 13,
			SPACE_KEY = 32;

		if ( ENTER_KEY === event.keyCode || SPACE_KEY === event.keyCode ) {
			event.currentTarget.click();
			event.stopPropagation();
		}
	}

	onDestroy() {
		elementor.channels.panelElements.reply( 'the7-bulk-edit:' + this.model.get( '_id' ) + ':is-checked', null );
	}

	initialize( options ) {
		super.initialize( options );

		this.listenTo( elementor.channels.panelElements, 'the7-bulk-edit:checkbox:switch', this.onBulkEditSwitch );
	}

	onBulkEditSwitch( state ) {
		if ( state.value ) {
			this.ui.bulkActionInput.show();
		} else {
			this.ui.bulkActionInput.hide();
		}
	}
}
