#萌萌保龄球介绍说明

>游戏UI被分为单独的几个部分，便于使用js与用户进行交互和控制区域的可见性

>游戏的核心功能是由几个函数组成的：首先，startGame函数是一个占位符，当玩家点击开始游戏，重置等功能的按钮的时候，该占位符用于启动或者
重置游戏。另外，startGame中调用了animate函数，animate函数中，用setTimeout将每秒帧数的超时值设置为基础值33。还有一个函数是init，当第一次
载入游戏时，该函数用于完成游戏的初始化设置

>在init函数中，首先将其他游戏界面全部隐藏，只剩下gameIntro这个界面，是游戏的初始界面，当点击开始游戏的时候，实现界面的跳转

##创建游戏对象：
>在创建小的圆球之前，首先要创建放置圆球的圆台，平台是圆形的，由几个特定的变量定义：platformX，platformY（圆台的原点），platformOuterRadius（圆台的外半径，即圆台实际的区域），
platformInnerRadius（圆台的内半径，即实际放置小圆球的区域）

>在startGame函数中，为圆台的这些变量赋值：
platformX = canvasWidth/2;
platformY = 150;
platformOuterRadius = 100;
platformInnerRadius = 75;
最后在animate函数中绘制整个圆台

##创建小圆球：
>

