(function (H) {

    var VERSION = 'v0.1-alpha';
    var TITLE_OFFSET = 20;

    H.LegendEnhancer = H.LegendEnhancer || {};
    H.LegendEnhancer.version = VERSION;

    // ── Helpers ──────────────────────────────────────────────────────────────

    function initTracker(legend, key) {
        if (legend[key] === undefined) legend[key] = null;
    }

    function getLabelStyle(options) {
        var s = options.title && options.title.style;
        return {
            fontSize:   s && s.fontSize   || '12px',
            color:      s && s.color      || '#333',
            fontFamily: s && s.fontFamily || 'Arial, sans-serif',
            fontWeight: s && s.fontWeight || 'normal'
        };
    }

    function getContainerDiv(chart, className) {
        // Reuse or create a positioned wrapper div inside the chart container
        var existing = chart.container.querySelector('.' + className);
        if (existing) existing.parentNode.removeChild(existing);

        var div = document.createElement('div');
        div.className = className;
        div.style.cssText = [
            'position: absolute',
            'top: 0',
            'left: 0',
            'pointer-events: none',  // don't block chart interactions
            'box-sizing: border-box'
        ].join(';');

        // chart.container must be position:relative for absolute children
        // Highcharts sets this itself, so it's always safe to rely on
        chart.container.appendChild(div);
        return div;
    }

    // ── STEP 1: renderItem — bump baseline to create space, mark items ────────

    H.wrap(H.Legend.prototype, 'renderItem', function (proceed, item) {
        var legend      = this,
            seriesTitle = item.options.seriesTitle;

        initTracker(legend, 'lastSeriesTitle');

        var isNewTitle = seriesTitle && seriesTitle !== legend.lastSeriesTitle;
        

        if (isNewTitle) {
            legend.lastSeriesTitle = seriesTitle;
            item._seriesTitleText  = seriesTitle;
        }

        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        console.log('Rendered item: ' + item.name + ', title: ' + seriesTitle + ', isNewTitle: ' + isNewTitle);
        
        if (isNewTitle) {
            console.log('New title: ' + seriesTitle);
            doubleTitleOffset = legend.title && !legend.baseline ? 14 : 0
            legend.baseline  = (legend.baseline || 0) + TITLE_OFFSET + doubleTitleOffset;
            console.log('Baseline bumped to: ' + legend.baseline);
        }

    });

    // ── STEP 2: afterRender — write HTML using real rendered positions ─────────

    H.addEvent(H.Legend, 'afterRender', function () {
        var legend  = this,
            options = legend.options,
            chart   = legend.chart,
            style    = getLabelStyle(options),
            group   = legend.group;
            

        // The legend group's SVG translation = its pixel offset from chart top-left
        var legendLeft = group.translateX || 0;
        var legendTop  = group.translateY || 0;
        var padding    = legend.padding   || 0;

        // ── seriesTitle labels ────────────────────────────────────────────────

        var titlesWrapper = getContainerDiv(chart, 'highcharts-html-series-titles');

        (legend.allItems || []).forEach(function (item) {
            if (!item._seriesTitleText) return;

            var itemTop = item.legendItem.group.translateY || 0;
            var itemOffset = item.legendItem.label.y || 0;
            var yOffset = item.legendItem.label.yCorr;

            // Position the div at the top of the gap we created with TITLE_OFFSET
            var titleHeigt = legend.title && legend.title.height || 0
            var top  = legendTop + itemTop + itemOffset + titleHeigt - TITLE_OFFSET + yOffset;
            var left = legendLeft + padding;

            var el = document.createElement('div');
            el.className = 'highcharts-series-title';

            // Height matches the gap so text is vertically centred in it
            el.style.cssText = [
                'position: absolute',
                'top: '    + top  + 'px',
                'left: '   + left + 'px',
                'height: ' + TITLE_OFFSET + 'px',
                'line-height: 1.2em',
                'font-size: ' + style.fontSize + 'px',
                'font-family: ' + style.fontFamily,
                'color: ' + style.color,
                'white-space: nowrap'
            ].join(';');

            // el.textContent = item._seriesTitleText;
            el.innerHTML = item._seriesTitleText;
            titlesWrapper.appendChild(el);
        });

        // ── legendFooter ──────────────────────────────────────────────────────

        var legendFooter = options.legendFooter;
        if (!legendFooter || !legendFooter.text) return;

        var footerWrapper = getContainerDiv(chart, 'highcharts-html-legend-footer');

        // getBBox on the SVG group gives the true rendered height including
        // our custom HTML labels which are outside SVG — so use legendHeight
        // + titleHeight for the SVG-only bottom edge, then add a margin
        var svgBottom = legendTop
            + (legend.legendHeight || 0)
            + (legend.titleHeight  || 0)
            + (legend.baseline     || 0)
            + (legend.title ? -25 : 0)
            + (legendFooter.yOffset || 0)
            -35;

        var fs = legendFooter.style || {};

        var maxWidth = legend.legendWidth
            || (chart.chartWidth - legendLeft - padding);

        var el = document.createElement('div');
        el.className = 'highcharts-legend-footer';
        el.style.cssText = [
            'position: absolute',
            'top: '      + (svgBottom + 10) + 'px',
            'left: '     + (legendLeft + padding) + 'px',
            'width: '    + maxWidth + 'px',
            'font-size: ' + style.fontSize + 'px',
            'font-family: ' + style.fontFamily,
            'color: ' + style.color,
            'font-weight:' + (fs.fontWeight || 'normal'),
            'line-height: 1.2em',
        ].join(';');

        el.innerHTML = legendFooter.text;
        footerWrapper.appendChild(el);
    });

    // ── Reset trackers ────────────────────────────────────────────────────────

    H.addEvent(H.Legend, 'afterGetAllItems', function () {
        this.lastSeriesTitle = null;
        this.baseline = 0;
        (this.allItems || []).forEach(function (item) {
            delete item._seriesTitleText;
        });
    });

})(typeof Highcharts !== 'undefined' ? Highcharts : window.Highcharts);