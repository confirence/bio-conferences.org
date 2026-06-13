jQuery(function ($) {
    'use strict';
    if (window.toc_initialised) {
        return;
    }
    window.toc_initialised = true;
    var cancel = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };
    var translations = {};
    var toc = $('#toc');
    var articles = $('article');
    var toc_url = toc.data('toc-url') || '/';

    /**
     * Section toggle
     */
    $('.toggle_class').click(function () {
        var dkey = stringEscape($(this).attr('id').replace('section_', ''));
        var section = $('#section_' + dkey);
        if (section.hasClass('minus')) {
            section.addClass('plus');
            section.removeClass('minus');
        } else {
            section.addClass('minus');
            section.removeClass('plus');
        }
        $('#articles-section-' + dkey) . slideToggle();
        return false;
    });

    /**
     * Article publication (Lavoisier)
     */
    $('.article_publication').click(function() {
        var $this = $(this);
        var article = $this.parents('article');
        var dkey = article.data('dkey');
        var state = article.data('publication-state');
        $this.before($('#wait-progress').show());
        $.ajax({
            url: translations.publication_url,
            complete: function () {
                $('#wait-progress').hide();
                initialize_publication();
            },
            success: function (data) {
                if (data.success) update_article_publication(article, state);
            },
            dataType: 'json',
            type: 'post',
            data: {'dkey': dkey, 'state': !state}
        });
        return false;
    });

    /**
     * Full TOC publication (Lavoisier)
     */
    $('.toc_publication').click(function() {
        var $this = $(this);
        var id_issue = toc.data('id_issue');
        var state = $this.data('state');
        $this.before($('#wait-progress').show());
        $.ajax({
            url: translations.publication_url,
            complete: function () {
                $('#wait-progress').hide();
                initialize_publication();
            },
            success: function (data) {
                if (data.success) update_toc_publication(state);
            },
            dataType: 'json',
            type: 'post',
            data: {'id_issue': id_issue, 'state': !state}
        });
        return false;
    });

    /**
     * Update all articles publication
     *
     * @param state
     */
    function update_toc_publication(state)
    {
        articles.each(function(i, el){
            var article = $(el);
            var publication_locked = article.data('publication_locked');
            var publication_state = article.data('publication-state');
            if (!publication_locked && (publication_state == state)) {
                update_article_publication($(article), state);
            }
        });
        return falsse;
    }

    /**
     * Update an article publication
     *
     * @param dkey
     * @param state
     */
    function update_article_publication(article, state)
    {
        var dkey = stringEscape(article.data('dkey'));
        $("#publication_flag_" + dkey).toggle();
        var pub_action = $("#publication_action_" + dkey)
        if (state == 1) {
            article.data('publication-state', 0);
            pub_action.text(translations.publish_text).addClass('article-published');
        } else {
            article.data('publication-state', 1);
            pub_action.text(translations.unpublish_text).removeClass('article-published');
        }
        return false;
    }

    /**
     * Citation: select all
     */
    $('#a_selectall').click(function() {
        var self = $(this);
        var select_txt = translations.select_all;
        var unselect_txt = translations.unselect_all;
        var txt = self.text();
        if (txt == select_txt) {
            $('input:checkbox').attr('checked','checked');
            self.text(unselect_txt);
        } else {
            $('input:checkbox').removeAttr('checked');
            self.text(select_txt);
        }
    });

    /**
     * Citation: export
     */
    $('#a_citation').click(function() {
        var input_sel = $('.ref_check:checked');
        var url = translations.makeref_url;
        var array = [];
        input_sel.each(function () {
            array.push($(this).attr('value'));
        });
        if (array.length > 0) {
            window.location = url + array.join(',');
        }
        return false;
    });

    /**
     *
     */
    function initialize_publication()
    {
        var pub = 0, not_pub = 0;
        articles.each(function (i, el){
            var article = $(el);
            var publication_locked = article.data('publication_locked');
            if (!publication_locked) {
                var publication_state = article.data('publication-state');
                (publication_state == 1) ? pub += 1 : not_pub += 1;
            }
        });
        if (pub > 0) {
            $('#unpublish_toc').show();
        } else {
            $('#unpublish_toc').hide();
        }
        if (not_pub > 0) {
            $('#publish_toc').show();
        } else {
            $('#publish_toc').hide();
        }
    }

    function initialize_toc() {
        $('.translations').each(function () {
            var item = $(this);
            translations[item.data('name')] = item.data('value');
        });

        // section display/hide
        $('.toggle_class').each(function () {
            var dkey = stringEscape($(this).attr('id').replace('section_', ''));
            if (toc.data('section-display')) {
                $('#articles-section-' + dkey).show();
                $('#section_' + dkey).addClass('minus').show();
            } else {
                $('#articles-section-' + dkey).hide();
                $('#section_' + dkey).addClass('plus').show();
            }
        });
        if ($('.article_publication').length > 0) {
            initialize_publication();
        }
        return false;
    }

    initialize_toc();
});

function stringEscape(s) {
    return s ? s.replace(/\//g,'\\\/').replace(/\./g,'\\\.') : s;
}
