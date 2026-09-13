import * as commands from './commands/';

import Repeater from './repeater';
import Switcher from './switcher';

export default class Component extends $e.modules.ComponentBase {
	manager = {};

	constructor( args ) {
		super( args );
		this.manager = args.manager;
		this.bindEvents();

		elementor.addControlView( 'the7-global-style-repeater', Repeater );
		elementor.addControlView( 'the7-global-style-switcher', Switcher );
	}

	getNamespace() {
		return 'the7-bulk-edit-globals';
	}

	/**
	 * Listen to click event
	 *
	 * @return {void}
	 */
	bindEvents() {
		elementor.channels.editor.on( 'the7_bulk_edit:apply', ( { container, el } ) => {
			const controls = this.getGroupControls( { the7_bulk_edit_typography: '' }, container.controls );

			const repeaterContainer = container.repeaters.custom_typography;
			let settingsChanged = 0;
			container.getSetting( 'custom_typography' ).each( ( model ) => {
				const id = model.get( '_id' );
				const reply = elementor.channels.panelElements.request( 'the7-bulk-edit:' + id + ':is-checked' );
				if ( reply ) {
					const foundChildren = repeaterContainer.children.findRecursive(
						// eslint-disable-next-line no-shadow
						( container ) => container.id === id,
					);

					Object.values( controls ).forEach( ( control ) => {
						let hasVal = null;
						const settings = container.getSetting( control.name );
						if ( 'slider' === control.type ) {
							hasVal = settings.size;
						} else {
							hasVal = settings;
						}
						if ( hasVal ) {
							const key = control.name.replace( 'the7_bulk_edit_', '' );
							$e.run( 'document/elements/settings', {
								container: foundChildren,
								settings: {
									[ key ]: settings,
								},
								options: {
									external: true,
									render: true,
									renderUI: true,
								},
							} );
							settingsChanged++;
						}
					} );
				}
			} );

			// Reload styleguide to update all styles
			if ( elementor.getPreferences( 'enable_styleguide_preview' ) && settingsChanged > 1 ) {
				$e.run( 'preview/styleguide/hide' );
				elementor.documents.getCurrent().config.settings.settings.custom_typography = container.getSetting( 'custom_typography' ).toJSON();
				setTimeout( () => {
					$e.route( 'panel/global/global-typography' );
					$e.run( 'preview/styleguide/global-typography' );
				}, 500 );
			}

			jQuery( '.elementor-control-the7_bulk_edit_apply_notice' ).fadeIn( 500 ).delay( 3000 ).fadeOut( 500 );
		} );
	}

	clearBulkEditControlSettings() {
		const container = elementor.documents.getCurrent().container;
		const controls = this.getGroupControls( { the7_bulk_edit_typography: '' }, container.controls );
		// Clear custom bulk edit settings.
		Object.values( controls ).forEach( ( control ) => {
			container.settings.set( control.name, control.default );
		} );

		container.settings.set( 'the7_bulk_edit', container.controls.the7_bulk_edit.default );

		elementor.channels.panelElements.reply( 'the7-bulk-edit:checkbox:switch', container.settings.get( 'the7_bulk_edit' ) );
	}

	getGroupControls( settings, controls ) {
		const result = {};

		Object.keys( settings ).forEach( ( settingKey ) => {
			Object.values( controls ).forEach( ( control ) => {
				if ( settingKey === control.name ) {
					result[ control.name ] = control;
				} else if ( control?.groupPrefix ) {
					const groupPrefix = control.groupPrefix;

					if ( groupPrefix.startsWith( settingKey ) ) {
						result[ control.name ] = control;
					}
				}
			} );
		} );

		return result;
	}

	checkboxSwitch( args ) {
		elementor.channels.panelElements.trigger( 'the7-bulk-edit:checkbox:switch', args );
	}

	defaultCommands() {
		// Object of all the component commands.
		return this.importCommands( commands );
	}
}
