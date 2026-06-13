// Bookmark de Connotea
function bookmark_in_connotea(u) { 
    x = window; 
    e = x.encodeURIComponent; 
    w = open('http://www.connotea.org/addpopup?continue=confirm&uri='+e(u), 
             'add',
		     'width=600, height=400, scrollbars, resizable'); 
    void(x.setTimeout('w.focus()', 200));	
}

// Bookmark de Bibsonomy
function bookmark_in_bibsonomy(u, t) {
	window.open('http://www.bibsonomy.org/ShowBookmarkEntry?c=b&jump=yes&url='+encodeURIComponent(u)+'&description='+encodeURIComponent(t), 
			 '_blank',
			  'width=950, height=500, scrollbars, resizable');
    void(window.setTimeout('w.focus()', 200));	
}

// Bookmark de Delicious
function bookmark_in_delicious(u, t) {
	window.open('http://delicious.com/save?v=5&amp;noui&amp;jump=close&amp;url='+encodeURIComponent(u)+'&amp;title='+encodeURIComponent(t), 
			 '_blank', 
			 'toolbar=no, width=550, height=550'); 
	return false;
}

// Bookmark de Facebook
function fbs_click(u, t) {
	window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(u)+'&t='+encodeURIComponent(t), 
				'sharer', 
				'toolbar=0, status=0, width=626, height=436'); 
	return false;
}