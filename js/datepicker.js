/* ========================================================================
 * Bootstrap: datepicker.js v1.0.0
 * ========================================================================
 * Requires moment.js for formatting and date checking
 *
 * Copyright 2013-2014 Josh Street
 * ======================================================================== */

+function ($, moment) {
    'use strict';
    
    if (typeof moment === 'undefined') {
        alert('moment.js is required')
        throw new Error('moment.js is required');
    }
    
    var _moment = moment;
    
    
    var GLOBAL = {
            weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            template:
                    '<div class="datepicker">' +
                        '<table class="datepicker-table">' +
                            '<col style="width: 14.285714285%;">' +
                            '<col style="width: 14.285714285%;">' +
                            '<col style="width: 14.285714285%;">' +
                            '<col style="width: 14.285714285%;">' +
                            '<col style="width: 14.285714285%;">' +
                            '<col style="width: 14.285714285%;">' +
                            '<col style="width: 14.285714285%;">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th colspan="7" class="month"></th>' +
                                '</tr>' +
                                '<tr>' +
                                    '<th class="prevyear">&lsaquo;&lsaquo;</th>' +
                                    '<th class="prevmonth">&lsaquo;</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="nextmonth">&rsaquo;</th>' +
                                    '<th class="nextyear">&rsaquo;&rsaquo;</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>'
            // Support functions
    }
    
    // DATEPICKER CLASS DEFINITION
    // ===========================
    
    var Datepicker = function(element, options) {
        this.$element = $(element);
        this.options = options;
        this.$picker = $(GLOBAL.template);
        
        this.shown = false;         // true if calendar is shown
        this.focused = false;           // true if the input element has focus
        this.mousedover = false;            // true if the mouse is over the calendar
        
        this.dateSelected = false;      // _moment object tracking the element value
        this.dateShown = _moment();     // _moment object the calendar is showing
        
        // Fill weekdays into picker
        this.fillWeekdays();
        
        // Bind to events
        this.bindEvents();
    };
    
    Datepicker.DEFAULTS = {
        displayFormat: 'YYYY-MM-DD',
        formats: ['YYYY-MM-DD', 'M-D-YY', 'DD-MM-YYYY', 'M-D', 'YY', 'YYYY', 'YY-M', 'YYYY-MM']
    };
    
    Datepicker.prototype.eventSupported = function (name) {
        var supported = name in this.$element;
        if (!supported) {
            this.$element.attr(name, 'return;');
            supported = typeof this.$element[name] === 'function';
        }
        return supported;
    };
    
    Datepicker.prototype.bindEvents = function () {
        // Assign proxied event handlers
        this.$element
                .on('focus', $.proxy(this.focus, this))
                .on('blur', $.proxy(this.blur, this))
                .on('keyup', $.proxy(this.keyup, this))
                .on('keypress', $.proxy(this.keypress, this))
        if (this.eventSupported('keydown'))
            this.$element.on('keydown', $.proxy(this.keydown, this));
        // Proxied event handles for the calendar
        this.$picker
                .on('click', $.proxy(this.click, this))
                .on('mouseenter', 'td, th', $.proxy(this.mouseenter, this))
                .on('mouseleave', 'td, th', $.proxy(this.mouseleave, this));
    };
    
    Datepicker.prototype.destroy = function () {
        this.$element.data('bs.datepicker', null)
        this.$element
                .off('focus')
                .off('blur')
                .off('keypress')
                .off('keyup')
        if (this.eventSupported('keydown'))
            this.$element.off('keydown')
        this.$picker.remove();
    };
    
    Datepicker.prototype.fillWeekdays = function () {
        var row = $('<tr>');
        $.each(GLOBAL.weekdays, function (index, value) {
            row.append('<th>' + value + '</th>');
        });
        this.$picker.find('thead').append(row);
        return this;
    };
    
    Datepicker.prototype.fill = function () {
        console.log(this.dateShown ? this.dateShown.format('YYYY-MM-DD') : 'None');
        var date = _moment(this.dateShown);
        var monthStart = _moment(date).startOf('month');
        var monthEnd = _moment(date).endOf('month');
        var current = this.dateSelected && this.dateSelected.valueOf();
        var d, stop;
        
        this.$picker.find('.month').text(date.format('MMMM YYYY'));
        
        // Get the starting date for the 42 days we show on the calendar
        date = _moment(date).subtract('months', 1).endOf('month');
        d = date.date();
        date.date(d - (date.day() + 7) % 7);
        // Get the date we stop short of reaching
        stop = _moment(date).date(date.date() + 42);
        
        // Detach the tbody and reattach after messing with it
        var $tbody = this.$picker.find('tbody').detach();
        var $tr, $td;
        // Empty the calendar
        $tbody.empty();
        // Fill calendar until stop is reached
        while (date.isBefore(stop, 'day')) {
            if (date.day() === 0)
                $tr = $('<tr>');
            $td = $('<td>')
                    .addClass('day')
                    .text(date.date())
                    .appendTo($tr)
            if (date.isBefore(monthStart, 'month'))
                $td.addClass('prev');
            if (date.isAfter(monthEnd, 'month'))
                $td.addClass('next');
            if (current && date.isSame(current, 'day'))
                $td.addClass('selected');
            if (date.day() === 6)
                $tr.appendTo($tbody);
            date.add('day', 1);
        }
        // Reattach
        this.$picker.find('table').append($tbody);
    };
    
    Datepicker.prototype.update = function (redrawOnly) {
        if (!redrawOnly) {
            // Checking dates to make sure what was entered is correct
            this.dateSelected = _moment(this.$element.val(), this.options.formats, true)
            this.dateShown = this.dateSelected.isValid() ? this.dateSelected : _moment();
        }
        this.fill();
        return this;
    };
    
    Datepicker.prototype.show = function () {
        if (this.shown)
            return;
        this.update();
        var pos = $.extend({}, this.$element.position(), {
                height: this.$element[0].offsetHeight
        });
        // Show it
        this.$picker
                .insertAfter(this.$element)
                .css({
                        top: pos.top + pos.height,
                        left: pos.left
                })
                .show();
        this.shown = true;
        return this;
    };
    
    Datepicker.prototype.hide = function () {
        this.$picker.hide();
        this.shown = false;
        this.mousedover = false;
        return this;
    };
    
    Datepicker.prototype.select = function () {
        var _this = this;
        var $active = this.$picker.find('.active');
        if (!$active.length) {
            // We are selecting but using the element value
            this.dateSelected = _moment(this.$element.val(), this.options.formats, true);
            if (!this.dateSelected.isValid())
                return this.clear();
            this.dateShown = _moment(this.dateSelected);
            // Replace the element's value with a correctly formatted one
            // and trigger it's change event
            this.$element
                    .val(this.dateSelected.format(this.options.displayFormat))
                    .trigger('change');
            return this.hide();
        }
        if ($active.is('.prev'))
            // Decrement month value of shown date
            this.dateShown.subtract('months', 1);
        if ($active.is('.next'))
            // Increment month value of shown date
            this.dateShown.add('month', 1);
        this.dateShown.date($active.text());
        this.dateSelected = _moment(this.dateShown);
        // Replace element's value with correctly formatted one
        // and trigger change event
        this.$element
                .val(this.dateSelected.format(this.options.displayFormat))
                .trigger('change');
        return this.hide();
    };
    
    Datepicker.prototype.clear = function () {
        this.dateShown = _moment();
        this.dateSelected = false;
        this.$element
                .val('')
                .trigger('change');
        return this.hide();
    };
    
    // EVENT HANDLERS
    // --------------
    
    Datepicker.prototype.focus = function (event) {
        this.focused = true;
        if (!this.shown)
            this.show();
    };
    
    Datepicker.prototype.blur = function (event) {
        this.focused = false;
        if (!this.mousedover)
            this.select();
    };
    
    Datepicker.prototype.keyup = function (event) {
        switch (event.which) {
            case 9:         // tab
            case 13:        // enter
                this.select();
                break;
            case 27:        // escape
                // escape clears
                this.clear();
                break;
            default:        // all other keys trigger update
                this.update();
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    };
    
    Datepicker.prototype.keypress = function (event) {
        if (this.suppressKeyPressEvent)
            return;
        this.handleKeyEvent(event);
    };
    
    Datepicker.prototype.keydown = function (event) {
        this.suppressKeyPressEvent = ~$.inArray(event.which, [9, 13, 27]);
        this.handleKeyEvent(event);
    }
    
    Datepicker.prototype.handleKeyEvent = function (event) {
        if (!this.shown)
            return;
        switch(event.keyCode) {
            case 9:         // tab
            case 13:        // enter
            case 27:        // escape
                event.preventDefault();
                break;
        }
        event.stopPropagation();
    };
    
    Datepicker.prototype.click = function (event) {
        event.stopPropagation();
        event.preventDefault();
        var $target = $(event.target).closest('td, th');
        if ($target.is('.day')) {
            this.select();
            return;
        }
        if ($target.is('.prevmonth')) {
            this.dateShown.subtract('months', 1);
            this.update(true);
        }
        if ($target.is('.nextmonth')) {
            this.dateShown.add('months', 1);
            this.update(true);
        }
        if ($target.is('.prevyear')) {
            this.dateShown.subtract('years', 1);
            this.update(true);
        }
        if ($target.is('.nextyear')) {
            this.dateShown.add('years', 1);
            this.update(true);
        }
        this.$element.trigger('focus');
    };
    
    Datepicker.prototype.mouseenter = function (event) {
        this.mousedover = true;
        this.$picker.find('.active').removeClass('active');
        if ($(event.currentTarget).is('.day'))
            $(event.currentTarget).addClass('active');
    };
    
    Datepicker.prototype.mouseleave = function (event) {
        this.mousedover = false;
        this.$picker.find('.active').removeClass('active');
    };
    
    // DATEPICKER PLUGIN DEFINITION
    // ============================
    
    var old = $.fn.datepicker
    
    $.fn.datepicker = function(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.datepicker')
            var options = $.extend({}, Datepicker.DEFAULTS, $this.data(), typeof option == 'object' && option);
            
            if (!data)
                $this.data('bs.datepicker', (data = new Datepicker(this, options)));
            if (typeof option == 'string')
                data[option]();
        });
    };
    
    $.fn.datepicker.Constructor = Datepicker;
    
    // DATEPICKER NO CONFLICT
    // ======================
    
    $.fn.datepicker.noConflict = function() {
        $.fn.datepicker = old;
        return this;
    };
    
    // DATEPICKER DATA-API
    // ===================
    
    $(document).on('focus.bs.datedicker.data-api', '[data-provide="datepicker"]', function() {
        var $this = $(this);
        if (!$this.data('bs.datepicker'))
            $this.datepicker($this.data());
        $this.datepicker('show');
    });
}(jQuery, moment);
