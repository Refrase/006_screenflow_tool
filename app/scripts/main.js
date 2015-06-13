$( document ).ready( function() {

	'use strict';

	var dom = document.body;
	var numOfScreens = 0;
	var idCounter = 0;

	// jsPlumb: Linjer mellem screens
	// Eksempel herfra: https://github.com/EmielH/jsplumb-examples/blob/master/getting-started-2.html
	// ------- Initialize jsPlumb -------
	jsPlumb.ready(function() {
	  jsPlumb.setContainer( $( '#container' ) );

	  $( '#container' ).on( 'click', '#screenAdd, .btn-add-child-screen', function() {
			$( '#screenAdd' ).hide();

			// ------- Build screen -------
			var screenNode = $('<div>').attr('id', 'screen-node-' + idCounter).addClass('screen-node');

			var screenInput = $( '<input>' )
				.addClass( 'screen-input' )
				.attr( 'type', 'text' )
				.attr( 'size', '12' );
			if ( numOfScreens === 0 ) {
				screenInput.attr( 'placeholder', 'Sitename' );
			} else {
				screenInput.attr( 'placeholder', 'Screenname' );
			}

			var connectArea = $('<div>').addClass('connect-area');

			var btnAddChildScreen = $( '<button>' )
				.addClass( 'btn btn-primary btn-add-child-screen' )
				.html( '<span class="glyphicon glyphicon-plus"></span>' );

			var btnDeleteScreen = $( '<button>' )
				.addClass( 'btn btn-danger btn-del-screen' )
				.html( '<span class="glyphicon glyphicon-minus"></span>' )
				.attr({ // Bootstrap 'Popover' initialized further down
					'type': 'button',
					'data-container': 'body',
					'data-toggle': 'popover',
					'role': 'button',
					'data-content': '<strong>We saved your branch!</strong> You can only delete the outermost screens of a branch...'
				});
			btnDeleteScreen.popover({ animation: true, delay: 20, html: true, placement: 'right' });
			// 'delay' is on to keep popover from showing when deleting a screennode

			screenNode.append( screenInput );
			screenNode.append( connectArea );
			screenNode.append( btnAddChildScreen );
			screenNode.append( btnDeleteScreen );

			// ------- Decide where newly created screen appears -------
			var thisScreenPos = $( this ).offset();
			// Adjust for #screenAdd returning position top: 0 left: 0
			if ( thisScreenPos.left === 0 ) {
				thisScreenPos.left = $( window ).width() / 2 - 48;
			}
			screenNode.css({
			  'top': thisScreenPos.top + 52, // e.pageY to place at cursor pos
			  'left': thisScreenPos.left // e.pageX to place at cursor pos
			});

			$( '#container' ).append( screenNode );

			// ------- Apply plumbs/connection ability -------
			var connectorFlowc = [ 'Flowchart', { cornerRadius: 2 } ];

			jsPlumb.makeSource( connectArea, {
			  connector: connectorFlowc,
			  parent: screenNode,
			  anchor: 'Bottom'
			});

			jsPlumb.makeTarget( screenNode, {
			  anchor: 'Top'
			});

			// ------- Connect parent screen to newly created screen on creation -------
			var thisClosestNode = $( this ).closest( '.screen-node' );
			jsPlumb.connect({
				source: thisClosestNode,
				target: screenNode,
				connector: connectorFlowc
			});

			// ------- Apply draggability -------
			jsPlumb.draggable( screenNode, {
			  axis: 'x'
			});

			numOfScreens += 1;
			idCounter++;
	  });
	});

	// ------- Remove popovers on click outside .btn-del-screen -------
	$('body, .screen-node').on('click', function (e) {
	  //did not click a popover toggle or popover
	  if ($(e.target).data( 'toggle' ) !== 'popover' && $(e.target).parents('.popover.in').length === 0) {
	    $('[data-toggle="popover"]').popover('hide');
	  }
	});

	// ------- Adjust input width to text-length -------
	$( dom ).on( 'keyup', '.screen-input', function() {
		var screenInputTextW = $( this ).val().length;
		var screenInputTextWCalc = (screenInputTextW * 8 + 16);
		// Input bredde fra "screenInput.size = 'x'"" længere oppe
		if ( screenInputTextWCalc > 72 ) {
			$( this ).width( screenInputTextWCalc + 'px' );
		}
  });

	// ------- Show add and delete buttons on hover -------
	$( dom ).on({
		mouseenter: function() {
			$( this ).children( '.btn' ).stop(true, true).show();
		},
		mouseleave: function() {
			$( this ).children( '.btn' ).stop(true, true).delay( 1000 ).fadeOut( 200 );
		}
	}, '.screen-node');

	// ------- Remove screen + 'plumbs' on red button click -------
	$( dom ).on( 'click', '.btn-del-screen', function(e) {
		// Only remove, if it is outermost screen in that branch of screens
		var thisClosestNode = $( this ).closest( '.screen-node' );
		var thisClosestNodeId = thisClosestNode.attr( 'id' );
		/* jsPlumb.getConnections({ source: x }) returns an array only populated
			 IF screennode with this id is a source to another screennode */
		var isSource = jsPlumb.getConnections({ source: thisClosestNodeId });
		// So if it returns an empty array (length of 0) it is not a source and can be deleted
		if ( isSource.length === 0 ) {
			jsPlumb.detachAllConnections( thisClosestNode );
			numOfScreens -= 1;
			$( this ).popover( 'destroy' );
			thisClosestNode.remove();
		}
		if ( numOfScreens === 0 ) {
			$( '#screenAdd' ).fadeIn( 200 );
		}
		e.stopPropagation();
	});

});