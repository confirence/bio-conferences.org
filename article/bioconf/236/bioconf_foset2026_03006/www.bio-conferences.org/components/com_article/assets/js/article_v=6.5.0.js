jQuery(function($) {
  'use strict';
  if (window.article_initialised) {
    return;
  }
  window.article_initialised = true;
  var translations = {};
  $('.translations').each(function() {
    var item = $(this);
    translations[item.data('name')] = item.data('value');
  });


  var MAX_WIDTH = 600;
  var ARTICLE_CLICK_VIEW = translations.view_fullscreen || 'Click to view fullscreen';
  var ARTICLE_CLICK_HIDE = translations.hide_fullscreen || 'Click anywhere to hide the fullscreen overlay';
  var ARTICLE_CLICK_MOVIE = translations.play_movie || 'Click to play the movie';
  var fullsize = $('<div />').css({
    'position': 'fixed',
    'top': '0',
    'left': '0',
    'width': '100%',
    'height': '100%',
    'background-color': 'rgba(0, 0, 0, 0.8)',
    'display': 'none'
  }).addClass('fullsize').appendTo('body');
  var tip = $('<div class="fullsize-header" />').text(ARTICLE_CLICK_HIDE).css({
    'width': '100%',
    'height': '58px',
    'font-weight': 'bold',
    'color': 'white',
    'text-align': 'center',
    'position': 'relatif',
    'z-index': 1,
    'display': 'flex',
    'flex-wrap': 'wrap',
    'justify-content': 'center',
    'position': 'relative'
  }).appendTo(fullsize);
  var container = $('<div />').css({
    'margin': '50px',
    'overflow': 'auto',
    'text-align': 'center',
    'display': 'none'
  }).appendTo(fullsize);
  var standin = $('<div />');

  function setDimension($elt) {
    $elt.width('').height('');
    var display = $elt.css('display');
    $elt.css('display', 'inline-block');

    var width = $elt.width();
    if (($elt.hasClass('img_annex') || $elt.hasClass('img-plotly') || $elt.hasClass('img-movie') || $elt.hasClass('d-img') || $elt.hasClass('img')) && $elt.find('img').length && $elt.find('img').get(0).naturalWidth) {
      width = $elt.find('img').get(0).naturalWidth;
    }

    $elt.attr('data-natural_width', width + 1);
    if (parseInt($elt.attr('data-natural_width')) <= MAX_WIDTH) {
      $elt.attr('data-resized_width', width);
    } else {
      $elt.attr('data-resized_width', MAX_WIDTH);
    }
    
    $elt.width(parseInt($elt.attr('data-natural_width')) + 1); // +1 pour fixer des comportements étranges (notament quand l'image ne pe pas être chargée)
    $elt.attr('data-natural_height', $elt.height());

    if ($elt.hasClass('max-screen-size')) {
      var $heightScaleDiff = (window.innerHeight - 100) / $elt.attr('data-natural_height');
      var $widthScaleDiff = (window.innerWidth - 100) / $elt.attr('data-natural_width');

      if ($heightScaleDiff < $widthScaleDiff && $heightScaleDiff < 1) {
        $elt.attr('data-natural_width', $elt.attr('data-natural_width') * $heightScaleDiff);
        $elt.attr('data-natural_height', $elt.attr('data-natural_height') * $heightScaleDiff);
      } else if ($widthScaleDiff < 1) {
        $elt.attr('data-natural_width', $elt.attr('data-natural_width') * $widthScaleDiff);
        $elt.attr('data-natural_height', $elt.attr('data-natural_height') * $widthScaleDiff);
      }
    }

    $elt.width(parseInt($elt.attr('data-resized_width')) + 1); // +1 pour fixer des comportements étranges (notament quand l'image ne pe pas être chargée)
    $elt.attr('data-resized_height', $elt.height());
    
    $elt.width('');
    $elt.css('display', display);
  }

  function updatePosition(clone, duration = 200, finalize = null) {
    clone.animate({
      'left': (fullsize.width() - clone.attr('data-natural_width')) / 2 - 20,
      'top': window.innerHeight / 2 - clone.attr('data-natural_height') / 2 - 20,
      'width': parseInt(clone.attr('data-natural_width')),
      'height': parseInt(clone.attr('data-natural_height')),
      'padding': '20px'
    }, {
      'duration': duration,
      'complete': finalize ? finalize.bind(null, clone) : null
    });
  }

  function resize(clone, duration = 200) {
    var $elt = clone.find(clone.attr('data-elt-selected'));

    clone.attr('data-natural_width', $elt.attr('data-natural_width'));
    clone.attr('data-resized_width', $elt.attr('data-resized_width'));
    clone.attr('data-natural_height', $elt.attr('data-natural_height'));
    clone.attr('data-resized_height', $elt.attr('data-resized_height'));

    updatePosition(clone, duration);
  };

  function hideElt(sel, clone, current_offset, event) {
    if (!$(event.target).hasClass('fullsize')) {
      return;
    }

    if (clone.attr('data-elt-selected') != sel.attr('data-elt-selected')) {
      $('.fullsize-header').find('[data-target="' + sel.attr('data-elt-selected') + '"]').trigger('click', [0]);
    }

    event.preventDefault();
    container.hide();
    
    clone.css({
      'transform': 'scale(1)',
    });

    if (clone.data('resource') !== undefined) { 
      var resource = clone.data('resource');
      $(resource).hide();
      $(resource).remove();
      sel.after(resource);
      clone.data('display').show();
    }

    clone.animate({
      'width': clone.attr('data-resized_width'),
      'height': clone.attr('data-resized_height'),
      'left': current_offset.left - window.scrollX,
      'top': current_offset.top - window.scrollY - ($('.fullsize-header').hasClass('have-actions') ? 58 : 0),
      'padding': '0px'
    }, {
      'duration': 200,
      'complete': finalizeOut.bind(null, clone)
    });

    fullsize.animate({
      'background-color': 'rgba(0, 0, 0, 0)'
    },{
      'duration': 200,
    });

    $(document).off('keyup.hide_fullsize');
  };

  function esc_event(event) {
    if (event.keyCode == 27) hide(event);
  };

  function showElt(sel, event) {
    event.preventDefault();
    var current_offset = sel.offset();
    standin.width(sel.attr('data-resized_width')).height(sel.attr('data-resized_height'));
    var clone = sel.clone(true).attr('id', 'fullsize-element');
    clone.replaceWith(standin);
    clone.data('resource', sel.data('resource'));
    clone.data('display', clone.find(sel.data('display')));


    var fs_width = fullsize.width();
    var fs_height = fullsize.height();
    var max_width = fs_width - 100;
    var max_height = fs_height - 100;
    var attributes = {
      'position': 'relative',
      'width': sel.attr('data-resized_width'),
      'height': sel.attr('data-resized_height'),
      'left': current_offset.left - window.scrollX,
      'top': current_offset.top - window.scrollY - ($('.fullsize-header').hasClass('have-actions') ? 58 : 0),
      'background-color': '#fff',
      'padding': '0px',
      'font': sel.css('font')
    };

    clone.css(attributes).appendTo(fullsize);
    addActions(clone);
    updatePosition(clone, 200, finalizeIn);

    if (!fullsize.hasClass('full-init')) {
      fullsize.on('wheel', zoomOnScroll);
      fullsize.on('touchstart', zoomOnTouch);
      $(document).on('keyup.hide_fullsize', esc_event);
      fullsize.addClass('full-init');
    }
    
    fullsize.on('mousedown', hideElt.bind(this, sel, clone, current_offset));
    fullsize.css('background-color', 'rgba(0, 0, 0, 0)');
    fullsize.animate({
      'background-color': 'rgba(0, 0, 0, 0.8)'
    },{
      'duration': 200,
    });

    fullsize.show();
  };

  function processResource(sel) {
    var parent = sel.parent();

    sel.width('').height('');

    sel.find('.mathml, .img, .latex, .img-plotly, .img-movie').each(function () {
      setDimension($(this));
    });

    setDimension(sel);

    sel.width(sel.attr('data-resized_width')).height(sel.attr('data-resized_height'));

    if (!sel.hasClass('fullsize-init') && sel.parents('#fullsize-element').length === 0) {
      sel.addClass('fullsize-init cursor-zoom-in').on('click', showElt.bind(this, sel));
      parent.addClass('resizable');
    }
  };

  function finalizeIn(clone) {
    clone.on('display-update', function (e, duration) {
      resize(clone, duration);
    });

    if (clone.data('resource') !== undefined) { 
      clone.data('display').hide();
      var resource = clone.data('resource');
      $(resource).remove();
      $("#fullsize-element").append(resource);
      $(resource).show();
    } else {
      clone.on('mousedown touchstart', moveFullsizeElt);
    }
    
  };

  function finalizeOut(clone) {
    clone.css({
      'pointer-events': '',
      'width': standin.width(),
      'height': standin.height(),
      'left': '',
      'top': '',
      'padding': ''
    });
    standin.replaceWith($('#fullsize-element'));
    fullsize.hide();
    $(".fullsize-header").text(ARTICLE_CLICK_HIDE);
  };

  function initFullsize() {
    var sel = $(this);
    sel.find('img').on('load error', processResource.bind(this, sel));
    processResource(sel);
  }

  function moveFullsizeElt(e) {
    e.preventDefault();

    if (e.originalEvent.type === 'mousedown') {
      $('.fullsize').on('mousemove', function (e) {
        $('#fullsize-element').css('top', '+=' + e.originalEvent.movementY);
        $('#fullsize-element').css('left', '+=' + e.originalEvent.movementX);
      });

      $('.fullsize').one('mouseup', function (e) {
        $('.fullsize').off('mousemove');
      });
    } else if (e.originalEvent.type === 'touchstart' && e.originalEvent.touches.length === 1) {
      var x = e.originalEvent.touches[0].screenX;
      var y = e.originalEvent.touches[0].screenY;
      var left = $('#fullsize-element').css('left');
      var top = $('#fullsize-element').css('top');

      left = parseInt(left.replace('px', ''));
      top = parseInt(top.replace('px', ''));

      $('.fullsize').on('touchmove', function (e) {
        e.preventDefault();
        $('#fullsize-element').css('left', left + e.originalEvent.touches[0].screenX - x);
        $('#fullsize-element').css('top', top + e.originalEvent.touches[0].screenY - y);
      });

      $('.fullsize').one('touchend', function (e) {
        $('.fullsize').off('touchmove');
      });
    }
      
  }

  function getMinZoom() {
    return Math.min(
      Math.min($(window).width() * 0.9, parseInt($('#fullsize-element').attr('data-natural_width'))) / parseInt($('#fullsize-element').attr('data-natural_width')), 
      Math.min(($(window).height() - ($('.fullsize-header').hasClass('have-actions') ? 58 : 0)) * 0.9, parseInt($('#fullsize-element').attr('data-natural_height'))) / parseInt($('#fullsize-element').attr('data-natural_height'))
    );
  }

  function zoomOnTouch(e) {
    if(e.originalEvent.touches.length === 2) {
      e.preventDefault();
      var startX = e.originalEvent.touches[0].screenX - e.originalEvent.touches[1].screenX;
      var startY = e.originalEvent.touches[0].screenY - e.originalEvent.touches[1].screenY;

      var start = Math.sqrt(startX * startX + startY * startY);
      var scale = $("#zoom-slider").slider("value");
        
      fullsize.off('touchmove').on('touchmove', function (e) {
        e.preventDefault();
        var moveX = e.originalEvent.touches[0].screenX - e.originalEvent.touches[1].screenX;
        var moveY = e.originalEvent.touches[0].screenY - e.originalEvent.touches[1].screenY;

        var move = Math.sqrt(moveX * moveX + moveY * moveY);

        var deltaX = Math.abs(moveX - startX);
        var deltaY = Math.abs(moveY - startY);

        var weightX = deltaX / (deltaX + deltaY);
        var weightY = deltaY / (deltaX + deltaY);

        var screenAjustedX = $(window).width() * weightX;
        var screenAjustedY = $(window).height() * weightY;

        var delta = move - start;
        var screenAjusted = Math.sqrt(screenAjustedX * screenAjustedX + screenAjustedY * screenAjustedY);

        var deltaScale = scale * (delta / screenAjusted);

        zoomOnScroll(e, scale + deltaScale);
      });

      fullsize.one('touchend', function() {
        fullsize.off('touchmove');
      });
    } else if (!fullsize.hasClass('ontouch')) {
      fullsize.on('touchmove', zoomOnTouch);
      fullsize.one('touchend', function () {
        fullsize.off('touchmove');
      });
      fullsize.addClass('ontouch');
    }
  }

  function zoomOnScroll(e, scale = null) {
    e.preventDefault();
    if (scale) {
      scale = scale;
    } else if (e.originalEvent.deltaY < 0) {
      scale = $("#zoom-slider").slider("value") + ($("#zoom-slider").slider("option",  "step"));
    } else {
      scale = $("#zoom-slider").slider("value") - ($("#zoom-slider").slider("option",  "step"));
    }

    if (scale < $("#zoom-slider").slider("option",  "min")) {
      scale = $("#zoom-slider").slider("option",  "min");
    }

    if (scale > $("#zoom-slider").slider("option",  "max")) {
      scale = $("#zoom-slider").slider("option",  "max");
    }

    $("#zoom-slider").slider("value", scale);
    $("#fullsize-element").css('transform', 'scale('+scale+')');
  }

  function addActions($elt) {
    var a = '';

    if ($elt.hasClass('ressouce-equation-container')) {
      a = '<fieldset id="fullsize-actions-switch" class="widget" style="margin:0; display:inline;">\
            <legend>'+COM_ARTICLE_DISPLAY_EQUATION_AS+': </legend>';

      if ($elt.find('.mathml').length) {
        var selected = $elt.data('eltSelected') === '.mathml' ? 'checked' : '';
        a += '<label for="elt-mathml-display" class="origin-ui">MathML</label>\
              <input type="radio" data-target=".mathml" name="elt-equation-display" id="elt-mathml-display" '+ selected +'>';
      }

      if ($elt.find('.img').length) {
        var selected = $elt.data('eltSelected') === '.img' ? 'checked' : '';
        a += '<label for="elt-image-display" class="origin-ui">Image</label>\
              <input type="radio" data-target=".img" name="elt-equation-display" id="elt-image-display" '+ selected +'>';
      }

      if ($elt.find('.latex').length) {
        a += '<div class="controlgroup">\
                <label for="elt-latex-display" class="origin-ui" style="">LaTeX</label>\
                <input type="radio" data-target=".latex" name="elt-equation-display" id="elt-latex-display"/>\
                <button type="button" class="origin-ui" id="elt-latex-copy">Copy latex</button>\
              </div>';
      }

      a += '</fieldset>';

    }

    if (!$elt.hasClass('no-zoom')) {
      a += '<fieldset id="fullsize-actions-zoom" style="margin:0; display:flex; align-items: center;">\
          <legend>Zoom: </legend>\
          <div id="zoom-slider" class="origin-ui">\
            <div class="ui-slider-handle origin-ui"></div>\
          </div>\
        </fieldset>';
    }

    if (a) {
      var $actions = $(a);
      $actions.find('input[type="radio"]').checkboxradio({
        icon: false
      });

      $actions.find('#elt-latex-copy').button({
        icon: 'ui-icon-copy',
        showLabel: false,
      }).tooltip({
        content: COM_ARTICLE_COPY_IN_CLIPBOARD,
        show: false,
        close: function (e, ui) {
          $(e.target).tooltip("disable");
        }
      }).tooltip("disable");
      
      $actions.find( ".controlgroup" ).controlgroup();

      $actions.find('#zoom-slider').slider({
        min: getMinZoom($elt),
        max: 5,
        value: 1,
        step: 0.1,
        slide: function( event, ui ) {
          $('#fullsize-element').css('transform', 'scale(' + ui.value + ')');
        }
      })

      if ($elt.hasClass('d-mathml')) {
        $actions.find('#elt-mathml-display').trigger('click');
      } else {
        $actions.find('#elt-image-display').trigger('click');
      }

      $actions.find('#elt-mathml-display').on('click', function(e, duration = 200) {
        resetZoom();
        $elt.find(".mathml").show();
        $elt.find(".img").hide();
        $elt.find(".latex").hide();
        $elt.attr('data-elt-selected', '.mathml').addClass('d-mathml').removeClass('d-img d-latex').trigger('display-update', [duration]);
        resetZoom();
      });

      $actions.find('#elt-image-display').on('click', function(e, duration = 200) {
        resetZoom();
        if ($elt.find(".img img").get(0).complete === false) {
          $elt.find(".img img").one('load error', function (e) {
            processResource.bind(this, $elt.find(".img"))();
            $('#elt-image-display').trigger('click', [duration]);
          });
          var duration2 = 0;
        } else {
          var duration2 = duration;
        }
        $elt.find(".mathml").hide();
        $elt.find(".img").show();
        $elt.find(".latex").hide();
        $elt.attr('data-elt-selected', '.img').addClass('d-img').removeClass('d-mathml d-latex').trigger('display-update', [duration2]);
        resetZoom();
      });

      $actions.find('#elt-latex-display').on('click', function(e, duration = 200) {
        resetZoom();
        $elt.find(".mathml").hide();
        $elt.find(".img").hide();
        $elt.find(".latex").show();
        $elt.attr('data-elt-selected', '.latex').addClass('d-latex').removeClass('d-mathml d-img').trigger('display-update', [duration]);
        resetZoom();
      });

      $(".fullsize-header").addClass('have-actions').html($actions);

      if ($(".fullsize-header").find('#elt-latex-copy').length) {
        $(".fullsize-header").find('#elt-latex-copy').get(0).addEventListener('click', function (e) {
          if (navigator.clipboard) {
            navigator.clipboard.writeText($('#fullsize-element').find('.latex').data('latex')).then(function () {
              $('#elt-latex-copy').tooltip("enable").tooltip( "open" );

              window.setTimeout(function () {
                $('#elt-latex-copy').tooltip( "close" );
              }, 2000);
            });
          } else if (document.execCommand) {
            var $input = $('<input type="text" value="'+$('#fullsize-element').find('.latex').data('latex')+'"/>');
            $('body').append($input);
            $input.get(0).select();
            document.execCommand("copy");
            $('#elt-latex-copy').tooltip("enable").tooltip( "open" );
            $input.remove();

            window.setTimeout(function () {
              $('#elt-latex-copy').tooltip( "close" );
            }, 2000);
          }
        });
      } 
    } else {
      $(".fullsize-header").removeClass('have-actions').html('');
    }
    
  }

  function resetZoom() {
    $('#fullsize-element').css('transform', 'scale(1)');
    $('#zoom-slider').slider('value', 1 );
    $('#zoom-slider').slider('option', 'min', getMinZoom());
  }

  function resizePlotly() {
    var elt = this;
    
    /*$(elt).find('.main-svg').width();
    Plotly.relayout(elt,{format: 'png', width: $(elt).parents(':visible').width()}).then(function(celt) {
      $(celt).find('.main-svg').width();
    }).catch(function(err) {
      resizePlotly.call(elt);
    });*/

    
    var format = {format: 'png', width: $(elt).find('.main-svg').width(), height: $(elt).find('.main-svg').height()};
    Plotly.toImage(elt, format).then(function(dataUrl) {
      var img = new Image();
      img.src = dataUrl;
      var $img = $('<div class="img-plotly"></div>').append(img);
      var $imgAnnex = $('<div class="img_annex img_plotly no-zoom no-move"></div>').data('plotly', 'true').data('display', '.img-plotly').data('resource', elt).append($img);
      
      $(elt).parent().width('100%');
      $(elt).hide();
      $(elt).before($imgAnnex);

      initFullsize.call($imgAnnex.get(0));
    }).catch(function(err) {
      resizePlotly.call(elt);
    });
  }

  $('.c-plot, .plotly-graph-div').one('plotly_afterplot', resizePlotly);
  $('.js-plotly-plot').trigger('plotly_afterplot');

  /* full html deplace */
  $("#article #bloc").attr("id","blocTop").clone().appendTo("nav.article").attr("id","bloc");

  if (MATHML_DISPLAY === 'disabled' || !document.implementation.hasFeature('org.w3c.dom.mathml', '2.0' ) || !$(".ressouce-equation-container .mathml").length) {
    $(".ressouce-equation-container .mathml").remove();
    $(".ressouce-equation-container").attr('data-elt-selected', '.img').addClass('d-img');
  }
  
  if ($(".ressouce-equation-container .mathml").length) {
    if ($("#bloc.menu").length === 0) {
      $('body').append('<div id="bloc" class="menu" style="d-none"></div>');
    }
    $("#bloc.menu").prepend('<fieldset style="margin:0;"><legend>'+COM_ARTICLE_DISPLAY_EQUATION_AS+': </legend><label for="mathml-display" class="origin-ui">MathML</label><input type="radio" name="equation-display" class="mathml-display" id="mathml-display" value="mathml"><label for="image-display" class="origin-ui">Image</label><input type="radio" name="equation-display" class="image-display" id="image-display" value="image"></fieldset>');
    $("#blocTop.menu").prepend('<fieldset style="margin:0;"><legend>'+COM_ARTICLE_DISPLAY_EQUATION_AS+': </legend><label for="mathml-display-top" class="origin-ui">MathML</label><input type="radio" name="equation-display-top" class="mathml-display" id="mathml-display-top" value="mathml"><label for="image-display-top" class="origin-ui">Image</label><input type="radio" name="equation-display-top" class="image-display" id="image-display-top" value="image"></fieldset>');
    
    $(".mathml-display, .image-display").checkboxradio({
      icon: false
    });

    $("#mathml-display").on('click', function() {
      $(".ressouce-equation-container .mathml").show();
      $(".ressouce-equation-container .img").hide();
      $(".ressouce-equation-container").each(function () {
        $(this)
          .attr('data-elt-selected', '.mathml')
          .addClass('d-mathml')
          .removeClass('d-img')
          .width($(this).find(".mathml").attr('data-resized_width'))
          .height($(this).find(".mathml").attr('data-resized_height'))
          .attr('data-resized_width', $(this).find(".mathml").attr('data-resized_width'))
          .attr('data-resized_height', $(this).find(".mathml").attr('data-resized_height'))
          .attr('data-natural_width', $(this).find(".mathml").attr('data-natural_width'))
          .attr('data-natural_height', $(this).find(".mathml").attr('data-natural_height'));
      });

      $('#mathml-display-top').trigger('click', [false]);
      
      var expire_date = new Date(Date.now() + (60 * 60 * 24 * 366 * 1000));
      document.cookie = 'ressouce-equation-display=mathml' +
        '; expires=' + expire_date.toUTCString() + 
        '; path=/; domain=' + document.location.host;
    });

    $("#image-display").on('click', function() {
      $(".ressouce-equation-container .mathml").hide();
      $(".ressouce-equation-container .img").show();
      $(".ressouce-equation-container").each(function () {
        $(this)
          .attr('data-elt-selected', '.img')
          .addClass('d-img')
          .removeClass('d-mathml')
          .width($(this).find(".img").attr('data-resized_width'))
          .height($(this).find(".img").attr('data-resized_height'))
          .attr('data-resized_width', $(this).find(".img").attr('data-resized_width'))
          .attr('data-resized_height', $(this).find(".img").attr('data-resized_height'))
          .attr('data-natural_width', $(this).find(".img").attr('data-natural_width'))
          .attr('data-natural_height', $(this).find(".img").attr('data-natural_height'));
      });

      $('#image-display-top').trigger('click', [false]);
      
      var expire_date = new Date(Date.now() + (60 * 60 * 24 * 366 * 1000));
      document.cookie = 'ressouce-equation-display=image' +
        '; expires=' + expire_date.toUTCString() + 
        '; path=/; domain=' + document.location.host;
    });

    $('[for="mathml-display-top"]').on('click', function (e, triggerRessouceContainer = true) {
      if (triggerRessouceContainer) {
        $("#mathml-display").trigger('click');
      }
    });

    $('[for="image-display-top"]').on('click', function (e, triggerRessouceContainer = true) {
      if (triggerRessouceContainer) {
        $("#image-display").trigger('click');
      }
    });

    var display = document.cookie.replace(/(?:(?:^|.*;)\s*ressouce-equation-display\s*=\s*([^;]*).*$)|^.*$/, "$1");

    if (!display) {
      var display = MATHML_DISPLAY;
    }

    switch (display) {
      case 'image':
        $("#image-display").trigger('click');
        break;
      
      case 'mathml':
      default:
        $("#mathml-display").trigger('click');
        break;
    }
  }

  var addLatexPart = function ($elt) {
    if (!$elt.parent().data('latex')) {
      return;
    }
    var $latex = $('<span class="latex" data-latex="'+ $elt.parent().data('latex') +'" style="max-width: cal(100% - 20px)"><pre><code></code></pre></span>').hide();
    $latex.find('code').append(hljs.highlight(
      $elt.parent().data('latex'),
      { language: 'latex' }
    ).value);

    $elt.append($latex);
  }

  $(".ressouce-equation-container").each(function () {
    addLatexPart($(this));
  });

  // -------------------------------
  // Resizable
  // -------------------------------
  if (translations.hasOwnProperty('view_fullscreen')) {
    /**
     * Allow image resizing
     */

    $(".ressouce-equation-container, div#article .img_annex").each(initFullsize);

    $(window).on('resize', function () {
      $('#fullsize-element').trigger('display-update', [0]);
    });

    /**
     *  Document type video
     */
    $("div#article video").on('loadeddata', function () {
      var elt = this;

      var $imgElt = $('img', elt).clone();
      var $img = $('<div class="img-movie max-screen-size"></div>').append($imgElt);
      var $imgAnnex = $('<div class="img_annex img_movie no-zoom no-move max-screen-size"></div>').data('movie', 'true').data('display', '.img-movie').data('resource', elt).append($img);
      
      $(elt).parent().width('100%');
      $(elt).addClass('max-screen-size').attr('width', '').attr('height', '').attr('style','max-width: 100% !important; max-height: 100% !important').hide();
      $(elt).before($imgAnnex);

      initFullsize.call($imgAnnex.get(0));
    });
  }
 

  /**
   * Publicate article
   */
  $('.article_publication').click(function() {
    var dkey = $(this).attr('data-dkey');
    var state = $(this).attr('data-publication-state');
    $(this).before($('#wait-progress').show());
    $.ajax({
      url: translations.publication_url,
      'complete': function() {
        $('#wait-progress').hide();
      },
      'success': function(data) {
        $("span[data-publication-flag='" + dkey + "']").toggle();
        var sel = $("a[data-dkey='" + dkey + "']");
        if (state == 1) {
          sel.attr('data-publication-state', 0)
            .text(translations.publish_text)
            .addClass('article-published');
        } else {
          sel.attr('data-publication-state', 1)
            .text(translations.unpublish_text)
            .removeClass('article-published');
        }
      },
      dataType: 'json',
      type: 'post',
      data: {
        'dkey': dkey,
        'state': state
      }
    });
  });

  /**
   * OpenURL bloc
   */
  $('.open_url_help').click(function() {
    div = $('#help_bloc');
    if (div.style.display !== 'block') {
      div.style.display = 'block';
    } else {
      div.style.display = 'none';
    }
  });
});
