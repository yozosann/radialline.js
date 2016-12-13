function RayMap(svg, configObj, isRelative) {
    svg.setAttribute("height", '100%');
    svg.setAttribute("width", '100%');
    svg.setAttribute("style", 'position:absolute;left:0;top:0;');
    var HEIGHT = svg.clientHeight;
    var WIDTH = svg.clientWidth;


    // Tool function
    var EventUtil = {
        //添加事件处理函数
        addHandler: function (element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            }
            else if (element.attachEvent) {
                element.attachEvent("on" + type, handler);
            }
            else {
                element["on" + type] = handler;
            }
        }
    };
    function createSvgElement(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function getSpeed(beginPoint, endPoint, time) {
        return {
            X: (endPoint.x - beginPoint.x) / time,
            Y: (endPoint.y - beginPoint.y) / time
        };
    }
    function changeAllColor(arr, opacity) {
        for (var i = 1; i < arr.length; i++) {
            arr[i].changeOpacity(opacity);
        }
    }
    function createPointStr(pointArr) {
        var strArr = [];
        for (var i = 0; i < pointArr.length; i++) {
            strArr.push(pointArr[i].x + ',' + pointArr[i].y);
        }
        return strArr.join(' ');
    }
    function changeAllxy(obj) {
        for (var i in obj) {
            if (typeof (obj[i]) == 'object') {
                changeAllxy(obj[i]);
            }
            else {
                if (i == 'x') {
                    obj[i] = obj[i] * WIDTH;
                }
                else if (i == 'y') {
                    obj[i] = obj[i] * HEIGHT;
                }
            }
        }
    }
    function recoverAllxy(obj) {
        for (var i in obj) {
            if (typeof (obj[i]) == 'object') {
                recoverAllxy(obj[i]);
            }
            else {
                if (i == 'x') {
                    obj[i] = obj[i] / WIDTH;
                }
                else if (i == 'y') {
                    obj[i] = obj[i] / HEIGHT;
                }
            }
        }
    }
    function getOtherPointsPos(obj) {

    }
    Array.prototype.clone = function () {
        return this.slice(0);
    }

    // cross-browser requestAnimFrame
    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    // cross-browser requestAnimFrame
    window.cancelAnimationFrame = (function () {
        return window.cancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.webkitCancelAnimationFrame || function (requestID) {
                window.clearTimeout(requestID);
            };
    })();

    // Point class
    function Point(x, y, r, color, isLink) {
        this.r = r;
        this.color = color;
        this.isLink = isLink;
        this.x = x;
        this.y = y;
    }

    Point.prototype.draw = function () {
        this.circle = createSvgElement('circle');
        this.circle.setAttribute("cx", this.x);
        this.circle.setAttribute("cy", this.y);
        this.circle.setAttribute("r", this.r);
        this.circle.style.fill = this.color;

        svg.appendChild(this.circle);
    }

    Point.prototype.changeOpacity = function (opacity) {
        this.circle.style.fill = this.color.slice(0, 17) + opacity + ')';
    }

    //for diffuse animation (Wave class)
    Point.prototype.gradual = function (x, y, width, step) {
        this.circle.setAttribute('cx', x);
        this.circle.setAttribute('cy', y);

        var progress = 0;
        var temp = {
            opacity: 0,
            r: 0
        }

        var speed = {
            spOp1: 1 / (step * 0.05),
            spOp2: -1 / (step * 0.95),
            spR: width / step
        };

        var drawRun = function () {
            progress++;
            this.circle.setAttribute("r", temp.r);
            this.circle.setAttribute("opacity", temp.opacity);
            temp.r += speed.spR;
            temp.opacity += (progress <= step * 0.05 ? speed.spOp1 : speed.spOp2);

            if (progress <= step) {
                this.requestID = requestAnimationFrame(drawRun);
            }
            else if (progress >= step) {
                progress = 0;
                temp = {
                    opacity: 0,
                    r: 0
                }
                this.requestID = requestAnimationFrame(drawRun);
            }
            else {
                this.circle.setAttribute("r", 0);
                this.circle.setAttribute("opacity", 0);
            }
        }.bind(this);
        return drawRun;
    }

    // Wave class
    function Wave() {
        this.wave1 = new Point(0, 0, 0, 'rgba(255,255,255,0.4)');
        this.wave2 = new Point(0, 0, 0, 'rgba(255,255,255,0.4)');
        this.wave1.draw();
        this.wave2.draw();
    }
    //Create a ripple effect
    Wave.prototype.gradual = function (x, y, width, step) {
        (this.wave1).gradual(x, y, width, step)();
        (this.wave2).gradual(x, y, width / 2, step)();
    }
    //Clear this effect
    Wave.prototype.clear = function () {
        cancelAnimationFrame(this.wave1.requestID);
        cancelAnimationFrame(this.wave2.requestID);
        this.wave1.circle.setAttribute('cx', 0);
        this.wave1.circle.setAttribute('cy', 0);
        this.wave1.circle.setAttribute('r', 0);

        this.wave2.circle.setAttribute('cx', 0);
        this.wave2.circle.setAttribute('cy', 0);
        this.wave2.circle.setAttribute('r', 0);
    }

    //Text class
    function Text(x, y, size, color, family, value, href, target) {
        this.x = x;
        this.y = y;
        this.size = size,
        this.color = color,
        this.value = value;
        this.href = href;
        this.target = target;
        this.family = family;
    }
    Text.prototype.draw = function () {
        this.a = createSvgElement('a');
        this.a.setAttribute('xlink:href', this.href);
        this.a.setAttribute('target', this.target);
        this.a.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.href);

        this.txt = createSvgElement('text');
        this.txt.setAttribute('x', this.x);
        this.txt.setAttribute('y', this.y);
        this.txt.style.fill = this.color;
        this.txt.style.fontSize = this.size;
        this.txt.style.fontFamily = this.family;
        this.txt.style.cursor = 'pointer';

        var valueNode = document.createTextNode(this.value);
        this.txt.appendChild(valueNode);
        this.a.appendChild(this.txt);
        svg.appendChild(this.a);
    }
    Text.prototype.changeOpacity = function (opacity) {
        this.txt.style.fill = this.color.slice(0, 17) + opacity + ')';
    }

    //Line class
    function Line(begin, end, strokeWidth, color) {
        this.beginPoint = begin;
        this.endPoint = end;
        this.line = createSvgElement('line');
        this.progress = 0

        this.line.setAttribute('x1', this.beginPoint.x);
        this.line.setAttribute('y1', this.beginPoint.y);
        this.line.setAttribute('x2', this.beginPoint.x);
        this.line.setAttribute('y2', this.beginPoint.y);
        this.line.style.stroke = color;
        this.line.style.strokeWidth = strokeWidth;
        svg.appendChild(this.line);
    }
    //Create link effect
    Line.prototype.bulid = function (step) {
        var progress = 0;
        var tempCoordinate = {
            x: this.beginPoint.x,
            y: this.beginPoint.y
        }
        var speed = getSpeed(this.beginPoint, this.endPoint, step);

        //step by step to draw line, wave too.
        var drawRun = function () {
            progress++;
            this.line.setAttribute('x2', tempCoordinate.x);
            this.line.setAttribute('y2', tempCoordinate.y);
            tempCoordinate.x += speed.X;
            tempCoordinate.y += speed.Y;
            if (progress <= step) {
                this.requestID = requestAnimationFrame(drawRun);
            }
        }.bind(this);

        return drawRun;
    }
    //Clear this effect
    Line.prototype.clear = function () {
        //this.progress = 100000000;
        //setTimeout(function () {
        //}.bind(this), 17.7);
        cancelAnimationFrame(this.requestID);
        this.line.setAttribute('x2', this.beginPoint.x);
        this.line.setAttribute('y2', this.beginPoint.y);
    }
    //All Line function
    function drawAllLine(lines, needTime) {
        var timeStep = needTime / (1000 / 60);
        for (var j = 0; j < lines.length; j++) {
            lines[j].clear();
            (lines[j].bulid(timeStep))();
        }
    }
    function clearAllLine(lines) {
        for (var j = 0; j < lines.length; j++) {
            lines[j].clear();
        }
    }

    //Create polygon area according to the point
    function createPolygon(pointArr) {
        var polygon = createSvgElement('polygon');
        var notMainPointArr = pointArr.clone();
        notMainPointArr.splice(0, 1);
        var pointStr = createPointStr(notMainPointArr);
        polygon.setAttribute('points', pointStr);
        polygon.style.fill = "rgba(255,255,255,0)";
        svg.appendChild(polygon);
        return polygon;
    }

    //draw all points ,lines...
    function drawAll(pointArr, textArr, time) {
        var polygon = createPolygon(pointArr);
        var wave = new Wave();

        var lines = [];
        var line1, line2;
        for (var i = 1; i < pointArr.length; i++) {
            var line1, line2;
            if (pointArr[i].isLink) {
                line1 = new Line(pointArr[i], pointArr[i + 1 == pointArr.length ? 1 : i + 1], 1, "rgba(255,255,255,0.4)");
            }
            line2 = new Line(pointArr[0], pointArr[i], 1, "rgba(255,255,255,0.4)");

            lines.push(line1);
            lines.push(line2);
        }

        for (var i = 0; i < pointArr.length; i++) {
            (function (i) {
                for (var j = 0; j < textArr[i].length; j++) {
                    (function (j) {
                        textArr[i][j].draw();

                        EventUtil.addHandler(textArr[i][j].a, 'mouseover', function () {
                            if (i != 0) {
                                textArr[i][j].changeOpacity(0.8);
                            }
                            drawAllLine(lines, time);
                        });
                        EventUtil.addHandler(textArr[i][j].a, 'mouseout', function () {
                            if (i != 0) {
                                textArr[i][j].changeOpacity(0.4);
                            }
                            clearAllLine(lines);
                        });
                    })(j)
                }
                pointArr[i].draw();

                EventUtil.addHandler(pointArr[i].circle, 'mouseover', function () {
                    wave.gradual(pointArr[i].x, pointArr[i].y, i == 0 ? pointArr[i].r * 10 : pointArr[i].r * 8, 70);
                    changeAllColor(pointArr, 0.8);
                    drawAllLine(lines, time);
                });
                EventUtil.addHandler(pointArr[i].circle, 'mouseout', function () {
                    wave.clear();
                    changeAllColor(pointArr, 0.4);
                    clearAllLine(lines);
                });

            })(i)
        }

        EventUtil.addHandler(polygon, 'mouseover', function () {
            drawAllLine(lines, time);
            changeAllColor(pointArr, 0.8);
            wave.gradual(pointArr[0].x, pointArr[0].y, pointArr[0].r * 10, 80);
        });
        EventUtil.addHandler(polygon, 'mouseout', function () {
            clearAllLine(lines);
            changeAllColor(pointArr, 0.4);
            wave.clear();
        });
    }

    function configToObjectAndDraw(configObj) {
        var target = configObj.target;
        var fontFamily = configObj.fontFamily;
        var lineNeedTime = configObj.drawLineNeedTime;
        var points, texts;
        var mainContent, mainPoint, mainTexts;
        var otherContent, otherR, otherSize, otherTextColor, otherPointColor, otherPoints, otherTexts;

        for (var j = 0; j < configObj.polygonArray.length; j++) {
            points = [];
            texts = [];
            mainContent = configObj.polygonArray[j].mainContent;
            mainPoint = mainContent.point;
            mainTexts = mainContent.texts;
            var pointTextArr;

            points[0] = new Point(mainPoint.x, mainPoint.y, mainPoint.r, mainPoint.color);
            for (var o = 0; o < mainTexts.length; o++) {
                pointTextArr = [];
                pointTextArr[o] = new Text(mainPoint.x + mainTexts[o].offsetX, mainPoint.y + mainTexts[o].offsetY,
               mainTexts[o].fontSize, mainTexts[o].color, fontFamily, mainTexts[o].value, mainTexts[o].href, target);
            }
            texts.push(pointTextArr);

            otherContent = configObj.polygonArray[j].otherContent;
            otherR = otherContent.r;
            otherSize = otherContent.textFontSize;
            otherTextColor = otherContent.textColor;
            otherPointColor = otherContent.pointColor;
            otherPoints = otherContent.points;
            otherTexts = otherContent.texts;
            var point, text, pointTexts;

            for (var i = 0; i < otherPoints.length; i++) {
                if (isRelative) {
                    point = new Point(otherPoints[i].x + mainPoint.x, otherPoints[i].y + mainPoint.y, otherR, otherPointColor, otherPoints[i].isLink);
                }
                else {
                    point = new Point(otherPoints[i].x, otherPoints[i].y, otherR, otherPointColor, otherPoints[i].isLink);
                }
                pointTexts = otherTexts[i];
                pointTextArr = [];
                for (var o = 0; o < pointTexts.length; o++) {
                    if (isRelative) {
                        text = new Text(mainPoint.x + otherPoints[i].x + pointTexts[o].offsetX, mainPoint.y + otherPoints[i].y + pointTexts[o].offsetY,
    otherSize, otherTextColor, fontFamily, pointTexts[o].value, pointTexts[o].href, target);
                    }
                    else {
                        text = new Text(otherPoints[i].x + pointTexts[o].offsetX, otherPoints[i].y + pointTexts[o].offsetY,
    otherSize, otherTextColor, fontFamily, pointTexts[o].value, pointTexts[o].href, target);
                    }
                    pointTextArr.push(text);
                }

                points.push(point);
                texts.push(pointTextArr);
            }

            drawAll(points, texts, lineNeedTime);
        }
    }

    //Size response
    EventUtil.addHandler(window, 'resize', function () {
        svg.innerHTML = '';
        recoverAllxy(configObj);
        HEIGHT = svg.clientHeight;
        WIDTH = svg.clientWidth;
        changeAllxy(configObj);
        configToObjectAndDraw(configObj);
    });

    //public
    this.draw = function () {
        //execute
        changeAllxy(configObj);
        configToObjectAndDraw(configObj);
    }
}