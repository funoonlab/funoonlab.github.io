export default class extends elementor.modules.controls.Switcher {
	initialize( options ) {
		super.initialize( options );

		this.$el.addClass( 'elementor-control-type-switcher' );
	}

	onBaseInputChange( event ) {
		super.onBaseInputChange( event );

		const input = event.currentTarget,
			value = this.getInputValue( input ),
			command = this.model.get( 'on_change_command' );
		if ( command ) {
			$e.run( command, { name: this.model.get( 'name' ), value } );
		}

		this.model.set( 'return_value', null );
	}
}
