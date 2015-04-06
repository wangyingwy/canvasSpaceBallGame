$(document).ready(function() {
    var canvas = $("#gameCanvas");
    var context = canvas.get(0).getContext("2d");

    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height(); //  画布尺寸

    var playGame;   //游戏设置

    //定义圆台数据
    var platformX;
    var platformY;
    var platformOuterRadius;
    var platformInnerRadius;

    //定义装载行星的数组
    var asteroids;

    var player;
    var playerOriginalX;
    var playerOriginalY;    //玩家小行星

    //建立鼠标事件监听器以及所有即将使用的变量
    var playerSelected;    //确定玩家使用的小行星当前是否被选中
    var playerMaxAbsVelocity;   //限制玩家小行星的最快速度
    var playerVelocityDampener;     //微调速度的计算
    //上面两个变量用于储存玩家使用的小行星的速度
    var powerX;
    var powerY;     //确定小行星的速度，在画布上绘制直线来表示该速度

    var score;

    var ui = $("#gameUI");
    var uiIntro = $("#gameIntro");
    var uiStats = $("#gameStats");
    var uiComplete = $("#gameComplete");
    var uiPlay = $("#gamePlay");
    var uiReset = $(".gameReset");
    var uiRemaining = $("#gameRemaining");
    var uiScore = $(".gameScore");
    var uiIntroduce = $("#gameIntroduce");
    var uiTitle = $(".gameTitle");
    var uiInfo1 = $(".gameDetailInfo1");
    var uiInfo2 = $(".gameDetailInfo2");
    var uiInfo3 = $(".gameDetailInfo3");
    var uiInfo4 = $(".gameDetailInfo4");
    var uiInfo5 = $(".gameDetailInfo5");
    var uiInfo6 = $(".gameDetailInfo6");
    var uiPage1 = $(".nextPage1");
    var uiPage2 = $(".nextPage2");
    var uiPage3 = $(".nextPage3");
    var uiYes = $(".yes");
    var uiNo = $(".no");
    var uiBack = $(".back");
    var uiStart = $(".startlit");
    var uiAgain = $(".playAgain");
    var uiFail = $("#gameFail");
    var uiSuccess = $("#successAgain");
    var uiGoodGirl = $("#goodGirl");
    var uiFog = $("#gameFog");
    var uiSaveYes = $(".saveyes");
    var uiSaveNo = $(".saveno");
    var uiNoResult = $(".saveNoResult");
    var uiHome = $(".backhome");

    //重置player
    function resetPlayer() {
        player.x = playerOriginalX;
        player.y = playerOriginalY;
        player.vX = 0;
        player.vY = 0;
    };

    //重置和启动游戏
    function startGame() {
        uiScore.html("0");//当游戏开始的时候显示统计屏幕
        uiStats.show();

        //定义行星数据
        var Asteroid = function(x, y, radius, mass, friction) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.mass = mass;
            this.friction = friction;
            this.vX = 0;
            this.vY = 0;
            this.player = false;
        }

        playGame = false;   //初始游戏设置

        platformX = canvasWidth/2;
        platformY = 150;
        platformOuterRadius = 100;
        platformInnerRadius = 75;

        asteroids = new Array();

        playerSelected = false;
        playerMaxAbsVelocity = 30;
        playerVelocityDampener = 0.3;
        powerX = -1;
        powerY = -1;

        score = 0;

        var pRadius = 15;
        var pMass = 10;
        var pFriction = 0.97;
        playerOriginalX = canvasWidth/2;
        playerOriginalY = canvasHeight - 150;
        player = new Asteroid(playerOriginalX, playerOriginalY, pRadius, pMass, pFriction);
        player.player = true;
        asteroids.push(player);

        var outerRing = 8;  //外圈上的小行星数目
        var ringCount = 3;  //圈数
        var ringSpacing = (platformInnerRadius/(ringCount - 1));    //每个圈之间的距离

        //让小行星整齐地排列成环形
        for(var r = 0; r < ringCount; r++) {
            var currentRing = 0;    //当前圈上的小行星数目
            var angle = 0;  //每颗小行星之间的角度
            var ringRadius = 0; //计算每圈的半径

            //判断是不是最里面的圆
            if(r == ringCount - 1) {
                currentRing = 1;
            }
            else{
                currentRing = outerRing-(r*3);
                angle = 360/currentRing;
                ringRadius = platformInnerRadius-(ringSpacing*r);
            };

            for(var a=0;a<currentRing;a++) {
                var x = 0;
                var y = 0;

                //判断是不是最里面的圆
                if(r == ringCount-1) {
                    x = platformX;
                    y = platformY;
                }
                else{
                    x = platformX+(ringRadius*Math.cos((angle*a)*(Math.PI/180)));
                    y = platformY+(ringRadius*Math.sin((angle*a)*(Math.PI/180)));
                };

                var radius = 10;
                var mass = 5;
                var friction = 0.95;
                asteroids.push(new Asteroid(x,y,radius,mass,friction));
            }
        };

        uiRemaining.html(asteroids.length-1);   //更新小行星数量

        //建立鼠标事件监听器
        //选中玩家小行星
        $(window).mousedown(function(e) {
            if(!playerSelected && player.x == playerOriginalX && player.y == playerOriginalY) {     //防止玩家在小行星仍然处于第一次投掷运动时再次投掷小行星
                var canvasOffset = canvas.offset();
                var canvasX = Math.floor(e.pageX-canvasOffset.left);
                var canvasY = Math.floor(e.pageY-canvasOffset.top);

                if(!playGame) {     //检测游戏是否在进行
                    playGame = true;
                    animate();
                };

                //计算玩家小行星与鼠标之间的距离。判断玩家是否单击了小行星
                var dX = player.x - canvasX;
                var dY = player.y - canvasY;
                var distance = Math.sqrt((dX*dX)+(dY*dY));
                var padding = 5;    //让玩家更加容易选中小行星

                if(distance<player.radius+padding) {
                    powerX = player.x;
                    powerY = player.y;
                    playerSelected = true;
                };  //把选中小行星的消息通知给其他游戏对象
            };
        });

        //改变玩家小行星的力度和角度
        $(window).mousemove(function(e) {
            if(playerSelected) {
                var canvasOffset = canvas.offset();
                var canvasX = Math.floor(e.pageX-canvasOffset.left);
                var canvasY = Math.floor(e.pageY-canvasOffset.top);

                var dX = canvasX - player.x;
                var dY = canvasY - player.y;
                var distance = Math.sqrt((dX*dX)+(dY*dY));

                if(distance*playerVelocityDampener<playerMaxAbsVelocity) {
                    powerX = canvasX;
                    powerY = canvasY;
                }   //缓冲鼠标与玩家小行星原点的距离
                else{
                    var ratio = playerMaxAbsVelocity/(distance*playerVelocityDampener);
                    powerX = player.x+(dX*ratio);
                    powerY = player.y+(dY*ratio);
                };  //  若速度超出最大允许值，则减少速度的值到最大允许值
            };
        });

        //让玩家小行星运动
        $(window).mouseup(function(e) {
            if(playerSelected) {
                var dX = powerX - player.x;
                var dY = powerY - player.y;
                player.vX = -(dX*playerVelocityDampener);
                player.vY = -(dY*playerVelocityDampener);
                uiScore.html(++score);
            };

            playerSelected = false;
            powerX = -1;
            powerY = -1;
        });

        animate();  //开始动画循环
    };

    function init() {
        uiStats.hide();
        uiComplete.hide();
        uiInfo1.hide();
        uiInfo2.hide();
        uiInfo3.hide();
        uiInfo4.hide();
        uiInfo5.hide();
        uiInfo6.hide();
        uiFail.hide();
        uiGoodGirl.hide();
        uiFog.hide();
        uiNoResult.hide();

        uiPlay.click(function(e) {
            e.preventDefault();
            uiIntro.hide();
            startGame();
        });

        uiStart.click(function(e) {
            e.preventDefault();
            uiIntro.hide();
            startGame();
        });

        uiReset.click(function(e) {
            e.preventDefault();
            //uiComplete.hide();
            startGame();
        });

        uiIntroduce.click(function(e) {
            e.preventDefault();
            uiTitle.hide();
            uiInfo1.show();
        });

        uiPage1.click(function(e) {
            e.preventDefault();
            uiInfo1.hide();
            uiInfo2.show();
        });

        uiPage2.click(function(e) {
            e.preventDefault();
            uiInfo2.hide();
            uiInfo3.show();
        });

        uiPage3.click(function(e) {
            e.preventDefault();
            uiInfo3.hide();
            uiInfo4.show();
        });

        uiYes.click(function(e) {
            e.preventDefault();
            uiInfo4.hide();
            uiInfo6.show();
        });

        uiNo.click(function(e) {
            e.preventDefault();
            uiInfo4.hide();
            uiInfo5.show();
        });

        uiBack.click(function(e) {
            e.preventDefault();
            uiInfo5.hide();
            uiTitle.show();
        });

        uiAgain.click(function(e) {
            e.preventDefault();
            uiFail.hide();
            startGame();
        });

        uiSuccess.click(function(e) {
            e.preventDefault();
            uiComplete.hide();
            startGame();
        });

        uiHome.click(function(e) {
            e.preventDefault();
            uiNoResult.hide();
            uiStats.animate({opacity: 1}, 800);
            startGame();
        })
    };

    function animate() {
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        //画圆台
        context.fillStyle = "rgb(180,63,112)";
        context.beginPath();
        context.arc(platformX, platformY, platformOuterRadius, 0, Math.PI*2, true);
        context.closePath();
        context.fill();

        //绘制一条直线于玩家小行星和速度的位置之间
        if(playerSelected) {
            context.strokeStyle = "rgb(255,255,255)";
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(player.x, player.y);
            context.lineTo(powerX, powerY);
            context.closePath();
            context.stroke();
        }

        context.fillStyle = "rgb(255,255,255)";
        var asteroidsLength = asteroids.length;
        var deadAsteroids = new Array();    //储存从平台上掉下来的行星的临时数组
        for(var i=0;i<asteroidsLength;i++) {
            var tmpAsteroid = asteroids[i];

            for(var j=i+1;j<asteroidsLength;j++) {
                var tmpAsteroidB = asteroids[j];

                var dX = tmpAsteroidB.x - tmpAsteroid.x;
                var dY = tmpAsteroidB.y - tmpAsteroid.y;
                var distance = Math.sqrt((dX*dX)+(dY*dY));

                if(distance<tmpAsteroid.radius + tmpAsteroidB.radius) {
                    var angle = Math.atan2(dY,dX);
                    var sine = Math.sin(angle);
                    var cosine = Math.cos(angle);

                    //旋转小行星的位置
                    var x = 0;
                    var y = 0;

                    //旋转小行星B的位置
                    var xB = dX*cosine+dY*sine;
                    var yB = dY*cosine-dY*sine;

                    //旋转小行星的速度
                    var vX = tmpAsteroid.vX*cosine+tmpAsteroid.vY*sine;
                    var vY = tmpAsteroid.vY*cosine-tmpAsteroid.vX*sine;

                    //旋转小行星B的速度
                    var vXb = tmpAsteroidB.vX*cosine+tmpAsteroidB.vY*sine;
                    var vYb = tmpAsteroidB.vY*cosine-tmpAsteroidB.vX*sine;

                    //保持动量
                    var vTotal = vX - vXb;
                    vX = ((tmpAsteroid.mass-tmpAsteroidB.mass)*vX+2*tmpAsteroidB.mass*vXb)/(tmpAsteroid.mass+tmpAsteroidB.mass);
                    vXb = vTotal + vX;

                    //将小行星分开
                    xB = x + (tmpAsteroid.radius + tmpAsteroidB.radius);

                    //转回小行星的位置
                    tmpAsteroid.x = tmpAsteroid.x + (x*cosine - y*sine);
                    tmpAsteroid.y = tmpAsteroid.y + (y*cosine + x*sine);

                    tmpAsteroidB.x = tmpAsteroid.x + (xB*cosine - yB*sine);
                    tmpAsteroidB.y = tmpAsteroid.y + (yB*cosine + xB*sine);

                    //转回小行星的速度
                    tmpAsteroid.vX = vX*cosine - vY*sine;
                    tmpAsteroid.vY = vY*cosine + vX*sine;

                    tmpAsteroidB.vX = vXb*cosine - vYb*sine;
                    tmpAsteroidB.vY = vYb*cosine + vXb*sine;
                }
            };

            //计算新位置
            tmpAsteroid.x += tmpAsteroid.vX;
            tmpAsteroid.y += tmpAsteroid.vY;

            //摩擦力
            if(Math.abs(tmpAsteroid.vX)>0.1) {
                tmpAsteroid.vX *= tmpAsteroid.friction;
            }
            else{
                tmpAsteroid.vX = 0;
            };
            if(Math.abs(tmpAsteroid.vY)>0.1){
                tmpAsteroid.vY *= tmpAsteroid.friction;
            }
            else{
                tmpAsteroid.vY = 0;
            };

            if(!tmpAsteroid.player) {
                var dXp = tmpAsteroid.x - platformX;
                var dYp = tmpAsteroid.y - platformY;
                var distanceP = Math.sqrt((dXp*dXp)+(dYp*dYp)); //计算小行星与平台中心的距离
                if(distanceP > platformOuterRadius) {   //检测小行星的中心是否位于平台边界之外
                    if(tmpAsteroid.radius > 0) {
                        tmpAsteroid.radius -= 2;    //让掉出平台之外的小行星逐渐消失
                    }
                    else{
                        deadAsteroids.push(tmpAsteroid);
                    };
                };
            };

            //重置玩家小行星，以便玩家再次投掷
            if(player.x != playerOriginalX && player.y != playerOriginalY) {
                if(player.vX == 0 && player.vY == 0) {
                    resetPlayer();
                }
                else if(player.x + player.radius < 0) {
                    resetPlayer();
                }
                else if(player.x - player.radius > canvasWidth) {
                    resetPlayer();
                }
                else if(player.y + player.radius < 0) {
                    resetPlayer();
                }
                else if(player.y - player.radius > canvasHeight) {
                    resetPlayer();
                };
            };

            //画小行星
            context.beginPath();
            context.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI*2, true);
            context.closePath();
            context.fill();
        }

        if(playGame) {
            //删除消失的小行星
            var deadAsteroidsLength = deadAsteroids.length;
            if(deadAsteroidsLength>0) {
                for(var di=0;di<deadAsteroidsLength;di++) {
                    var tmpDeadAsteroid = deadAsteroids[di];
                    asteroids.splice(asteroids.indexOf(tmpDeadAsteroid), 1);
                };

                //判断玩家是否获胜
                var remaining = asteroids.length-1; //不算玩家小行星
                uiRemaining.html(remaining);

                if(score > 5) {
                    playGame = false;
                    uiStats.hide();
                    uiFail.show();

                    $(window).unbind("mousedown");
                    $(window).unbind("mouseup");
                    $(window).unbind("mousemove");
                };

                if(remaining == 0 && score <= 5) {
                    playGame = false;
                    uiStats.animate({opacity: 0.2}, 800);
                    uiFog.show();
                    setTimeout(function() {
                        uiGoodGirl.show();
                        uiSaveYes.click(function() {
                            uiGoodGirl.hide();
                            uiFog.hide();
                            uiComplete.show();
                            uiStats.animate({opacity: 1}, 800);
                        });
                        uiSaveNo.click(function() {
                            uiGoodGirl.hide();
                            uiFog.hide();
                            uiNoResult.show();
                        })
                    }, 800);

                    $(window).unbind("mousedown");
                    $(window).unbind("mouseup");
                    $(window).unbind("mousemove");
                };
            };

            setTimeout(animate, 33);
        };

        if(score > 5) {
            playGame = false;
            uiStats.hide();
            uiFail.show();

            $(window).unbind("mousedown");
            $(window).unbind("mouseup");
            $(window).unbind("mousemove");
        };      //这短代码其实很鸡肋，怎么说呢，如果我注释了这段代码，那么，当用户移动鼠标点击玩家保龄球的时候，假如玩家球没有碰到圆台球的话，
                //用户是可以一直玩下去的，可是不注释代码的话，用户在第六次点击球的时候，才会触发输了这个条件警告，这样交互不好，看上去像是用户手动放弃游戏一样
    };
    init();
});
