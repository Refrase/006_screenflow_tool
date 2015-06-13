$( document ).ready( function() {

	/*
		TO DO:
		Kolonner
		Gem som SVG
		Forgreninger forstørres ved hover ellers formindskes
	*/

	'use strict';

/* ---------------- jsPlumb-løsning ----------------- */

	// * KNAPPER SKAL KOMME FREM VED HOVER OVER DET OMRÅDE DE KOMMER FREM PÅ
	// * PROBLEM MED AT STREG ER EN ANELSE VED SIDEN AF, NÅR DEN LAVES EFTERFØLGENDE
	// * FLOTTERE .connect-area
	// * NYT SCREEN PÅ NÆSTE TRIN KAN MÅSKE TJEKKE OM DET LÆGGER SIG OVEN I ET ANDET
	// * MÅSKE SKAL DER KNAPPER PÅ HVERT TRIN TIL AT OPRETTE ET SCREEN PÅ DET GIVNE TRIN

	// * BYG MED ANGULARJS + FIREBASE FOR DYNAMISK GEMBAR FUNKTIONALITET

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

/* ---------------- Gammel løsning ----------------- */

	// var dom = document.body;
	// var numOfScreens = 0;
	// var idCounter = 0;

	// // GAMMEL Create screen
	// var screenAdd = function() {
	// 	var screenNode = document.createElement( 'div' );
	// 	// // Remove last-added class from all other .screen-nodes
	// 	// $( '.screen-node' ).removeClass( 'last-added-screen' );
	// 	screenNode.className = 'screen-node'; // Add class 'last-added-screen' here if feature above is used
	// 	screenNode.id = 'screen-node-' + idCounter;

	// 	// Main part/input
	// 	var screenInput = document.createElement( 'input' );
	// 	screenInput.className = 'screen-input';
	// 	screenInput.type = 'text';
	// 	screenInput.size = '12';
	// 	// If first one placeholder = 'sitename' else 'screenname'
	// 	if ( numOfScreens === 1 ) {
	// 		screenInput.placeholder = 'Sitename';
	// 	} else {
	// 		screenInput.placeholder = 'Screenname';
	// 	}
	// 	screenNode.appendChild(screenInput);

	// 	// Btn: Add child screen
	// 	var btnAddChildScreen = document.createElement( 'button' );
	// 	btnAddChildScreen.className = 'btn btn-primary btn-add-child-screen';
	// 	btnAddChildScreen.innerHTML = '<span class="glyphicon glyphicon-plus"></span>';
	// 	screenNode.appendChild(btnAddChildScreen);

	// 	// Btn: Delete screen
	// 	var btnDeleteScreen = document.createElement( 'button' );
	// 	btnDeleteScreen.className = 'btn btn-danger btn-del-screen';
	// 	btnDeleteScreen.innerHTML = '<span class="glyphicon glyphicon-minus"></span>';
	// 	screenNode.appendChild(btnDeleteScreen);

	// 	idCounter += 1;

	// 	return screenNode;
	// };

	// GAMMEL Append to screen-tree-row-1
	// $( dom ).on( 'click', '#screenAdd', function() {
	// 	$( this ).hide();
	// 	numOfScreens += 1;
	// 	$( '#screentree-row-1' ).append( screenAdd() ).delay( 200 );
	// });

	// // Generate vertical stroke for after screen
	// var addStrokeVertAfter = function () {
	// 	var strokeVert = document.createElement( 'div' );
	// 	strokeVert.className = 'stroke-vert-after';
	// 	return strokeVert;
	// };

	// // Generate vertical stroke for before screen
	// var addStrokeVertBefore = function () {
	// 	var strokeVert = document.createElement( 'div' );
	// 	strokeVert.className = 'stroke-vert-before';
	// 	return strokeVert;
	// };

	// GAMMEL Delete screen
	// $( dom ).on( 'click', '.btn-del-screen', function() {
	// 	// Delete only screen if it hasn't got a vertical stroke after
	// 	// var classOfNextSibling = $( this ).next().hasClass( 'stroke-vert-after' );
	// 	// if ( !classOfNextSibling ) {
	// 		numOfScreens -= 1;
	// 		$( this ).closest( '.screen-node' ).remove();
	// 	// }
	// 	// Show original add button if no screens present
	// 	if ( numOfScreens === 0 ) {
	// 		$( '#screenAdd' ).fadeIn( 200 );
	// 	}
	// });

	// // GAMMEL Append childscreen to screen-tree-row-x
	// $( dom ).on( 'click', '.btn-add-child-screen', function() {
	// 	numOfScreens += 1;
	// 	var currentRow = $( this ).closest( '.row' ).attr( 'id' );
	// 	var lastCharOfCurRow = currentRow.substr( currentRow.length - 1 );
	// 	var lastCharOfCurRowToNum = parseInt( lastCharOfCurRow );
	// 	var nextRowNum = lastCharOfCurRowToNum += 1;
	// 	var nextRow = $( '#screentree-row-' + nextRowNum );
	// 	$( nextRow ).append( screenAdd() );
	// 	// // Append stroke to .screen-node of this button
	// 	// var parentScreenNode = $( this ).closest( '.screen-node' );
	// 	// $( parentScreenNode ).append( addStrokeVertAfter() );
	// 	// $( '.last-added-screen' ).prepend( addStrokeVertBefore() );
	// });

	// // GAMMEL Sortable-function (jQuery UI)
	// // Get screentree-rows id and build string
	// var screentreeRowsLength = $( '#screentree-rows' ).children().length;
	// var rowsIdString = '';
	// for ( var i = 1; i <= screentreeRowsLength; i++ ) {
	// 	var screentreeRow = '#screentree-row-' + i.toString();
	// 	// Only apple comma if not the last row
	// 	if ( i === screentreeRowsLength ) {
	// 		rowsIdString += screentreeRow;
	// 	} else {
	// 		rowsIdString += screentreeRow + ', ';
	// 	}
	// }
	// // ...and make screen nodes sortable across rows
	// $( rowsIdString ).sortable({ connectWith: '.connect-sortable' }); // jQuery UI


});