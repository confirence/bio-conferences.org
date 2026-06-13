
jQuery(document).ready(function($) {
    $( ".custom.search" ).on('click', function() {
        if ($("div#search").hasClass("hidden")) {
            $('div#search').show();
            $('div#search form').show();
            $( "div#search.hidden" ).switchClass( "hidden", "active", 500, "easeInOutQuad" );
            $( "#search form input[type=text]" ).focus();
        }
        else{
            $( "div#search.active" ).switchClass( "active", "hidden", 500, "easeInOutQuad" );
            $( "#search-form input[type=text]" ).focusout();
            $('div#search form').hide();
        };
    });
});