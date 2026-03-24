(function (H) {
    H.wrap(H.Legend.prototype, 'renderItem', function (proceed, item) {
        var legend = this,
            options = legend.options,
            renderer = legend.chart.renderer,
            seriesTitle = item.options.seriesTitle;
            seriesFooter = item.options.seriesFooter;

        // 1. Initialise tracker
        if (legend.lastSeriesTitle === undefined) {
            legend.lastSeriesTitle = null;
        }
        if (legend.lastSeriesFooter === undefined) {
            legend.lastSeriesFooter = null;
        }

        // 2. If there's a new title, adjust the baseline BEFORE proceed is called
        var titleOffset = 30;
        if (seriesTitle && seriesTitle !== legend.lastSeriesTitle) {
            legend.baseline += titleOffset;
            legend.lastSeriesTitle = seriesTitle;
            item._isNewTitleGroup = true;
        }
        var footerOffset = 30;
        if (seriesFooter && seriesFooter !== legend.lastSeriesFooter) {
            // legend.baseline += footerOffset; // Don't adjust baseline for footer, as it goes below the legend items
            legend.lastSeriesFooter = seriesFooter;
            item._isNewFooterGroup = true;
        }

        // 3. Run standard Highcharts logic
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        // 4. Add the title to the item's legendGroup — but only if it doesn't exist yet
        if (item._isNewTitleGroup) {

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
            


            delete item._isNewTitleGroup;
        }
        if (item._isNewFooterGroup) {

            // Check if a seriesTitle element was already added in a previous render
            var group = item.legendItem.group;
            var existingFooter = group.element.querySelector('.highcharts-series-footer');


            
            if (!existingFooter) {
                var fontSize   = options.title && options.title.style ? options.title.style.fontSize   : '12px';
                var color      = options.title && options.title.style ? options.title.style.color      : '#333';
                var fontFamily = options.title && options.title.style ? options.title.style.fontFamily : 'Arial, sans-serif';
                var fontWeight = options.title && options.title.style ? options.title.style.fontWeight : 'normal';
                var whiteSpace = options.title && options.title.style ? options.title.style.whiteSpace : 'nowrap';

                renderer.text(
                    seriesFooter,
                    0,
                    legend.baseline + 30
                ).css({
                    fontSize:   fontSize,
                    color:      color,
                    fontFamily: fontFamily,
                    fontWeight: fontWeight,
                    whiteSpace: whiteSpace
                })
                .addClass('highcharts-series-footer') // Mark it so we can detect it on redraw
                .add(group);
                legend.baseline += footerOffset;
            }

            delete item._isNewFooterGroup;
        }
    });

    //  Reset on recalculation so group detection works correctly on full redraws
    H.addEvent(H.Legend, 'afterGetAllItems', function () {
        this.lastSeriesTitle = null;
        this.lastSeriesFooter = null;
    });

})(typeof Highcharts !== 'undefined' ? Highcharts : window.Highcharts);