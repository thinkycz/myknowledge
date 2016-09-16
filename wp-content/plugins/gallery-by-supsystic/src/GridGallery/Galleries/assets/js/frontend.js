(function ($, undefined) {

    function Gallery(selector, autoInit) {

        autoInit = autoInit || false;

        this.$container  = $(selector);
        this.$elements   = this.$container.find('figure.grid-gallery-caption').fadeIn();
        this.initialMargin = this.$elements.first().css('margin-bottom');
        this.$navigation = this.$container.find('nav.grid-gallery-nav');

        this.selectedCategory="";

		this.$qsData = null;
        this.$qsDuration = '750';
        this.$qsEnable = false;
		this.areaPosition = this.$container.data('area-position');	// I think we wil need this in future

		this.pagination = {
            currentPage: 1,
            limit: 0,
            total: this.$elements.length,
            pages: 1,
            $wrapper: this.$container.find('.grid-gallery-pagination-wrap')
        };

        if (this.isFluidHeight()) {
            this.$elements.addClass('wookmarked');
        }

        $(document).trigger("GalleryExtend", this);

        if (autoInit) {
            this.init();
        }
    }

    Gallery.prototype.isFluidHeight = (function () {
        return this.$container.is('.grid-gallery-fluid-height');
    });

    Gallery.prototype.isImageOverlay = (function () {
        return this.$container.find('.crop').is('.image-overlay');
    });

    Gallery.prototype.isMouseShadowShow = (function () {
        return this.$container.find('.grid-gallery-caption').is('.shadow-show');
    });

    Gallery.prototype.initQuicksand = (function () {
        if(this.$container.data('quicksand') == 'enabled')  {
            this.$qsEnable = true;
            this.$qsDuration = this.$container.data('quicksand-duration');
            this.$qsHolder = this.$container.find('.grid-gallery-photos:first');
            this.$qsData = this.$container.find('.grid-gallery-photos > a');
        }
    });

    Gallery.prototype.showCaption = (function () {
        this.$container.find('.grid-gallery-figcaption-wrap').each(function() {
            if ($.trim($(this).html()) === '' && !$(this).find('img').length && $(this).has('.hi-icon').length === 0) {
                $(this).closest('figcaption').remove();
            }
        });
    });

    Gallery.prototype.initWookmark = (function () {
        var self = this,
            width = this.$container.data('width'),
            offset = 0,
            outerOffset = 0,
            spacing;

        if (this.$container.data('horizontal-scroll')) {
            return;
        }

        if (this.$container.data('offset')) {
            offset = this.$container.data('offset');
        }

        if (this.$container.data('padding')) {
            outerOffset = parseInt(this.$container.data('padding'));
        }

        if (String(width).indexOf('%') > -1) {
            var imagesPerRow = Math.floor(100 / parseInt(width));

            spacing = (offset * (imagesPerRow - 1)) + outerOffset * 2;
            width = (this.$container.width() - spacing) / 100 * parseInt(width);

            $.each(this.$container.find('img'), function() {
                aspectRatio = $(this).width() / $(this).height();
                $(this).width(width);
                $(this).height(width / aspectRatio);
            });
        }

       if (this.$container.data('columns-number')) {
            var columnsNumber = this.getResponsiveColumnsNumber();

            spacing = (offset * (columnsNumber - 1)) + outerOffset * 2;
            width = Math.floor((this.$container.width() - spacing) / 100 * Math.floor(100 / columnsNumber));

            this.$container.find('img').css({
                maxWidth: '100%',
                width: '100%',
                height: 'auto'
            });

            $.each(this.$elements, function(index, el) {
                var $el = $(el);
                elWidth = $el.width();
                elHeight = $el.height();
                aspectRatio = elWidth / elHeight;
                height = width / aspectRatio;
                $el.css({
                    width: width,
                    height: height,
                });
            });
        }

        if (this.$container.data('width') !== 'auto' && !this.$qsEnable) {
            this.wookmark = this.$elements.filter(':visible').wookmark({
                autoResize:     true,
                container:      this.$container.find('.grid-gallery-photos'),
                direction:      'left',
                fillEmptySpace: false,
                flexibleWidth:  true,
                itemWidth:      width,
                offset:         offset,
                align:          this.$container.data('area-position'),
                outerOffset:    outerOffset,
                onLayoutChanged: function() {
                    setTimeout(function() {
                        self.$container.trigger('wookmark.changed');
                    }, 50);
                },
                onResize: function() {
                    clearTimeout(self.$container.data('resize.timer'));
                    var overflow = self.$container.css('overflow');
                    self.$container.data('resize.timer', setTimeout(function() {
                        self.$container.removeData('resize.timer');
                        self.$container.css('overflow', 'hidden');
                        self.$elements.filter(':visible').trigger('refreshWookmark');
                        self.$container.css('overflow', overflow);
                    }, 150));
                }
            }).css({
    			'margin': '0',
                // 'transition': 'all 0.4s linear',
    		});
        }

        this.$container.find('.grid-gallery-photos').css('text-align', this.$container.data('area-position'));
        this.$container.filter(':visible').find('.grid-gallery-photos > *').filter(':visible').css({
            'float': 'none',
            'display': 'inline-block',
            'vertical-align': 'top'
        });
    });

    Gallery.prototype.initControll = (function (){
        $(document).on('click', "#cboxRight", function() {
            $.colorbox.prev();
        });
        $(document).on('click', "#cboxLeft", function() {
            $.colorbox.next();
        });
    });

    Gallery.prototype.initPopup = (function() {
        var popupType = this.$container.data('popup-type'),
            popupMaxHeight = '600',
            popupMaxWidth = '90%',
            sW = this.$container.data('popup-widthsize'),
            sH = this.$container.data('popup-heightsize'),
            popupOverlayTransper = this.$container.data('popup-transparency'),
            popupBackground = this.$container.data('popup-background'),
            slidePlay = this.$container.data('popup-slideshow') === true,
            slidePlayAuto = slidePlay && this.$container.data('popup-slideshow-auto') === true,
            popupHoverStop = slidePlay && this.$container.data('popup-hoverstop') === true,
            slideshowSpeed = this.$container.data('popup-slideshow-speed'),
            self = this;

        function generateOverlayColor(selector, background, opacity, optype) {
            var style = selector + '{'
                rgb = self.hex2rgb(background);
                opacity = (100 - opacity) / 100;

            if (background) {
                color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', '+ opacity + ')';
                style += 'background-image:none!important; background-color:' + color + '!important;';
            } else {
                if(optype){
                    style += 'opacity:' + opacity + '!important;';
                } else {
                    rgb = self.hex2rgb(self.rgb2hex($(selector).css('backgroundColor')));
                    color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', '+ opacity + ')';
                    style += 'background-image:none!important; background-color:' + color + '!important;';
                }
            }
            style += '}';
            $('<style type="text/css"> ' + style + '</style>').appendTo("head");
        }

        if(!!sW && sW !== 'auto'){
            popupMaxHeight = sH;
        }
        if(!!sH && sH !== 'auto'){
            popupMaxWidth = sW;
        }

        //Responsive popup if width or height > window.width
        popupMaxWidth = $(window).width() < popupMaxWidth ? '90%' : popupMaxWidth;
        popupMaxHeight = $(window).height() < popupMaxHeight ? '90%' : popupMaxHeight;

       if(popupType == 'colorbox') {
            var $this = this.$container;
            this.$container.find('.grid-gallery-photos > .gg-colorbox, .hi-icon.gg-colorbox').colorbox({
                fadeOut: this.$container.data('popup-fadeOut'),
                fixed:  true,
                maxHeight: popupMaxHeight,
                maxWidth: popupMaxWidth,
                scalePhotos: true,
                scrolling: false,
                returnFocus: false,
                slideshow: slidePlay && this.$container.data('popup-slideshow-speed'),
                slideshowAuto: slidePlayAuto,
                slideshowSpeed: slideshowSpeed,
                rel: this.$container.attr('id'),
                title: function() {
                    return $(this).find('img').attr('title');
                },
                speed: 350,
                transition: 'elastic',
                onComplete: function() {

                    $("#cboxLoadedContent").append("<div id='cboxRight'></div><div id='cboxLeft'></div>");
                },
                onOpen: function() {
                    //Enable/Disable stop slideshow on mouse hover
                    if(popupHoverStop){
                        var timeoutId = 0;
                        $('#cboxContent').hover(function(){
                            clearTimeout(timeoutId);
                            $('.cboxSlideshow_on #cboxSlideshow').click();
                        },function(){
                            clearTimeout(timeoutId);
                            timeoutId = setTimeout(function(){
                                $('.cboxSlideshow_off #cboxSlideshow').click();
                            },slideshowSpeed);
                        })
                    }
                }
            });
            this.$container.on('mouseenter', function(){
                $('#cboxOverlay').removeClass().addClass($this.data('popup-theme')+'-overlay');
                $('#colorbox').removeClass().addClass($this.data('popup-theme'));
            });

            generateOverlayColor('#cboxOverlay', popupBackground, popupOverlayTransper, true);
        }

        if(popupType == 'pretty-photo') {
            if(popupMaxWidth == '90%') popupMaxWidth = 'auto';
            if(!this.prettyPhotoInit) {
                $prettyPhoto = this.$container
                .find("a[rel^='prettyPhoto']")
                // .find(".grid-gallery-photos > a[rel^='prettyPhoto'], .grid-gallery-photos .hi-icon-wrap > a[rel^='prettyPhoto']")
                // .not('[data-video-source]')
                .prettyPhoto({
                    theme: 'light_square',
                    allow_resize: true,
                    deeplinking: false,
                    slideshow:  slidePlay && this.$container.data('popup-slideshow-speed'),
                    autoplay_slideshow: slidePlayAuto,
                    social_tools: '',
                    default_width: popupMaxWidth,
			        default_height: popupMaxHeight,
                    changepicturecallback: function(element){
                       
                        if(!slidePlay){
                            $('.pp_play').hide();
                        }

                        //Enable/Disable stop slideshow on mouse hover
                        if(popupHoverStop){
                            $('.pp_hoverContainer').hover(function(){
                                $('.pp_nav .pp_pause').click();
                            },function(){
                                $('.pp_nav .pp_play').click();
                            })
                        }
                    }
                });
                this.prettyPhotoInit = true;
            } else {
                $.prettyPhoto.refresh();
            }

            generateOverlayColor('.pp_overlay', popupBackground, popupOverlayTransper, true);
        }

        if(popupType == 'photobox') {
            this.$container.find('.grid-gallery-photos').photobox('a.pbox', {
                autoplay: slidePlayAuto
            });

            //Hide autoplay button when slideshow = false
            if(!this.$container.data('popup-slideshow')){
                $("#pbAutoplayBtn").hide();
            }

            //Enable/Disable stop slideshow on mouse hover
            if(popupHoverStop){
                $('.pbWrapper img').hover(function(){
                    $('#pbOverlay .playing').click();
                },function(){
                    $('#pbOverlay .play').click();
                })
            }
            
            generateOverlayColor('#pbOverlay', popupBackground, popupOverlayTransper);
        }
    });

    Gallery.prototype.preventImages = (function() {
        var popupType = this.$container.data('popup-type');

        if (popupType == 'disable') {
        	$('a.gg-link').addClass('disabled');
            $(document).on('click', 'a.gg-link', function(event) {
                if ($(this).data('type') !== 'link') {
                    event.preventDefault();
                }
            });
        }
    });

    Gallery.prototype.getResponsiveColumnsNumber = function() {
        columnsData = this.$container.data('responsive-colums');
        settings = [];
        columnsNumber = parseInt(this.$container.data('columns-number'));

        for (var key in columnsData) {
            settings.push(columnsData[key]);
        }

        settings.sort(function(a, b) {
            a.width = Number(a.width);
            b.width = Number(b.width);
            if (a.width > b.width) {
                return 1;
            } else if (a.width < b.width) {
                return -1;
            } else {
                return 0;
            }
        });

        for (var i = 0,
            len = settings.length,
            windowWidth = $(window).width(),
            minBreakpoint = 0; i < len; i++) {
            if (windowWidth > minBreakpoint && windowWidth <= settings[i].width) {
                columnsNumber = Number(settings[i].columns);
                break;
            }
            minBreakpoint = settings[i].width;
        };

        return columnsNumber;
    };

    Gallery.prototype.initRowsMode = function() {
        var columnsNumber = parseInt(this.$container.data('columns-number'));

        if (typeof this.$container.data('responsive-colums') == 'object') {
            columnsNumber = this.getResponsiveColumnsNumber();
        }

        if (columnsNumber) {
            var containerWidth = parseInt(this.$container.width()),
                spacing = parseInt(this.$container.data('offset')),
                scaleHeight = parseInt(this.$container.data('width')) / parseInt(this.$container.data('height')),
                elementWidth = null,
                elementHeight = null;

            //containerWidth -= columnsNumber * 2 * spacing;

            elementWidth = Math.floor((this.$container.width() - (columnsNumber - 1) * spacing) / columnsNumber);
            elementHeight = Math.floor(elementWidth / scaleHeight);

            this.$elements.each(function() {
                if (!$(this).find('.post-feed-crop').length) {
                    $(this).css('width', elementWidth);
                    $(this).css('height', elementHeight);
                } else {
                    $(this).find('figcaption').css('width', elementWidth);
                };
            });

            this.$elements.find('.crop').css({
                width: 'auto',
                height: 'auto'
            });
        }
    };

    Gallery.prototype.setImagesHeight = (function () {
        var $images = this.$container.find('img');

        if ($images != undefined && $images.length > 0) {
            $images.each(function () {
                var $image = $(this),
                    $wrapper = $image.parent();

                if ($image.height() < $wrapper.height()) {
                    $wrapper.css('height', $image.height());
                }
            });
        }
    });

    Gallery.prototype.setOverlayTransparency = (function () {
        this.$elements.find('figcaption, [class*="caption-with-icons"]').each(function () {
            var $caption = $(this),
                alpha    = (10 - parseInt($caption.data('alpha'), 10)) / 10,
                rgb      = $caption.css('background-color'),
                rgba     = rgb.replace(')', ', ' + alpha + ')').replace('rgb', 'rgba');


            $caption.css('background', rgba);
        });
    });

    Gallery.prototype.setIconsPosition = (function () {
        this.$elements.each(function () {
            var $element = $(this),
                $wrapper = $element.find('div.hi-icon-wrap'),
                $icons   = $element.find('a.hi-icon');

            $icons.each(function () {
                var $icon   = $(this),
                    marginY = ($element.height() / 2) - ($icon.height() / 2) - 10,
                    marginX = $wrapper.data('margin');

                $icon.css({
                    'margin-top':   Math.abs(marginY),
                    'margin-left':  marginX,
                    'margin-right': marginX
                });
            });
        });
    });

    Gallery.prototype.initCategories = (function () {
        var $defaultElement = this.$navigation.find('a[data-tag="__all__"]'),
            $elements = this.$navigation.find('a'),
            $defaultBackground = $elements.first().css('background-color');

        function shadeColor(color, percent) {
            var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
            return "#" + (0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
        }

        bg = shadeColor('#' + this.rgb2hex($elements.first().css('borderTopColor')), 0.3);

        this.$navigation.find('a').on('click', $.proxy(function (event) {
            event.preventDefault();

            var $category   = $(event.currentTarget),
                requested   = String($category.data('tag')),
                _defaultTag = '__all__',
                currentGallery = this.$navigation.parent().attr('id');

            $elements.css('background-color', $defaultBackground);
            $category.css('background-color', bg);

            if (requested == _defaultTag) {

                this.$elements.each(function () {
                    if ($(this).parent().attr('rel')) {
                        $(this).parent().attr('rel', 'prettyPhoto['+currentGallery+']');
                    }
                }).fadeIn();

                this.correctMargin();
                this.initWookmark();

                if (!this.isFluidHeight() && this.$qsEnable) {
                    this.callQuicksand(this.$qsHolder, this.$qsData, this.$qsDuration);
                }
                return false;
            }

            if (!this.isFluidHeight() && this.$qsEnable) {
                var $filteredData = this.$qsData.filter(function () {
                    var tags = $(this).children().data('tags');
                    if (typeof tags !== 'undefined') {
                        tags = tags.split('|');
                    }
                    return ($.inArray(requested, tags) > -1);
                });
                this.callQuicksand(this.$qsHolder, $filteredData, this.$qsDuration);
            } else {
                $hidden = $();
                $visible = $();
                this.$elements.each(function () {
                    var $element = $(this),
                        tags     = $element.data('tags');

                    if (typeof tags != 'string') {
                        tags = String(tags);
                    }

                    if (tags != undefined) {
                        tags = tags.split('|');
                    }
                    if ($.inArray(requested, tags) > -1) {
                        if ($element.parent().attr('rel')) {
                            $element.parent().attr('rel', 'prettyPhoto['+currentGallery+'-'+requested+']');
                        }
                        $visible.push(this);
                    } else {
                        $hidden.push(this);
                    }
                });

                $.when($hidden.fadeOut()).done($.proxy(function(){
                    $visible.fadeIn();
                    this.correctMargin();
                    this.initWookmark();
                }, this));
            }

        }, this));

        $elements.first().trigger('click');
    });

    Gallery.prototype.callQuicksand = function($holder, $filteredData, duration) {
        self = this;

        $filteredData.find('figure.grid-gallery-caption').css('margin', '0 ' + this.initialMargin + ' ' + this.initialMargin + ' 0').parent().css('clear', 'none');

        $holder.quicksand($filteredData, {
            duration: Number(duration),
            easing: 'swing',
            attribute: 'href',
        }, function() {
                $holder.css({
                    width: 'auto',
                    height: 'auto'
                }).append('<div class="grid-gallery-clearfix"></div>');
                self.initPopup();
                self.correctMargin();
            }
        );
    };

    Gallery.prototype.hidePopupCaptions = function() {
        if (this.$container.data('popup-captions') == 'hide') {
            $('<style type="text/css">#cboxTitle, #cboxCurrent, .pbCaptionText, .ppt, .pp_description { display:none!important; }</style>').appendTo("head");
        }
    };

    Gallery.prototype.hidePaginationControls = (function () {
        return false;
    });

    Gallery.prototype.setImageOverlay = (function() {
        if(this.isImageOverlay()) {
            this.$container.find('.grid-gallery-caption').each(function () {
                var image = $(this).find('img');
                var crop = $(this).find('.image-overlay');
                image.css('opacity', '0.2');
                crop.css('background-color', '#424242');
                $(this).on('mouseenter', function () {
                        image.css('opacity', '1.0');
                        crop.css('background-color', 'inherit');
                    }
                );
                $(this).on('mouseleave', function () {
                    image.css('opacity', '0.2');
                    crop.css('background-color', '#424242');
                });
            });
        }
    });

    Gallery.prototype.setMouseShadow = (function() {
        var shadow = null,
            $selector = null,
            $captions = this.$container.find('.grid-gallery-caption'),
            boxShadow = $captions.filter(':first').css('box-shadow'),
            showOver = function(event) {
                if (event.type === 'mouseenter') {
                    $(this).css('box-shadow', boxShadow);
                } else {
                    $(this).css('box-shadow', 'none');
                }
            },
            hideOver = function(event) {
                if (event.type === 'mouseenter') {
                    $(this).css('box-shadow', 'none');
                } else {
                    $(this).css('box-shadow', boxShadow);
                }
            };

        if ($captions.is('.shadow-show')) {
            $captions.css('box-shadow', 'none');
            $captions.on('hover', showOver);
        } else if ($captions.is('.shadow-hide')) {
            $captions.on('hover', hideOver);
        }
    });

    Gallery.prototype.initPagination = (function () {
        var perPage = parseInt(this.$container.find('.grid-gallery-photos').data('per-page'), 10),
            buffer  = [],
            page    = 1,
            offset  = 0
            self    = this;

        if (isNaN(perPage)) {
            this.$elements.fadeIn();
            return false;
        }

        var showCurrentPage = (function (gallery) {
            gallery.$elements.removeClass('current-page').hide(350);

            $.each(buffer[gallery.pagination.currentPage], function () {
                $(this).addClass('current-page').show(function () {
                    gallery.setIconsPosition();
                    self.correctMargin();
                });
            });
            /*
            if (!gallery.isFluidHeight()) {
                $('.current-page .crop').css('height', function () {
                    var height = null;
                    $('.crop img').each(function () {
                        if($(this).height() && !height) {
                            height = $(this).height();
                        }
                    });
                    return height;
                });
            }
            */
        });

        this.pagination.limit = perPage;

        this.$elements.each($.proxy(function (index, el) {
            var currentIndex = index + 1;

            if ((currentIndex - offset) <= this.pagination.limit) {
                if (!$.isArray(buffer[page])) {
                    buffer[page] = [];
                }

                buffer[page].push(el);
            } else {
                offset += this.pagination.limit;
                page   += 1;

                buffer[page] = [el];
            }
        }, this)).hide();

        this.pagination.pages = Math.ceil(this.pagination.total / this.pagination.limit);

        var element=this.pagination.$wrapper.find('a.grid-gallery-page[data-page="1"]');
        element.css('font-size','19pt');

        this.pagination.$wrapper.find('a.grid-gallery-page').on('click', $.proxy(function (e) {
            e.preventDefault();

            var element = $(e.currentTarget);
            var galery = Gallery.prototype;
            this.pagination.$wrapper.find('a.grid-gallery-page').each(function() {
                $(this).css('font-size','inherit');
            });
            galery.selectedCategory = element.data('page');
            element.css('font-size','19pt');

            var $anchor       = $(e.currentTarget),
                requestedPage = $anchor.data('page');

            this.pagination.currentPage = requestedPage;

            showCurrentPage(this);

            return false;
        }, this));

        showCurrentPage(this);
    });

    Gallery.prototype.hex=function(x) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    };

    Gallery.prototype.rgb2hex = function(rgb) {
        if(rgb) {
            rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(0\.\d+))?\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }
    };

    Gallery.prototype.hex2rgb = function(hex) {

        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    Gallery.prototype.loadFontFamily = (function () {
        font = this.$container.data('caption-font-family');
        if (font && font !== 'Default') {
            WebFont.load({
                google: {
                  families: [font + ':400,800']
                }
            });
        }
    });

    Gallery.prototype.initCaptionCalculations = (function () {
        var self = this;

        this.$container.find('.grid-gallery-caption').each(function () {
            wrap = $(this).find('div.grid-gallery-figcaption-wrap');
            figcaption = $(this).find('figcaption');

            wrap.css({
                'display': 'table-cell',
                'text-align': figcaption.css('text-align')
            });

            wrap.wrap($('<div>', {
                css: {
                    display:'table',
                    height:'100%',
                    width:'100%'
                }
            }));
        });
    });

    Gallery.prototype.checkDirection = function($element, e) {
        var w = $element.width(),
            h = $element.height(),
            x = ( e.pageX - $element.offset().left - ( w / 2 )) * ( w > h ? ( h / w ) : 1 ),
            y = ( e.pageY - $element.offset().top - ( h / 2 )) * ( h > w ? ( w / h ) : 1 );

        return Math.round(( ( ( Math.atan2(y, x) * (180 / Math.PI) ) + 180 ) / 90 ) + 3) % 4;
    };

    Gallery.prototype.initCaptionEffects = (function () {
        var self = this,
            isMobile = this.$container.data('caption-mobile');

        function generateOverlayColor(overlayColor, alpha) {
            if(typeof(overlayColor) == 'string'){
                overlayColor = overlayColor.split(')')[0].split('(');
                return overlayColor[0] + 'a(' + overlayColor[1] + ', ' + (1 - alpha/10) + ')';
            } else {
                return overlayColor;
            }
        };

        $.each(this.$elements, function(index, el) {
            var $el = $(el),
                overlayColor = $el.find('figcaption').css('backgroundColor'),
                alpha = parseInt($el.find('figcaption').data('alpha')),
                mobileCapt = (isMobile === true && device.mobile()) ? true : false; 

            //show caption for mobile device(used device.js lib #https://github.com/matthewhudson/device.js)
            if(mobileCapt){
                $el.attr('data-grid-gallery-type', 'none');
            }
            
            //fixed caption link in link
            if(!$el.find('.hi-icon-wrap').length
                && ($el.data('grid-gallery-type') != 'none' || mobileCapt)
            ){
                var fcaption = $el.find('figcaption');
                caption_text = $el.find('img').data('caption'),
                caption_span = fcaption.find('.grid-gallery-figcaption-wrap>span').first(),
                caption_place = fcaption.find('.grid-gallery-figcaption-wrap');
                if(caption_text !== undefined){
                    var text = caption_text.toString().replace(/<a(.*?)>(.*?)<\/a>/gi,"<object type='none'>$&</object>");
                    if(fcaption.find('a').length){
                        if(caption_span.attr('style') != 'undefined'){
                            caption_place.html('<span '+caption_span.attr('style')+'>'+text+'</span>');
                        } else {
                            caption_place.html(text);
                        }
                    }
                }
            }

            if ($el.data('grid-gallery-type') == 'cube') {
                $el.on('mouseenter mouseleave', function(e) {
                    var $figcaption = $(this).find('figcaption'),
                        direction = self.checkDirection($(this), e),
                        classHelper = null;

                    switch (direction) {
                        case 0:
                            classHelper = 'cube-' + (e.type == 'mouseenter' ? 'in' : 'out') + '-top';
                            break;
                        case 1:
                            classHelper = 'cube-' + (e.type == 'mouseenter' ? 'in' : 'out') + '-right';
                            break;
                        case 2:
                            classHelper = 'cube-' + (e.type == 'mouseenter' ? 'in' : 'out') + '-bottom';
                            break;
                        case 3:
                            classHelper = 'cube-' + (e.type == 'mouseenter' ? 'in' : 'out') + '-left';
                            break;
                    }

                    $figcaption.removeClass().addClass(classHelper);
                });
            }

            if ($el.data('grid-gallery-type') == 'polaroid') {
                if (!$(this).find('.post-feed-crop').length && !$el.hasClass('initialized')) {
                    $el.addClass('initialized');

                    var width = $el.width(),
                        frameWidth = parseInt(self.$container.data('polaroid-frame-width'), 10) || 20,
                        $img = $(this).find('img'),
                        $figcaption = $(this).find('figcaption'),
                        scaleRatio = $img.width() / $img.height(),
                        imageWidth = $img.width() - frameWidth * 2,
                        imageHeight = imageWidth / scaleRatio;

                    $img.css({
                        'width': imageWidth + 'px',
                        'height': imageHeight + 'px',
                        'margin': frameWidth + 'px auto 0',
                    });

                    $(this).find('.crop').css({
                        'height': imageHeight + frameWidth + 'px',
                    });
                    
                    $(this).css({
                        'background': overlayColor
                    })

                    $(this).css({
                        'width': $(this).width(),
                        'background': generateOverlayColor(overlayColor, alpha)
                    });

                    $figcaption.css({
                        'padding': frameWidth + 'px',
                        'background': 'none'
                    });

                    if ($figcaption.find('.grid-gallery-figcaption-wrap').text().length === 0) {
                        $figcaption
                            .find('.grid-gallery-figcaption-wrap')
                            .append('<span></span>');
                    }
                    

                    if (self.$container.data('polaroid-animation')) {
                        $el.addClass('polaroid-animation');
                    }

                    if (self.$container.data('polaroid-scattering')) {
                        $(this).css({
                            'transform': 'rotate(' + (-3 + Math.random() * (10 - 3)) + 'deg)'
                        });
                        $el.addClass('polaroid-scattering');
                    }
                }
            }

            if ($el.data('grid-gallery-type') == 'direction-aware') {
                var color = $el.find('figcaption').css('color'),
                    align = $el.find('figcaption').css('text-align');

                $el.attr('data-caption', '<div style="padding:20px;font-family:' +
                    self.$container.data('caption-font-family') + '">' +
                    $el.find('img').attr('data-caption') + '</div>');

                $el.sliphover({
                    target: $el,
                    backgroundColor: generateOverlayColor(overlayColor, alpha),
                    fontColor: color,
                    textAlign: align,
                    caption: 'data-caption'
                });
            }
        });

        $(document).on('click', '.sliphover-container', function(event) {
            event.preventDefault();
            $(this).data('relatedElement').closest('gggn ').get(0).click();
        });

        var popupType = this.$container.data('popup-type');

        var getPointerEvent = function(event) {
            return event.originalEvent.targetTouches ? event.originalEvent.targetTouches[0] : event;
        };

        var pointerX = 0,
            pointerY = 0,
            cachedPointerX = 0,
            cachedPointerY = 0;

        this.$container.find('.grid-gallery-caption').on('touchstart', function(event) {
            event.stopPropagation();
            $caption = $(this);
            var pointer = getPointerEvent(event);
            cachedPointerX = pointerX = pointer.pageX;
            cachedPointerY = pointerY = pointer.pageY;
        });

        this.$container.find('.grid-gallery-caption').on('touchend touchcancel',function(event) {
            if ((cachedPointerX === pointerX) && (cachedPointerY === pointerY)) {
                $caption = $(this);

                if ($caption.data('grid-gallery-type') == 'none') {
                    return;
                }

                $('.grid-gallery-caption').not($caption).removeClass('hovered');

                if (!$caption.hasClass('hovered')) {
                    event.preventDefault();
                    event.stopPropagation();
                    $caption.addClass('hovered');
                    $('body').one('touchstart', function(event) {
                        $caption.removeClass('hovered');
                    });
                    return false;
                }

                if (!popupType) {
                    var link = $caption.parent();
                    if (link.is('a')) {
                        if (!link.data('type') || link.data('type') !== 'link') {
                            event.preventDefault();
                        }
                    } else if (!$caption.find('a').hasClass('icon-link')) {
                        event.preventDefault();
                    }
                }
            }
        });

        this.$container.find('.grid-gallery-caption').on('touchmove',function(event) {
            $('.grid-gallery-caption').not($(this)).removeClass('hovered');
            var pointer = getPointerEvent(event);
            pointerX = pointer.pageX;
            pointerY = pointer.pageY;
        });
    });

	Gallery.prototype.correctMargin = (function () {
		if(!this.isFluidHeight() && !this.$container.data('horizontal-scroll')) {

            if (this.$qsEnable) {
                this.$elements = this.$container.find('figure.grid-gallery-caption');
            };

			var prevElement = null
			,	totalElements = this.$elements.filter(':visible').size()
            ,   rowWidth = 0
            ,   maxRowWidth = this.$container.width()
            ,   initialMargin = this.initialMargin;

            this.$elements.css('margin', '0 ' + this.initialMargin + ' ' + this.initialMargin + ' 0');
            this.$elements.parent().css('clear', 'none');

			this.$elements.filter(':visible').each(function(index){

                if (rowWidth + $(this).outerWidth() > maxRowWidth) {
                    $(prevElement).css('margin-right', 0);
                    $(this).css('margin-right', this.initialMargin);
                    $(this).parent().css('clear', 'left');
                    rowWidth = $(this).outerWidth() + parseInt(initialMargin);
                } else if (rowWidth + $(this).outerWidth() == maxRowWidth) {
                    $(this).css('margin-right', 0);
                    rowWidth = 0;
                } else {
                    rowWidth += $(this).outerWidth() + parseInt(initialMargin);
                }

				if(index == totalElements - 1) {
					$(this).css('margin-right', 0);
				}

				prevElement = this;

			});
		}
    });

    Gallery.prototype.hideTitleTooltip = (function () {
        if(this.$container.data('hide-tooltip') == true) {
            title = '';
            this.$container.find('a, img, div').on('mouseenter', function() {
                title = $(this).attr('title');
                $(this).attr({'title':''});
            }).mouseout(function() {
                $(this).attr({'title':title});
            });
        };
    });

    Gallery.prototype.correctFullscreen = (function () {
        var windowWidth = $(window).width();
        this.$elements.each(function() {
            var coef = parseInt(windowWidth / $(this).width())
                , resultWidth = windowWidth / coef;
            $(this).width(resultWidth);
        });
    });

    Gallery.prototype.initHorizontalMode = (function () {
        var horizontalScroll = this.$container.data('horizontal-scroll'),
            height = this.$container.data('height'),
            offset = this.$container.data('offset');

        if (!horizontalScroll) {
            return;
        }

        //Calculate max-height and margin
        if (!height) {
            var elementsHeight = this.$container.find('.grid-gallery-caption>a').map(function() {
                return $(this).height();
            }).get(),
            height = Math.max.apply(null, elementsHeight);
        } else {
            if(offset && offset > 0){
                height = height + offset*2;
            }
        }

        //Fixed IE9 scroll bug
        var isIE9OrBelow = function() {
           return /MSIE\s/.test(navigator.userAgent) && parseFloat(navigator.appVersion.split("MSIE")[1]) < 10;
        }
        if(isIE9OrBelow()){
            this.$container.find('.grid-gallery-photos > *').css('display','table-cell');
        } else {
            this.$container.find('.grid-gallery-photos > *').css('display','inline-block');
        }
        
        this.$container.find('.grid-gallery-photos > *').css({
            margin:0,
            padding:0,
            float: 'none',
            'vertical-align': 'middle',
            clear: 'right',
            'margin-right': '-5px',
            'border': 'none',
        });

        this.$container.find('.grid-gallery-photos .grid-gallery-caption').css({
            float: 'none',
        });

        // https://github.com/lanre-ade/jQuery-slimScroll
        height = height + 7; //This is scrollbar height;
        var slimScroll = this.$container.find('.grid-gallery-photos').slimScroll({
            height: height,
            railVisible: true,
            alwaysVisible: true,
            allowPageScroll: true,
            axis: 'x',
            animate: true,
            color: horizontalScroll.color || '#000',
            opacity: (100 - horizontalScroll.transparency) * 0.01,
        }); 

        // Load more height fix
        if (slimScroll.height() < height) {
            slimScroll.height(height);
            slimScroll.parent().height(height);
        }
    });

    Gallery.prototype.initHorizontalGalleryType = (function () {
        if (this.$container.data('height') && String(this.$container.data('height')).indexOf('%') > -1) {
            var height = this.$elements.first().height();
            this.$elements.find('img').css({
                'max-height': height,
                'min-height': height,
            });
        }
    });

    Gallery.prototype.hidePreloader = function() {
        var preloadEnab = this.$container.attr('data-preloader'),
            preloader = this.$container.find('.gallery-loading'),
            galleryPhotos = this.$container.find('.grid-gallery-photos');

        preloader.hide();
        if(preloadEnab !== '' && preloadEnab === 'true') {
            galleryPhotos.show().fadeTo("slow", 1);
        } else {
            galleryPhotos.show().fadeTo('fast', 1);
        }
    };

    Gallery.prototype.init = (function () {

        this.$container.imagesLoaded($.proxy(function () {
            var self = this;
            // this.setImagesHeight();
            $(document).trigger("GalleryBeforeInit", this);

            this.initRowsMode();
            this.initHorizontalGalleryType();
            this.initQuicksand();
            this.initHorizontalMode();

            this.setOverlayTransparency();
            this.initCaptionCalculations();
            this.initCaptionEffects();
            this.showCaption();
            this.hideTitleTooltip();
            this.initPagination();

            this.initPopup();

            this.setMouseShadow();
            this.setImageOverlay();
            
            this.loadFontFamily();
            this.hidePopupCaptions();
            this.preventImages();
            this.initWookmark();
            this.initCategories();
            this.setIconsPosition();

            this.correctMargin();
            this.initControll();

            if(this.$container.attr('data-fullscreen') == 'true') {
                this.correctFullscreen();
                $(window).resize(function() {
                    self.correctFullscreen();
                });
            }

            // iOS Safari fix
            setTimeout(function() {
                if (self.wookmark) {
                    self.wookmark.trigger('refreshWookmark');
                }
            }, 500);

            $(document).trigger("GalleryAfterInit", this);

        }, this));

		$(window).on('resize', $.proxy(function () {
			this.correctMargin();
		}, this));

        //Add init flag
        this.$container.addClass('initialized');
        this.hidePreloader();
    });

    window.initGridGallery = (function (el, autoInit) {
        var makeSelector = (function (el) {
            return '#' + el.id;
        });
        return new Gallery(makeSelector(el), autoInit);
    });

    window.contentLoaded = (function() {
        var $galleries = $(".grid-gallery:not('.initialized')");
        if ($galleries.length > 0) {
            $.each($galleries, (function () {
                new Gallery(this, true);
            }));
        }
        $('.crop').css('display', 'block');
    });

    $(document).ready(function () {
        contentLoaded();
    }).ajaxComplete(function() {
        contentLoaded();
    });

	//if a customer enter an e-mail for image link in gallery he'll get a mailto: link
	$('a.gg-link').each(function(){
		var gLink =  $(this).attr('href');
		var reg= /[0-9a-z_]+@[0-9a-z_]+\.[a-z]{2,5}/i;
		if (isEmail=gLink.match(reg)){
			$(this).attr('href','mailto:'+isEmail[0]);
		}
	});
	
}(jQuery));