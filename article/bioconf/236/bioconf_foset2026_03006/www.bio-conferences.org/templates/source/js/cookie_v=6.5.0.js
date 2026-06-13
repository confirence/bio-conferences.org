/**
 * Cookie policy settings:
 * - Google analytics tracking
 * - Notification cookie
 */
jQuery(function($) {
  'use strict';
  if (window.cookie_initialised) {
    return;
  }
  window.cookie_initialised = true;
  var translations = {};
  var height, div, hide_and_sign, notify_cookie_usage, show_notification, ga, is_mobile, resize;
  $('.translations').each(function() {
    var item = $(this);
    translations[item.data('name')] = item.data('value');
  });
  ga = $('#google_analytics');
  is_mobile = translations.cookie_is_mobile;


  // Set cookie policy
  var google_analytics = document.cookie.replace(/(?:(?:^|.*;)\s*google_analytics\s*=\s*([^;]*).*$)|^.*$/, "$1");
  var set_cp = $('#set_cookie_policy');
  if (set_cp.length) {
    // Fill the checkbox if ga-disable cookie exists
    set_cp.prop('checked', google_analytics === 'true');

    /**
     * Remove/Put back Google analytics tracking
     */
    set_cp.click(function() {
      var checked = set_cp.is(':checked');
      var expire_date = new Date(checked ? Date.now() + 366 * 24 * 3600 * 1000 : Date.now() + 24 * 3600 * 1000);
      
      document.cookie = 'google_analytics=' + (checked ? 'true' : 'false') +
        '; expires=' + expire_date.toUTCString() + '; path=/;' + ga.data('domain');

      document.cookie = 'notify_cookie_usage=true; expires=' + expire_date.toUTCString() + '; path=/; domain=' + ga.data('domain');
    });
  }

  // -------------------------------
  // Notification cookie settings
  // -------------------------------
  notify_cookie_usage = document.cookie.replace(/(?:(?:^|.*;)\s*notify_cookie_usage\s*=\s*([^;]*).*$)|^.*$/, "$1");
  if (notify_cookie_usage !== 'true') {

    /**
     * Display notification bar
     */
    show_notification = function() {
      var button, acceptButton, refuseButton, supp, text;
      var cookie_text = translations.cookie_text;
      var cookie_accept_title = translations.cookie_accept_title;
      var cookie_refuse_title = translations.cookie_refuse_title;
      var cookie_accept_text = translations.cookie_accept_text;
      var cookie_refuse_text = translations.cookie_refuse_text;

      acceptButton = $('<a/>').attr('title', cookie_accept_title).attr('data-accept', true).html(cookie_accept_text).on('click', hide_and_sign);
      refuseButton = $('<a/>').attr('title', cookie_refuse_title).attr('data-accept', false).html(cookie_refuse_text).on('click', hide_and_sign);
      button = $('<div/>').addClass('close_notification').append(acceptButton).append(refuseButton)
      text = ($('<span/>')).html(cookie_text);
      div = ($('<div/>')).addClass('cookie_notification mobile').append(text).append(button);
      supp = $('<div/>');
      if (is_mobile) {
        div.addClass('mobile');
        div.appendTo('body');
      } else {
        div.prependTo('body').after(supp);
      }
      height = div.height();
      div.height(0);
      if (!is_mobile) {
        div = div.add(supp);
      }
      return div;
    };

    /**
     * Close notification and set cookie
     */
    hide_and_sign = function() {
      var accept = $(this).data('accept');
      google_analytics = accept ? 'true' : 'false';
      var expire_date = new Date(accept ? Date.now() + 366 * 24 * 3600 * 1000 : Date.now() + 24 * 3600 * 1000);
      
      document.cookie = 'google_analytics=' + (accept ? 'true' : 'false') +
        '; expires=' + expire_date.toUTCString() + '; path=/;' + ga.data('domain');

      document.cookie = 'notify_cookie_usage=true; expires=' + expire_date.toUTCString() + '; path=/; domain=' + ga.data('domain');

      update_consent();

      return div.animate({
        height: '0px'
      }, {
        duration: 'fast',
        complete: function() {
          if (is_mobile) {
            $(window).off('resize', resize);
          }
          return div.detach();
        }
      });
    };

    /**
     * Resize notification for mobile devices
     */
    resize = function() {
      var height = div.height();
      div.get(0).style.height = '';
      window.HEIGHT = div.height();
      div.height(height);
      div.animate({
        height: window.HEIGHT
      }, {
        duration: 'fast'
      });
      return false;
    };

    show_notification().animate({
      height: height
    }, {
      duration: 'fast',
      complete: function() {

          $(window).on('resize', resize);

      }
    });
  }

  function update_consent() {
    if (google_analytics === 'true') {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });    
    }
  }

  update_consent();


  /* Config event ga4 */

  /* call for parpers and pub */ 
  $(".banner_cfp, .banner_pub").on("click mousedown", function(e) {
    //detect middle click
    if (e.which == 2 && e.type === "mousedown") {
      $(document).one("mouseup", function (e2) {
        if (e.target == e2.target) {
          $(e.target).trigger("click");
        }
      });
    }

    if (e.type === "mousedown") {
      return;
    }
    
    try {
      var url = new URL($(this).attr('href'));
    } catch (error) {
      var url = new URL($(this).attr('href'), document.location.protocol + '//' + document.location.host);
    }
    

    var classes = $(this).attr("class");
    if ($(this).hasClass("banner_cfp")) {
      classes += " call_for_papers";
    }
    if ($(this).hasClass("banner_pub")) {
      classes += " banner_publicite";
    }

    gtag('event', 'click', {
      outbound: url.hostname !== document.location.hostname,
      link_classes: classes,
      link_id: $(this).attr('id'),
      link_url: url.href,
      link_domain: url.hostname,
      link_text: $(this).text()
    });
    
  });

  /* file_download fix (cf google doc) and add epub */ 
  $("a[href$='.epub'], a[href$='.pdf'], a[href$='.xls'], a[href$='.xlsx'], a[href$='.doc'], a[href$='.docx'], a[href$='.txt'], a[href$='.rtf'], a[href$='.csv'], a[href$='.exe'], a[href$='.key'], a[href$='.pps'], a[href$='.ppt'], a[href$='.pptx'], a[href$='.7z'], a[href$='.pkg'], a[href$='.rar'], a[href$='.zip'], a[href$='.avi'], a[href$='.mov'], a[href$='.mp4'], a[href$='.mpe'], a[href$='.mpeg'], a[href$='.wmv'],a[href$='.mid'], a[href$='.midi'], a[href$='.mp3'], a[href$='.wav'], a[href$='.wma']").on("click mousedown", function(e) {
    //detect middle click
    if (e.which == 2 && e.type === "mousedown") {
      $(document).one("mouseup", function (e2) {
        if (e.target == e2.target) {
          $(e.target).trigger("click");
        }
      });
    }

    if (e.type === "mousedown") {
      return;
    }
    
    try {
      var url = new URL($(this).attr('href'));
    } catch (error) {
      var url = new URL($(this).attr('href'), document.location.protocol + '//' + document.location.host);
    }
    
    gtag('event', 'file_download', {
      link_classes: $(this).attr("class"),
      link_id: $(this).attr('id'),
      link_url: url.href,
      link_domain: url.hostname,
      link_text: $(this).text(),
      file_extension: 'epub',
      file_name: url.pathname
    });
    
  });
});
