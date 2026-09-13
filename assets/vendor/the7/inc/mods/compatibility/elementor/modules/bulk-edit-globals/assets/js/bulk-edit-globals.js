import Component from './component';

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		if ( ! elementor.config.user.can_edit_kit ) {
			return;
		}

		$e.components.register( new Component( { manager: this } ) );

		this.addHooks();
	}

	getGlobalRoutes() {
		return {
			'global-typography': 'panel/global/global-typography',
		};
	}

	addHooks() {
		elementor.hooks.addAction( 'panel/global/tab/before-show', this.show.bind( this ) );
		elementor.hooks.addAction( 'panel/global/tab/before-destroy', this.hide.bind( this ) );
	}

	/**
	 * Function show() triggered before showing a new tab at the Globals panel.
	 *
	 * @param {Object} args
	 */
	show( args ) {
		if ( ! args.id || ! ( args.id in this.getGlobalRoutes() ) ) {

		}

		$e.run( 'the7-bulk-edit-globals/clear', { id: args.id } );
	}

	/**
	 * Function hide() triggered before hiding a tab at the Globals panel.
	 *
	 * @param {Object} args
	 */
	hide( args ) {
		if ( ! args.id || ! ( args.id in this.getGlobalRoutes() ) ) {
			return;
		}

		$e.run( 'the7-bulk-edit-globals/clear', { id: args.id } );
	}
}

new Module();
