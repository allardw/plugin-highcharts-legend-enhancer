(function (H) {
    H.wrap(H.Legend.prototype, 'renderItem', function (proceed, item) {
        var legend = this,
            options = legend.options,
            renderer = legend.chart.renderer,
            seriesTitle = item.options.seriesTitle;

        // 1. Initialise tracker
        if (legend.lastSeriesTitle === undefined) {
            legend.lastSeriesTitle = null;
        }

        // 2. If there's a new title, adjust the baseline BEFORE proceed is called
        var titleOffset = 30;
        if (seriesTitle && seriesTitle !== legend.lastSeriesTitle) {
            legend.baseline += titleOffset;
            legend.lastSeriesTitle = seriesTitle;
            item._isNewGroup = true;
        }

        // 3. Run standard Highcharts logic
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        // 4. Add the title to the item's legendGroup — but only if it doesn't exist yet
        if (item._isNewGroup) {

            // Check if a seriesTitle element was already added in a previous render
            var group = item.legendItem.group;
            var existingTitle = group.element.querySelector('.highcharts-series-title');

            if (!existingTitle) {
                var fontSize   = options.title && options.title.style ? options.title.style.fontSize   : '12px';
                var color      = options.title && options.title.style ? options.title.style.color      : '#333';
                var fontFamily = options.title && options.title.style ? options.title.style.fontFamily : 'Arial, sans-serif';
                var fontWeight = options.title && options.title.style ? options.title.style.fontWeight : 'normal';
                var whiteSpace = options.title && options.title.style ? options.title.style.whiteSpace : 'nowrap';

                renderer.text(
                    seriesTitle,
                    0,
                    legend.baseline - 30
                ).css({
                    fontSize:   fontSize,
                    color:      color,
                    fontFamily: fontFamily,
                    fontWeight: fontWeight,
                    whiteSpace: whiteSpace
                })
                .addClass('highcharts-series-title') // Mark it so we can detect it on redraw
                .add(group);
            }

            delete item._isNewGroup;
        }
    });

    //  Reset on recalculation so group detection works correctly on full redraws
    H.addEvent(H.Legend, 'afterGetAllItems', function () {
        this.lastSeriesTitle = null;
    });

})(typeof Highcharts !== 'undefined' ? Highcharts : window.Highcharts);