# radialline
### Baidu talent homepage ray effect
### 百度招聘首页的射线地图效果，鼠标移上去会出现射线效果和波澜波澜。示例：[demo](https://yozosann.github.io/demo/demo1.html)

#### 喜欢请点star，3q

#### 使用方法
###### HTML Template
```html
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <meta charset="utf-8" />
    <style type="text/css">
        * {
            margin: 0;
            padding: 0;
        }

        html {
            height: 100%;
            width: 100%;
            overflow: hidden;
        }

        body {
            height: 100%;
            width: 100%;
            background-color: cadetblue;
        }
    </style>
</head>
<body>
    <svg id="svgByYozo" xmlns="http://www.w3.org/2000/svg" version="1.1">
    </svg>
    <script type="text/javascript" src="radial-line.js"></script>
    <script>
        var configObj = {...}; //稍后详细介绍，配置对象
        window.onload = function () {
            var svg = document.getElementById('svgByYozo');
            var radialByYozo = new RayMap(svg, configObj, true);
            radialByYozo.draw();
        }
    </script>
</body>
</html>
```

1.click ==**clone or download**==，下载radialline.js

2.引入文件
```html
    <script type="text/javascript" src="radialline.js"></script>
```

3.创建一个svg。
```html
    <svg id="svgByYozo" xmlns="http://www.w3.org/2000/svg" version="1.1">
    </svg>
```
，并把它放在你想放的位置上，它会默认填充父元素宽高100%

4.创建rayMap对象，并传入svg dom。
 ```javascript
    var svg = document.getElementById('svgByYozo');
    var radialByYozo = new RayMap(svg, configObj, true);//
    rayMap对象有三个参数，分别代表svg对象，配置对象，是否使用相对位置
```
配置对象稍后做详细说明。

5.执行radialByYozo.draw()的方法
```javascript
    radialByYozo.draw();//呈现效果；
```

## 配置对象讲解
**正如大家所看见的，射线地图中有很多区域，区域中有很多点，分别是主点和子点，并且每个点对应了一个或几个文本，且文本还有各自的链接，如何设置点的位置大小等参数，就要靠这个配置对象啦~，接下来就详细讲解如何写这个配置对象。（因为和json还是有点区别，我就在这里叫配置对象了）**

这个配置对象中包括了两个区域。
```javascript
var configObj = {
            "fontFamily": "Microsoft YaHei", //全局文本字体，同css文字字体
            "target": "_blank", //全局链接打开方式
            "drawLineNeedTime": 1000, //默认画线到目标点所需时间，单位ms
            "polygonArray": [{   //多边形数组，数组的中每个对象代表一块区域，例如demo中的金融服务区域和搜索公司区域
                "mainContent": { //区域中的主内容，内容包括点，及点所对应的文本数组
                    "point": {  //主点，例如：金融服务前的点
                        "x": 0.3245,  //点的横坐标，为了应付响应式，这个点代表的是父元素宽度的百分比，相对于父元素左上角的横向位移。
                        "y": 0.5835,  //点的纵坐标，为了应付响应式，这个点代表的是父元素高度的百分比，相对于父元素左上角的纵向位移。
                        "r": 4.5,  //主点的半径
                        "color": "rgba(255,78,207,0.9)" //主点的颜色
                    },
                    "texts": [{  //主点所对应的文本数组！！，注意此处代表的是一个文本数组，不是一个文本，因为有可能一个点对应多个文本，而每个文本又有自己的链接及信息
                        "offsetX": -65, //相对于主点横向位置的偏移，单位px
                        "offsetY": 4.5, //相对于主点纵向位置的偏移，单位px
                        "fontSize": "13px", //字体大小
                        "color": "rgba(255,255,255,0.8)", //颜色
                        "value": "金融服务", //文本值
                        "href": "#" //文本值所对应的链接
                    }]
                },
                "otherContent": { //区域中的其他内容（点及文本）
                    "r": 3.5, //所有其他点的半径
                    "textFontSize": "10px", //所有其他文本的字体大小
                    "pointColor": "rgba(255,255,255,0.4)", //所有其他点的颜色
                    "textColor": "rgba(255,255,255,0.4)",  //所有其他文本的颜色
                    "points": [ //点的坐标数组，代表除主点外的其他点的所在位置。！！还记得RayMap中有三个参数吗，第三个参数就是在这里起作用，如果是相对（true），那么这底下每个点的x,y则是相对于本区域主点的，例："x": -0.1182， 主点是 "x": 0.3245，那么这个点的横坐标则为 （-0.1182 + 0.3245）* 父元素宽度；如果不是相对的（false），那么就像主点一样设置它所在位置就好
                    { "x": -0.1182, "y": -0.0128, "isLink": true },
                    { "x": -0.0727, "y": -0.0771, "isLink": false },
                    { "x": -0.0145, "y": 0.1029, "isLink": true },
                    { "x": -0.1, "y": 0.09, "isLink": true }
                    ],//1、仔细的同学会发现，每一个点都会放射一条线指向下一个点，并且，主点会放射一条线指向各个其他点。为了达到美观的效果，并不是每次都需要由上一个点指向下一个点，当不需要时，这里的 isLink设置为false就行了，主点默认会指向所有点，这个不会改变。 2、这里的点坐标对象的顺序并不是随意的，而是有规则的，从第一个点到最后一个点请按照顺时针或者逆时针排序，否则就会产生射线交叉，显得不美观。如果不太明白则看本文最后的注意。
                    "texts": [[{ //这里是一个二维数组，第一维度代表每个点所对应的，第二维度代表所对应的文本数组，
                        "offsetX": -55, //相对于所对应点的偏移，单位px
                        "offsetY": 3.5,
                        "value": "理财业务",
                        "href": "#"
                    }], [{
                        "offsetX": -55,
                        "offsetY": 4.5,
                        "value": "百度钱包",
                        "href": "#"
                    }], [{
                        "offsetX": 10,
                        "offsetY": 4.5,
                        "value": "消费信贷",
                        "href": "#"
                    }], [{
                        "offsetX": -25,
                        "offsetY": 20,
                        "value": "金融风控",
                        "href": "#"
                    }]]
                }
            }, {//第二个多边形，代表第二个区域
                "mainContent": {
                    "point": {
                        "x": 0.6845,
                        "y": 0.3393,
                        "r": 4.5,
                        "color": "#ffde00"
                    },
                    "texts": [{
                        "offsetX": -65,
                        "offsetY": 4.5,
                        "fontSize": "13px",
                        "color": "rgba(255,255,255,0.8)",
                        "value": "搜索公司",
                        "href": "#"
                    }]
                },
                "otherContent": {
                    "r": 3.5,
                    "textFontSize": "10px",
                    "pointColor": "rgba(255,255,255,0.4)",
                    "textColor": "rgba(255,255,255,0.4)",
                    "points": [
                    { "x": -0.0727, "y": -0.0385, "isLink": true },
                    { "x": -0.0181, "y": -0.0964, "isLink": true },
                    { "x": 0.0546, "y": -0.0642, "isLink": true },
                    { "x": 0.091, "y": -0.0128, "isLink": true },
                    { "x": -0.0181, "y": 0.0565, "isLink": false },
                    ],
                    "texts": [[{
                        "offsetX": -55,
                        "offsetY": 3.5,
                        "value": "百度糯米",
                        "href": "#"
                    }], [{ //就像这里，这个数组中所对应了两个文本，"大搜索"和"风巢"
                        "offsetX": 10,
                        "offsetY": 4.5,
                        "value": "大搜索",
                        "href": "#"
                    }, {
                        "offsetX": 58,
                        "offsetY": 4.5,
                        "value": "凤巢",
                        "href": "#"
                    }], [{
                        "offsetX": 10,
                        "offsetY": 4.5,
                        "value": "百度地图",
                        "href": "#"
                    }], [{ //就像这里，这个数组中所对应了四个文本，"个人云"和"贴吧"，"输入法"，"浏览器"
                        "offsetX": 10,
                        "offsetY": 4.5,
                        "value": "个人云",
                        "href": "#"
                    }, {
                        "offsetX": 58,
                        "offsetY": 4.5,
                        "value": "贴吧",
                        "href": "#"
                    }, {
                        "offsetX": 94,
                        "offsetY": 4.5,
                        "value": "输入法",
                        "href": "#"
                    }, {
                        "offsetX": 142,
                        "offsetY": 4.5,
                        "value": "浏览器",
                        "href": "#"
                    }], [{
                        "offsetX": 10,
                        "offsetY": 4.5,
                        "value": "知识搜素",
                        "href": "#"
                    }, {
                        "offsetX": 70,
                        "offsetY": 4.5,
                        "value": "移动分发",
                        "href": "#"
                    }, {
                        "offsetX": 130,
                        "offsetY": 4.5,
                        "value": "商业生态",
                        "href": "#"
                    }]]
                }
            }]
        }
```
==**这里总结一下需要注意的点：**==
1.每个点所对应的不是一个文本，而是一个文本数组
2.RayMap对象的第三个参数影响其他点坐标的坐标设置，true代表相对于主点设置，false代表和主点一样的设置方法，绝对设置。
3.其他点的*坐标数组* 中*坐标对象*请按顺时针或者逆时针的顺序排列。![展示图片](http://oi2eedr7y.bkt.clouddn.com/16-12-13/25160949-file_1481609771825_2a00.jpg)
例如图片里的，发出射线总是由上一个点指向下一个点（中间是主点），所以坐标数组中顺序为[A.坐标,B.坐标,C.坐标,D.坐标,E.坐标],E会直线指向第一个点。如果我不想要B指向C的那一条线，那么我就在B的isLink设置为false即可。


