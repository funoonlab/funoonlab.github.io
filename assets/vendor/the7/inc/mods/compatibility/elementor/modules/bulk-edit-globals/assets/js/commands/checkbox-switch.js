export class CheckboxSwitch extends $e.modules.CommandBase {
	apply( args ) {
		$e.components.get( 'the7-bulk-edit-globals' ).checkboxSwitch( { value: args.value } );
	}
}

export default CheckboxSwitch;
