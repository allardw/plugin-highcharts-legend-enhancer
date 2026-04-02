# Highcharts Legend Enhancer Plugin

This plugin extends the default legend functionality of **Highcharts** with two key features:

1. **Grouped titles within the legend (series titles)**
2. **A footer below the legend**

The implementation uses HTML overlays on top of Highcharts’ SVG rendering, allowing for more flexible layout and styling.

## Features
### 1. Series Titles

With this plugin, you can group series in the legend by adding a title for each group.

- Add `seriesTitle` to your series configuration
- The plugin:
  - Detects when a new title is needed
  - Creates visual space in the legend
  - Renders an HTML label above the relevant series items

### 2. Legend Footer

You can add an additional text block below the legend via `legendFooter`.

- Add `legendFooter` to your legend configuration
- The plugin:
  - Detects when a text below the legend is needed
  - Renders an HTML text below the legend
  - An extra offset can be configured to create extra space between the legend and the text

## Installation

Include the plugin after Highcharts is loaded:

```html
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="path/to/highcharts-legend-enhancer.js"></script>
```

## Usage
### Series with `seriesTitle`

```
series: [{
    name: 'Series A1',
    data: [1, 2, 3],
    seriesTitle: 'Group A'
}, {
    name: 'Series A2',
    data: [3, 2, 1]
}, {
    name: 'Series B1',
    data: [5, 6, 7],
    seriesTitle: 'Group B'
}]
```
Result:

- "Group A" appears above the first two series
- "Group B" appears above the third series

### Legend with `legendFooter`
```
legend: {
    legendFooter: {
        text: 'This is a note below the legend',
        yOffset: 10,
        style: {
            fontWeight: 'bold'
        }
    }
}
```

## API
`series.seriesTitle`
| Property | Type | Description|
|--------|--------|--------|
| seriesTitle | string | Title displayed above a group of series|

`legend.legendFooter`
| Property | Type | Description|
|--------|--------|--------|
| text | string | Footer text |
| yOffset | number | Vertical offset (optional) |
| style | object | CSS styling (e.g., `fontWeight`) |

## How it Works (Technical)
### Step 1 – renderItem hook
- Detects new seriesTitle
- Adjusts legend.baseline to make space
- Marks items with _seriesTitleText

###  Step 2 – afterRender event
- Reads exact positions of legend items (SVG)
- Renders HTML <div> elements at those positions
- Adds titles and footer

###  Step 3 – Reset
- afterGetAllItems resets internal state
- Prevents duplication on redraws

## CSS Classes
The plugin adds the following classes:
```
.highcharts-html-series-titles
.highcharts-series-title
.highcharts-html-legend-footer
.highcharts-legend-footer
```
You can use these for additional styling.

## Known issues
- seriesTitles are not plotted on the right spot when legend.useHTML = false
- seriesTitles do not wrap if text is long