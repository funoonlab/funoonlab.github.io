export class Clear extends $e.modules.CommandBase {
	apply( args ) {
		$e.components.get( 'the7-bulk-edit-globals' ).clearBulkEditControlSettings( args );
	}
}

export default Clear;
