/*
	Halcyonic by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var $window = $(window),
		$body = $('body');

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1680px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ null,      '736px'  ]
		});

	// Nav.

		// Title Bar.
			$(
				'<div id="titleBar">' +
					'<a href="#navPanel" class="toggle"></a>' +
					'<span class="title">' + $('#logo').html() + '</span>' +
				'</div>'
			)
				.appendTo($body);

		// Panel.
			$(
				'<div id="navPanel">' +
					'<nav>' +
						$('#nav').navList() +
					'</nav>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left',
					target: $body,
					visibleClass: 'navPanel-visible'
				});

	// Information Modals.
		
		// Get all buttons that trigger modals
		var $infoButtons = $('.info-btn');
		var $modals = $('.info-modal');
		var $closeButtons = $('.close');

		// Open modal when button is clicked
		$infoButtons.on('click', function(e) {
			e.preventDefault();
			var modalId = $(this).data('modal');
			var $modal = $('#' + modalId);
			$modal.addClass('show');
			$body.css('overflow', 'hidden');
		});

		// Close modal when close button is clicked
		$closeButtons.on('click', function(e) {
			e.preventDefault();
			$(this).closest('.info-modal').removeClass('show');
			$body.css('overflow', 'auto');
		});

		// Close modal when clicking outside of it
		$modals.on('click', function(e) {
			if ($(e.target).is('.info-modal')) {
				$(this).removeClass('show');
				$body.css('overflow', 'auto');
			}
		});

		// Close modal on Escape key
		$(document).on('keydown', function(e) {
			if (e.key === 'Escape') {
				$modals.removeClass('show');
				$body.css('overflow', 'auto');
			}
		});

})(jQuery);