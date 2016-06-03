var Charts = function Charts(config){

    var chart = this;

    chart.defaults = {
        wrapperId: 'SVG_chart',
        legwrapperId: 'SVG_legend',
        containerId: 'container',
        setSVGWidth: 980,
        setSVGHeight: 500,
        minX: 0,
        minY: 0,
        maxX: 120,
        maxY: 140,
        fontColorXAxis: "green",
        fontColorYAxis: "violet",
        labelX: 'x description',
        labelY: 'y description',
        lineColor: "#8cc500",
        pointColorHover: 'black',
        unitsPerTickX: 10,
        unitsPerTickY: 10,
        padding: 10,
        legendBorder: 2,
        colorLabelSize: 20,
        labelHt: 30,
        tickSize: 3,
        axisColor: "#d0d0d0",
        pointRadius: 3,
        fontsize: "10pt",
        fontfamily: "titillium_regular",
        fontcolor: '#3a3a3a',
        fontHeight: 12,
        shadowColor : "#777",
        shadowBlur : 10,
        shadowX : 2,
        shadowY : 2,
        pieBorder : 1,
        stroke: "#999999",
        hoverColor : "#BDD2D8",
        gridColor : "#d0d0d0",
        minValue: 0,
        dataPoints: true
    };

    chart.KuznetSc = function(series, dataline){
        var newconfig = (config) ? mergeConfig(chart.defaults, config) : chart.defaults;
        return new KzSc(createSVG(newconfig, series, 'kuznet-scatter'), newconfig, { series : series, name : 'kuznet-scatter', dataline : dataline});
    }

    chart.Scatter = function(series){
        var newconfig = (config) ? mergeConfig(chart.defaults, config) : chart.defaults;
        return new KzSc(createSVG(newconfig, series, 'scatter'), newconfig, { series : series, name : 'scatter'});
    }

    chart.Spline = function(series, dataline){
        var newconfig = (config) ? mergeConfig(chart.defaults, config) : chart.defaults;
        return new KzSc(createSVG(newconfig, series, 'spline'), newconfig, { name : 'spline', series : series, dataline : dataline});
    }

    chart.Line = function(series, dataline){
        var newconfig = (config) ? mergeConfig(chart.defaults, config) : chart.defaults;
        return new KzSc(createSVG(newconfig, series, dataline, 'line'), newconfig, { name : 'line', series : series, dataline : dataline});
    }

    chart.Kuznet = function(series, dataline){
        var newconfig = (config) ? mergeConfig(chart.defaults, config) : chart.defaults;
        return new KzSc(createSVG(newconfig, series, 'kuznet'), newconfig, { series : series, name : 'kuznet', dataline : dataline});
    }

    chart.Pie = function(series,total){
        var newconfig = (config) ? mergeConfig(chart.defaults, config) : chart.defaults;
        return new Pie(createSVG(newconfig, series, total, 'pie'), newconfig, series);
    }

    chart.Bar = function(series,total){
        var newconfig = (config) ? mergeConfig(chart.defaults, config) : chart.defaults;
        return new Bar(createSVG(newconfig, series, total,'bar'), newconfig, series);
    }

    function mergeConfig(defaults, userDefined){
        var returnObj = {};
        for (var attrname in defaults) { returnObj[attrname] = defaults[attrname]; }
        for (var attrname in userDefined) { returnObj[attrname] = userDefined[attrname]; }
        return returnObj;
    }

    function createSVG(config, series, dataline, name){
        
        //create svg
        // var h1 = document.createElement("h1");

        // h1.innerHTML = "Total: " + total;
        // h1.style.fontfamily = "Calibri";
        // h1.style.fontsize = "60px";
        // var title = document.getElementById("title-heading");
        // title.appendChild(h1);
        var wrapper = document.getElementById(config.wrapperId);
        wrapper.style.position = "relative";
        var setWidth = wrapper.offsetWidth;
        var SVGpaper = Raphael(config.wrapperId,setWidth,config.setSVGHeight);

        //create legend
        var legendHeight = getLegendHeight(config,series);
        //var legendWidth = getLegendWidth(SVGpaper, config, series);
        var SVGlegend = Raphael(config.legwrapperId,config.setSVGWidth,legendHeight);
        
        var rangeX = config.maxX - config.minX;
        var rangeY = config.maxY - config.minY;
        var x = 50;
        var y = config.padding * 2;
        var width = (config.setSVGWidth - config.padding * 2 - 200);
        if(name != 'pie' && name != 'bar'){
            //drawLegend(config.setSVGWidth, getLegendWidth(SVGpaper, config, series), (config.setSVGHeight/2), SVGlegend, config, series, name);
            drawLegend(config.setSVGWidth, config.padding, SVGlegend, config, series, name, x);
        }
        if(name == 'bar')
            var height = (config.setSVGHeight) - (getLabelAreaHeight(SVGpaper, config, series) + config.padding * 3);
        else    
            var height = config.setSVGHeight - y - (config.padding * 3) - config.fontHeight;

        if(name != 'pie' && name != 'bar' && name != 'line'){
            drawXAxis(SVGpaper, config, x, y, width, height, Math.round(rangeX / config.unitsPerTickX));
        }

        if(name != 'pie' && name != 'bar'){
            drawYAxis(SVGpaper, config, x, y, height, Math.round(rangeY / config.unitsPerTickY));
        }

        if(name == 'line'){
             lineXAxis(SVGpaper, config, dataline, x, y, width, height, Math.round(rangeX / config.unitsPerTickX));
        }

        if(name != 'pie' && config.setSVGHeight && config.setSVGWidth >= 500){
            labelX(SVGpaper, config, width, height, x, y, name);
            labelY(SVGpaper, config, height, x);
        }

        return {
            SVGpaper : SVGpaper,
            SVGlegend : SVGlegend,
            x : x,
            y : y,
            width : width,
            height : height, 
            scaleX : width / rangeX,
            scaleY : height / rangeY,
            pieX : width / 2,
            pieY : height / 2,
            pieRadius : (Math.min(width, height) / 2) - (config.padding)
        };
    }

    function draw_tooltip(SVGpaper, object, show, text, x, y) {

        if(show == 0) {
            popup.remove();
            popup_txt.remove();
            transparent_txt.remove();
            return;
        }

        //draw text somewhere to get its dimensions and make it transparent
        transparent_txt = SVGpaper.text(100,100, text).attr({opacity: 0});
        
        //get text dimensions to obtain tooltip dimensions
        var txt_box = transparent_txt.getBBox();

        //draw text
        popup_txt = SVGpaper.text(x, y-txt_box.height-10, text).attr({fill: "white","font-size": "16px", "font-family": "Calibri", "font-style": "normal"});
        
        var bb = popup_txt.getBBox();
        
        //draw path for tooltip box
        
        popup = SVGpaper.path( 
                        // 'M'ove to the 'dent' in the bubble
                        "M" + (x) + " " + (y-10) +
                        // 'h'orizontally draw a line 5 more than the text's width
                        "h" + ((bb.width/2)+5) +
                        // 'v'ertically draw a line 10 pixels more than the height of the text
                        "v" + -(bb.height+10) +
                        "h" + -(bb.width+10) + 
                        // 'v'ertically draw a line to the bottom of the text
                        "v" + (bb.height+10) + 
                        "h" + (bb.width/2) +
                        // 'Z' closes the figure
                        "Z").attr({fill: "black", opacity: 0.75});

        //finally put the text in front
        popup_txt.toFront();

    }

    // function createPopup(config,object){

    //     var wrap = document.getElementById(config.wrapperId);
    //     var popupDiv = document.createElement("div");
    //     popupDiv.style.display = "block";
    //     popupDiv.style.position = "absolute";
    //     wrap.appendChild(popupDiv);
    // }

    function getLabelAreaHeight(SVGpaper, config, series){
       // SVGpaper.font = config.font;
        var maxNameWidth = 0;
        for (var n = 0; n < series.length; n++) {
            var label = series[n].label;
            for (var i = 0; i < label.length; i++) {
                var name = label[i];
                maxNameWidth = Math.max(maxNameWidth, name.length);
            }
        }

        return Math.round((maxNameWidth*12) / Math.sqrt(2));
    }

    function labelX(SVGpaper, config, width, height, x, y, name){

        var posx = x+width/2;
        if(name == 'bar')
            var posy = y + height + 20;
        else    
            var posy = y+height+32;
            
        var labX = SVGpaper.text(posx,posy,config.labelX).attr({"font-family": config.fontfamily, "font-size": config.fontsize, "font-style": "normal", fill: config.fontColorXAxis});  
    }


    function labelY(SVGpaper, config, height, x){

        var posx = x - 45,
            posy = height/2,
            rot = 270;
        var labY = SVGpaper.text(posx,posy,config.labelY).attr({"font-family": config.fontfamily, "font-size": config.fontsize, "font-style": "normal", fill: config.fontColorYAxis, transform: "r" + rot});  
    }


    function getLegendWidth(SVGpaper, config, series){

        var labelWidth = 0;
        for (var i = 0; i < series.length; i++) {
            var label = series[i].label || series[i].name;
            labelWidth = Math.max(labelWidth, label.length*5);
        }

        return (labelWidth + (config.padding * 2) + config.legendBorder + config.colorLabelSize + 80);
    }

    function getLegendHeight(config,series){
        var labelHt = config.labelHt;
        var totLabelHt = 0;
        for (var i = 0; i < series.length; i++) {
            totLabelHt+=labelHt;

        }
        return totLabelHt;
    }

    function drawLegend(width, legendY, SVGlegend, config, series, name, x){
        var legendX;
        var alabelY = legendY;
        var blabelY = legendY,
            dataPoints;

        for (var n = 0; n < series.length; n++){
            legendX = x;
            dataPoints = series[n].dataPoints;
            if(typeof dataPoints === 'undefined') dataPoints = true;
            if(dataPoints){
                // draw legend label
                var fillColor = series[n].color;
                var labelSize;
                if(config.setSVGHeight && config.setSVGWidth <= 500){
                    labelSize = 10;
                }
                else labelSize = config.colorLabelSize;
                SVGlegend.rect(legendX, alabelY, labelSize, labelSize, 2).attr({fill: fillColor, stroke: "black", "stroke-width": 0});
                SVGlegend.text(legendX + labelSize + config.padding, alabelY + labelSize / 2, series[n].label || series[n].name).attr({"font-style": "normal", 'text-anchor': 'start', "font-family" : config.fontfamily, "font-size": "14px", fill: config.fontcolor});
                alabelY += labelSize + config.padding;
            }
        }
    }

    function getLongestValueWidth(SVGpaper, config, numYTicks){


        var longestValueWidth = 0;
        for (var n = 0; n <= numYTicks; n++) {

            var value = config.maxY - (n * config.unitsPerTickY);
            longestValueWidth = Math.max(longestValueWidth, value/5);
           
        }
        return longestValueWidth;
        
    }

    function drawXAxis(SVGpaper, config, x, y, width, height, numXTicks){

        var x1 = x,
            y1 = y+height,
            x2 = x+width,
            y2 = y+height;

        var xAxis = SVGpaper.path("M" + x1 + "," + y1 + " L" + x2 + "," + y2).attr({stroke: config.axisColor, "stroke-width": 1});

        // draw tick marks
        for (var n = 0; n < numXTicks; n++) {

            var t1 = (n+1)*width/numXTicks+x,
                t2 = y+height-config.tickSize,
                y2 = y+height;
            var xTicks = SVGpaper.path("M" + t1 + "," + y2 + "L" + t1 + "," + t2).attr({stroke: config.axisColor, "stroke-width": 1});
        }
        
        // draw values
        for (var n = 0; n < numXTicks; n++) {

            var posx = (n + 1) * width / numXTicks + x,
                posy = y + height + config.padding,
                xText = Math.round((n + 1) * config.maxX / numXTicks);

            var xValues = SVGpaper.text(posx, posy, xText).attr({"font-family": config.fontfamily, "font-size": config.fontsize, fill: config.fontColorXAxis, "font-style": "normal"});
        }
    }

    function lineXAxis(SVGpaper, config, dataline, x, y, width, height, numXTicks){

        var x1 = x,
            y1 = y+height,
            x2 = x+width,
            y2 = y+height;
        var labX = [];
        var xAxis = SVGpaper.path("M" + x1 + "," + y1 + " L" + x2 + "," + y2).attr({stroke: config.axisColor, "stroke-width": 1});

        // draw tick marks
        for (var n = 0; n < numXTicks; n++) {

            var t1 = (n+1)*width/numXTicks+x,
                t2 = y+height-config.tickSize,
                y2 = y+height;
            var xTicks = SVGpaper.path("M" + t1 + "," + y2 + "L" + t1 + "," + t2).attr({stroke: config.axisColor, "stroke-width": 1});
        }
        for(var i=0; i<dataline.length;i++){
            var dataP = dataline[i].dataPoints;
            for(var j=0; j<dataP.length;j++){
                labX.push(dataP[j].label);
            }
        }
        // draw values
        for (var n = 0; n < numXTicks; n++) {
            var posx = (n + 1) * width / numXTicks + x,
                posy = y + height + config.padding,
                xText = labX[n];
            var xValues = SVGpaper.text(posx, posy, xText).attr({"font-family": config.fontfamily, "font-size": config.fontsize, fill: config.fontColorXAxis, "font-style": "normal"});
        }
    }

    function drawYAxis(SVGpaper, config, x, y, height, numYTicks){
        
        var x1 = x,
            y1 = y,
            y2 = y+height;
        var yAxis = SVGpaper.path("M" + x1 + "," + y1 + " L" + x1 + "," + y2).attr({stroke: config.axisColor, "stroke-width": 1});

        // draw tick marks

        for (var n = 0; n < numYTicks; n++) {

            var t1 = n*height/numYTicks+y,
                t2 = x+config.tickSize;
            var yTicks = SVGpaper.path("M" + x1 + "," + t1 + " L" + t2 + "," + t1).attr({stroke: config.axisColor, "stroke-width": 1});
        }
    
        // draw values
        
        for (var n = 0; n < numYTicks; n++) {

            var posx = x - config.padding,
                posy = n * height / numYTicks + y,
                yText = Math.round(config.maxY - n * config.maxY / numYTicks);

            var yValues = SVGpaper.text(posx, posy, yText).attr({"font-family": config.fontfamily, "font-size": config.fontsize, fill: config.fontColorYAxis, "font-style": "normal", 'text-anchor':'end'});
        }

    }

    function drawCurveSplines(SVGpaper, dataline, series, config, pts, scaleX, scaleY, x, y,height) {
        var lineColor;
        var s ='';

        for(var i=0; i<dataline.length;i++){

             lineColor = series[i].lineColor || config.lineColor;

            var x1 = pts[0],
                y1 = pts[1];
            
            s = "M" + x1 + "," + y1;

            for(var j=2;j<pts.length-1;j+=2){

                var x2 = pts[j] * scaleX,
                    y2 = pts[j+1] * scaleY;

                s += " L" + x2 + "," + y2;
            }
        }

        SVGpaper.path(s).attr({transform: "t" + x + "," + (y+height) + "s1,-1,0,0", stroke: lineColor, "stroke-width": 3, opacity: 0.75});
    }

    function drawCurveLine(SVGpaper, collection, config, dataline, series, name){

        var lineColor;
        var s = '';
        
        for(var i=0; i<dataline.length;i++){

            lineColor = series[i].lineColor || config.lineColor;

            if(name == 'line')

            var x1 = dataline[i].dataPoints[i].x * collection.scaleX,
                y1 = dataline[i].dataPoints[i].y * collection.scaleY;


            s += "M" + x1 + "," + y1;

            for (var j = 0; j < dataline[i].dataPoints.length; j++) {

                var x2 = dataline[i].dataPoints[j].x * collection.scaleX,
                    y2 = dataline[i].dataPoints[j].y * collection.scaleY;
                s += " L" + x2 + "," + y2;
            }

        }

         SVGpaper.path(s).attr({transform: "t" + collection.x + "," + (collection.y+collection.height) + "s1,-1,0,0", stroke: lineColor, "stroke-width": 3, opacity: 0.75});
    }

    function drawSpline(SVGpaper, collection, config, dataline, series, name){

        for(var i=0; i<dataline.length;i++){
       
            if(name == 'spline' || name == 'kuznet' || name == 'kuznet-scatter' )
                drawCurve(SVGpaper, dataline, series, config, dataline[i].dataPoints, 0.5, false, 16, collection.scaleX, collection.scaleY, collection.x, collection.y,collection.height);
        }
    }


    function drawCurve(SVGpaper, dataline, series, config, ptsa, tension, isClosed, numOfSegments, scaleX, scaleY, x, y, height) {

        drawCurveSplines(SVGpaper, dataline, series, config, getCurvePoints(ptsa, tension, isClosed, numOfSegments), scaleX, scaleY, x, y, height);
    }


    function getCurvePoints(ptsa, tension, isClosed, numOfSegments) {    

        tension         =   (tension != 'undefined') ? tension : 0.5;
        isClosed        =   isClosed        ? isClosed      : false;
        numOfSegments   =   numOfSegments   ? numOfSegments : 30;
        var pts = [],
            arr = ptsa;

        $.each(arr, function (i, val){
            pts.push(val.x);
            pts.push(val.y);
        });

        var _pts = [], res = [],    // clone array and result
            x, y,                   // our x,y coords
            t1x, t2x, t1y, t2y,     // tension vectors
            c1, c2, c3, c4,         // cardinal points
            st, st2, st3, st23, st32,   // steps
            l, t, i;                // steps based on num. of segments

        _pts = pts.concat();
     
        if (isClosed) {
            _pts.unshift(pts[pts.length - 1]);
            _pts.unshift(pts[pts.length - 2]);
            _pts.unshift(pts[pts.length - 1]);
            _pts.unshift(pts[pts.length - 2]);
            _pts.push(pts[0]);
            _pts.push(pts[1]);
        }
        else {
            _pts.unshift(pts[1]);           //copy 1. point and insert at beginning
            _pts.unshift(pts[0]);
            _pts.push(pts[pts.length - 2]); //copy last point and append
            _pts.push(pts[pts.length - 1]);
        }

        // Calculations:
        
        // 1. loop goes through point array
        // 2. loop goes through each segment between the two points
        l = (_pts.length - 4);
        for (i=2; i < l; i+=2){
            for (t=0; t <= numOfSegments; t++){

                // calc tension vectors
                t1x = (_pts[i+2] - _pts[i-2]) * tension;
                t2x = (_pts[i+4] - _pts[i]) * tension;
        
                t1y = (_pts[i+3] - _pts[i-1]) * tension;
                t2y = (_pts[i+5] - _pts[i+1]) * tension;

                // pre-calc step
                st = t / numOfSegments;
                st2 = st * st;
                st3 = st2 * st;
                st23 = st3 * 2;
                st32 = st2 * 3;

                // calc cardinals
                c1 = st23 - st32 + 1;
                c2 = -(st23) + st32;
                c3 = st3 - 2 * st2 + st;
                c4 = st3 - st2;
                
                // calc x and y cords with common control vectors
                x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
                y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;
            
                //store points in array
                res.push(x);
                res.push(y);
            }
        }
        return res;
    }


    function shapeVariant(config,shape,SVGpaper,x,y,pointRadius,color,maxX,height,tx1,ty1,display_text){

        switch(shape){
            case 'circle':
                SVGpaper.circle(x, y, pointRadius).attr({transform: "t" + tx1 + "," + (ty1+height) + "s1,-1," + maxX + ",0", stroke: color, fill: color})
                       .hover(function () {
                            document.body.style.cursor = 'pointer';
                            this.attr({stroke: "black"});
                            var wrapper = this.getBBox();
                            draw_tooltip(SVGpaper, this, 1, display_text, wrapper.x+60, wrapper.y+30);
                        },
                        function() {
                            document.body.style.cursor = 'default';
                            this.attr({stroke: color});
                            draw_tooltip(SVGpaper,this,0);
                        });
                break;
            
            case 'diamond':
                SVGpaper.rect(x,y,5,5).attr({transform: "t" + tx1 + "," + (ty1+height) + "s1,-1," + maxX + ",0" + "r45", stroke: color, "stroke-width": 2, fill: "white"})
                        .hover(function () {
                            document.body.style.cursor = 'pointer';
                            this.attr({stroke: "black"});
                            var wrapper = this.getBBox();
                            draw_tooltip(SVGpaper, this, 1, display_text, wrapper.x+60, wrapper.y+30);
                        },
                        function() {
                            document.body.style.cursor = 'default';
                            this.attr({stroke: color});
                            draw_tooltip(SVGpaper,this,0);
                        });
                break;

            case 'square':

                SVGpaper.rect(x,y,5,5).attr({transform: "t" + tx1 + "," + (ty1+height) + "s1,-1," + maxX + ",0", stroke: color, "stroke-width": 2, fill: "white"})
                        .hover(function () {
                            document.body.style.cursor = 'pointer';
                            this.attr({stroke: "black"});
                            var wrapper = this.getBBox();
                            draw_tooltip(SVGpaper, this, 1, display_text, wrapper.x+60, wrapper.y+30);
                        },
                        function() {
                            document.body.style.cursor = 'default';
                            this.attr({stroke: color});
                            draw_tooltip(SVGpaper,this,0);
                        });
                break; 
                
            default:
                SVGpaper.circle(x, y, pointRadius).attr({transform: "t" + tx1 + "," + (ty1+height) + "s1,-1," + maxX + ",0", stroke: color})
                        .hover(function () {
                            document.body.style.cursor = 'pointer';
                            this.attr({stroke: "black"});
                            var wrapper = this.getBBox();
                            draw_tooltip(SVGpaper, this, 1, display_text, wrapper.x+60, wrapper.y+30);
                        },
                        function() {
                            document.body.style.cursor = 'default';
                            this.attr({stroke: color});
                            draw_tooltip(SVGpaper,this,0);
                        });
                break;
        }
    }

    function drawscatter(SVGpaper, collection, config, seriesProp){

        for (var n = 0; n < seriesProp.data.length; n++){
         
            var i = n;
            var point = seriesProp.data[i];
            var display_text = seriesProp.name + "\nx: " + point[0] + ", y: " + point[1];
            // check for fill/stroke of different shapes
            //var status = fillStroke(seriesProp.shape);

            // draw segment
            shapeVariant(config,seriesProp.shape, SVGpaper, point[0] * collection.scaleX, point[1] * collection.scaleY, config.pointRadius, seriesProp.color, config.maxX, collection.height, collection.x, collection.y,display_text);
        }
    }

    function linescatter(SVGpaper, collection, config, seriesProp){

        var labelpt = [];

        for (var n = 0; n < seriesProp.label.length; n++){
            var i = n;
            labelpt[n] = seriesProp.label[i];
        }

        for (var n = 0; n < seriesProp.data.length; n++){
         
            var i = n;
            var point = seriesProp.data[i];
            var display_text = seriesProp.name + "\nx: " + labelpt[n] + ", y: " + point[1];
            // check for fill/stroke of different shapes
            //var status = fillStroke(seriesProp.shape);

            // draw segment
            shapeVariant(config,seriesProp.shape, SVGpaper, point[0] * collection.scaleX, point[1] * collection.scaleY, config.pointRadius, seriesProp.color, config.maxX, collection.height, collection.x, collection.y,display_text);
        }
    }

    function drawpopup(SVGpaper, collection, config, seriesProp){

        var labelpt = [];

        for (var n = 0; n < seriesProp.label.length; n++){
            var i = n;
            labelpt[n] = seriesProp.label[i];
        }

        for (var n = 0; n < seriesProp.data.length; n++){
         
            var i = n;
            var point = seriesProp.data[i];
            var display_text = labelpt[n] + "\nx: " + point[0] + ", y: " + point[1];
            // check for fill/stroke of different shapes
            //var status = fillStroke(seriesProp.shape);

            // draw segment
            shapeVariant(config,seriesProp.shape, SVGpaper, point[0] * collection.scaleX, point[1] * collection.scaleY, config.pointRadius, seriesProp.color, config.maxX, collection.height, collection.x, collection.y,display_text);
        }
    }

    function get_random_color() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    } 

    function drawSlices(SVGpaper, SVGlegend, collection, config, series){

        var startAngle = 0;
        var arc;
        var sectorAngleArr = [];
        var total = 0;
        var startAngle = 0;
        var endAngle = 0;
        var x1,x2,y1,y2 = 0;
        var randomcolor = new Array();

        var data = series;
        //CALCULATE THE TOTAL
        for (var k = 0; k < data.length; k++) {
            total += data[k].value;
        }
        //CALCULATE THE ANGLES THAT EACH SECTOR SWIPES AND STORE IN AN ARRAY
        for (var i = 0; i < data.length; i++) {
            var angle = Math.ceil(360 * data[i].value/ total);
            sectorAngleArr.push(angle);
        }


        for (var i = 0; i < sectorAngleArr.length; i++) {
            var a1, a2;
            var o1 = config.setSVGWidth/2;
            var o2 = config.setSVGHeight/2;
            startAngle = endAngle;
            endAngle = startAngle + sectorAngleArr[i];
            var color = get_random_color();
            var hoverColor = config.hoverColor;
            var display_text = data[i].label + "\nValue: " + data[i].value;
            
            if(config.setSVGWidth && config.setSVGHeight < 500){
                a1 = 70;
                a2 = 70;
            }
            else{ 
                a1 = 220;
                a2 = 220;
            }

            x1 = parseInt(o1 + a1 * Math.cos(Math.PI * startAngle / 180));
            y1 = parseInt(o2 + a2 * Math.sin(Math.PI * startAngle / 180));

            x2 = parseInt(o1 + a1 * Math.cos(Math.PI * endAngle / 180));
            y2 = parseInt(o2 + a2 * Math.sin(Math.PI * endAngle / 180));

            if(config.setSVGWidth && config.setSVGHeight < 500){
                modArcsMini(SVGpaper,endAngle,startAngle,x1,y1,x2,y2,color,hoverColor,display_text,o1,o2);
            }
            else modArcs(SVGpaper,endAngle,startAngle,x1,y1,x2,y2,color,hoverColor,display_text,o1,o2);
            randomcolor[i] = color;
        }
        //pieLegend(randomcolor, config.setSVGWidth - getLegendWidth(SVGpaper, config, data), config.padding, SVGpaper, config, data, name);
        pieLegend(randomcolor, config.setSVGWidth, config.padding, SVGlegend, config, series, name, collection.x);
    }

    function pieLegend(color, width, legendY, SVGlegend, config, series, name, x){
        var legendX;
        var alabelY = legendY;
        var blabelY = legendY,
            dataPoints;

        for (var n = 0; n < series.length; n++){
            legendX = x;
            dataPoints = series[n].dataPoints;
            if(typeof dataPoints === 'undefined') dataPoints = true;
            if(dataPoints){
                // draw legend label
                var fillColor = color[n];
                var labelSize;
                if(config.setSVGHeight && config.setSVGWidth <= 500){
                    labelSize = 10;
                }
                else labelSize = config.colorLabelSize;
                SVGlegend.rect(legendX, alabelY, labelSize, labelSize, 2).attr({fill: fillColor, stroke: "black", "stroke-width": 0});
                SVGlegend.text(legendX + labelSize + config.padding, alabelY + labelSize / 2, series[n].label || series[n].name).attr({"font-style": "normal", 'text-anchor': 'start', "font-family" : config.fontfamily, "font-size": "14px", fill: config.fontcolor});
                alabelY += labelSize + config.padding;
            }
        }
    }

    function modArcsMini(SVGpaper,endAngle,startAngle,x1,y1,x2,y2,color,hoverColor,display_text,o1,o2,a1,a2){

        var counter = 0;
        var d = "M" + o1 + "," + o2 + "L" + x1 + "," + y1 + " A70,70 0 " + ((endAngle - startAngle > 180) ? 1 : 0) + ",1 " + x2 + "," + y2 + " z"; //1 means clockwise //1 means clockwise
            arc = SVGpaper.path(d).attr({fill: color, stroke: "white"});
    }

    function modArcs(SVGpaper,endAngle,startAngle,x1,y1,x2,y2,color,hoverColor,display_text,o1,o2,a1,a2){

        var counter = 0;
        var d = "M" + o1 + "," + o2 + "L" + x1 + "," + y1 + " A220,220 0 " + ((endAngle - startAngle > 180) ? 1 : 0) + ",1 " + x2 + "," + y2 + " z"; //1 means clockwise //1 means clockwise
            arc = SVGpaper.path(d).attr({fill: color, stroke: "white"})
            .hover(function () {
                            document.body.style.cursor = 'pointer';
                            this.attr({fill: hoverColor});
                            var wrapper = this.getBBox();
                            draw_tooltip(SVGpaper, this, 1, display_text, wrapper.x+60, wrapper.y+30);
                        },
                        function() {
                            document.body.style.cursor = 'default';
                            this.attr({stroke: color, fill: color});
                            draw_tooltip(SVGpaper,this,0);
                        });
                // .hover(function (e) {
                //             document.body.style.cursor = 'pointer';
                //             this.attr({fill: hoverColor});
                //             if(counter >= 1){
                //                 draw_tooltip(SVGpaper, this, 0);
                //                 counter = 0;
                //             }
                //             x = e.pageX-350;
                //             y = e.pageY-600;
                //             draw_tooltip(SVGpaper, this, 1, display_text, x, y);
                //             counter++;
                //         },
                //         function() {
                //             document.body.style.cursor = 'default';
                //             this.attr({fill: color});
                //             draw_tooltip(SVGpaper, this, 0)
                //         });
    }              

    function drawGridlines(SVGpaper, collection, config, numGridLines){
        
        for (var n = 0; n < numGridLines; n++) {

            var x1 = collection.x,
                y1 = (n * collection.height / numGridLines) + collection.y,
                x2 = collection.x + collection.width;
            SVGpaper.path("M" + x1 + "," + y1 + "L" + x2 + "," + y1).attr({stroke: config.gridColor, "stroke-width": 2});
        }
    }

    function drawBarYAxis(SVGpaper, collection, config){

        SVGpaper.path("M" + collection.x + "," + collection.y + "L" + collection.x + "," + (collection.height + collection.y)).attr({stroke: config.axisColor, "stroke-width":2});
    }

    function drawBarXAxis(SVGpaper, collection, config){

        SVGpaper.path("M" + collection.x + "," + (collection.y + collection.height) + "L" + (collection.x + collection.width) + "," + (collection.height + collection.y)).attr({stroke: config.axisColor, "stroke-width":2});
    }

    function drawYValues(SVGpaper, collection, config, maxValue, numGridLines, gridLineIncrement){
       
        for (var n = 0; n <= numGridLines; n++) {
            var value = maxValue - (n * gridLineIncrement);
            var thisY = (n * collection.height / numGridLines) + collection.y;
            SVGpaper.text(collection.x - 5, thisY, value).attr({"font-family": config.fontfamily, "font-size": config.fontsize, fill: config.fontColorYAxis, 'text-anchor':'end'});
        }
    }

    function drawXValues(SVGpaper, collection, config, series){

        // for (var n = 0; n < series.length; n++){
        //     var label = series[n].label;
        //     for (var i = 0; i < label.length; i++){
        //         var name = label[i],
        //         t1 = collection.x + ((i + 1 / 2) * (collection.width / label.length)),
        //         t2 = collection.y + collection.height + 10,
        //         r = -45; // rotate 45 degrees

        //         SVGpaper.text(0,20,name).attr({"font-family": config.fontfamily, "font-size": config.fontsize, fill: config.fontColorXAxis, transform: "t" + t1 + "," + t2 + "r" + r});
        //     }
        // }
    }

    function drawBars(SVGpaper, collection, config, series, range){

        var heights = new Array(),
            randomcolor = new Array();
        for (var n = 0; n < series.length; n++) {
            var bar = series[n];
            var barWidth;
            var length = series.length;
            if(config.setSVGHeight && config.setSVGWidth <= 500){
                if(length <= 15){
                    barWidth = 10;
                }
                else barWidth = 5;
            }
            // if(length <= 15){
            //     barWidth = 30;
            // }
            else barWidth = 30;
            var barHeight = (series[n].value - config.minValue) * collection.height / range;
            var i = n;
            var color = get_random_color();
            var label = series[n].label;
            var value = series[n].value;
            var hoverColor = config.hoverColor;
            var display_text =  label + "\nValue: " + value;
            var x1 = (-barWidth / 2),
                y1 = 0,
                x2 = barWidth,
                y2 = barHeight;
            var t1 
            if(config.setSVGHeight && config.setSVGWidth <= 500 && length >= 15){
                t1 = Math.round(10+((i + 1 / 2) * collection.width / series.length));
            }
            else
                t1 = Math.round(collection.x + ((i + 1 / 2) * collection.width / series.length));
            var t2 = Math.round(collection.y + collection.height);
            if(config.setSVGWidth && config.setSVGHeight < 500){
                modBarsMini(SVGpaper,x1,y1,x2,y2,t1,t2,color,hoverColor, config);
            }
            else modBars(SVGpaper,x1,y1,x2,y2,t1,t2,color,hoverColor, display_text, config);
            randomcolor[i] = color;       
        }
        barLegend(randomcolor, collection.SVGlegend, config.setSVGWidth, (config.padding), SVGpaper, config, series, name, collection.x);
    }

    function barLegend(color, SVGlegend, width, legendY, SVGpaper, config, series, name, x){
        var legendX;
        var alabelY = legendY;
        var blabelY = legendY,
            dataPoints;
            //console.log(color)
        for (var n = 0; n < series.length; n++){
            legendX = x;
            dataPoints = series[n].dataPoints;
            if(typeof dataPoints === 'undefined') dataPoints = true;
            if(dataPoints){
                // draw legend label
                var fillColor = color[n];
                var labelSize;
                if(config.setSVGHeight && config.setSVGWidth < 500){
                    labelSize = 10;
                }
                else labelSize = config.colorLabelSize;
                SVGlegend.rect(legendX, alabelY, labelSize, labelSize, 2).attr({fill: fillColor, stroke: "black", "stroke-width": 0});
                SVGlegend.text(legendX + labelSize + config.padding, alabelY + labelSize / 2, series[n].label || series[n].name).attr({"font-style": "normal", 'text-anchor': 'start', "font-size": "14px", "font-family": config.fontfamily, fill: config.fontcolor});
                
                alabelY += labelSize + config.padding;
            }
        }
    }

    function modBarsMini(SVGpaper,x1,y1,x2,y2,t1,t2,color,hoverColor, config){
        SVGpaper.rect(x1,y1,x2,y2).attr({transform: "t" + t1 + "," + t2 + "s1,-1,0,0", fill: color, stroke: config.stroke, "stroke-width": 1});
    }

    function modBars(SVGpaper,x1,y1,x2,y2,t1,t2,color,hoverColor, display_text, config){
        SVGpaper.rect(x1,y1,x2,y2).attr({transform: "t" + t1 + "," + t2 + "s1,-1,0,0", fill: color, stroke: config.stroke, "stroke-width": 1})
                        .hover(function () {
                            document.body.style.cursor = 'pointer';
                            this.attr({stroke: hoverColor, fill: hoverColor});
                            var wrapper = this.getBBox();
                            var x,y;
                            if(wrapper.y < 100){
                                y = wrapper.y + 60;
                            }
                            else{
                                y = wrapper.y;
                            }
                            // if(wrapper.x > config.setSVGWidth - 300 && wrapper.x < config.setSVGWidth){
                            //     x = wrapper.x - 200;
                            // }
                            //else{
                                x = wrapper.x + 60;
                            //}
                            draw_tooltip(SVGpaper, this, 1, display_text, x, y);
                        },
                        function() {
                            document.body.style.cursor = 'default';
                            this.attr({stroke: color, fill: color});
                            draw_tooltip(SVGpaper,this,0);
                        });
                        // .hover(function (e) {
                        //     if(config.setSVGHeight && config.setSVGWidth >= 900){
                        //         document.body.style.cursor = 'pointer';
                        //         this.attr({fill: hoverColor});
                        //         var wrapper = this.getBBox();
                        //         var x1 = e.pageX;
                        //         var y1 = e.pageY;
                        //         if(x1 < 900){
                        //             x = e.pageX+200;
                        //         }
                        //         else{
                        //             x = wrapper.x + 500;
                        //         }
                                
                        //         y = wrapper.y;
                        //         draw_tooltip(SVGpaper, this, 1, display_text, x, y);
                        //         console.log(e.pageY)
                        //     }
                        // },
                        // function() {
                        //     if(config.setSVGHeight && config.setSVGWidth >= 900){
                        //         document.body.style.cursor = 'default';
                        //         this.attr({fill: color});
                        //         draw_tooltip(SVGpaper, this, 0)
                        //     }
                        // });
    }


    var Pie = function(collection, config, series){
        drawSlices(collection.SVGpaper, collection.SVGlegend, collection, config, series);
    }

    var Bar = function(collection, config, series){

        var maxValue = 0;
        for (var i = 0; i<series.length; i++) {
            var value = series[i].value;
            maxValue = Math.max(maxValue, value);
        }

        var gridLineIncrement = maxValue/10;
        maxValue = maxValue - Math.floor(maxValue % gridLineIncrement);

        var numGridLines = Math.round((maxValue - config.minValue) / gridLineIncrement);

        var range = maxValue - config.minValue;

        if(config.setSVGHeight && config.setSVGWidth >= 700){
            drawGridlines(collection.SVGpaper, collection, config, numGridLines);
            drawBarYAxis(collection.SVGpaper, collection, config);
            drawBarXAxis(collection.SVGpaper, collection, config, series);
            drawYValues(collection.SVGpaper, collection, config, maxValue, numGridLines, gridLineIncrement);
            drawXValues(collection.SVGpaper, collection, config, series);
        }
        drawBars(collection.SVGpaper, collection, config, series, range);
    }


    var KzSc = function(collection, config, data){

        if(data.name == 'line'){
            drawCurveLine(collection.SVGpaper, collection, config, data.dataline, data.series, data.name, collection.x, collection.y);
        }

        if(data.name == 'kuznet' || data.name == 'spline' || data.name == 'kuznet-scatter'){
            drawSpline(collection.SVGpaper, collection, config, data.dataline, data.series, data.name, collection.x, collection.y);
        }

        if(data.name == 'spline'){
            var pts = [],
                ptsa = [],
                dataPoints;
            
            for(var i=0; i<data.dataline.length;i++){

                var dataPoints = data.series[i].dataPoints;

                if(typeof dataPoints === 'undefined') dataPoints = true;
                if(dataPoints){
                    $.each(data.dataline[i].dataPoints, function (i, val){
                        pts.push(val.x);
                        pts.push(val.y);
                    });

                    while(pts.length){
                        ptsa.push(pts.splice(0,2));
                    }

                    drawscatter(collection.SVGpaper, collection, config, {
                        name : data.series[i].name,
                        color : data.series[i].color,
                        shape : data.series[i].shape,
                        data : ptsa
                    });

                    ptsa.length = 0;
                }
            }
        }

        if(data.name == 'line'){
            var pts = [],
                ptsa = [],
                dataPoints = [],
                label = [];

                for(var i=0; i<data.dataline.length;i++){
                
                var dataPoints = data.series[i].dataPoints;

                if(typeof dataPoints === 'undefined') dataPoints = true;

                    $.each(data.dataline[i].dataPoints, function (i, val){
                        console.log(this['x'])
                        pts.push(val.x);
                        pts.push(val.y);
                        label.push(val.label);
                    });
                    
                    while(pts.length){
                        ptsa.push(pts.splice(0,2));
                    }

                    linescatter(collection.SVGpaper, collection, config, {
                        label: label,
                        name : data.series[i].name,
                        color : data.series[i].color,
                        shape : data.series[i].shape,
                        data : ptsa
                    });

                    ptsa.length = 0;     
            }
        }

        if(data.name == 'kuznet'){
            var pts = [],
                ptsa = [],
                dataPoints = [],
                label = [];

                for(var i=0; i<data.dataline.length;i++){
                var dataPoints = data.series[i].dataPoints;
                if(typeof dataPoints === 'undefined') dataPoints = true;
                
                    $.each(data.dataline[i].dataPoints, function (i, val){
                        pts.push(val.x);
                        pts.push(val.y);
                        label.push(val.label);
                    });

                    while(pts.length){
                        ptsa.push(pts.splice(0,2));
                    }

                    drawpopup(collection.SVGpaper, collection, config, {
                        label: label,
                        color : data.series[i].color,
                        shape : data.series[i].shape,
                        data : ptsa
                    });

                    ptsa.length = 0;     
            }
        }

        if(data.name == 'kuznet-scatter' || data.name == 'scatter'){
            for(var i=0; i<data.series.length;i++){
                drawscatter(collection.SVGpaper, collection, config, {
                    name : data.series[i].name,
                    color : data.series[i].color,
                    shape : data.series[i].shape,
                    data : data.series[i].data
                });
            }
        }
    }
}