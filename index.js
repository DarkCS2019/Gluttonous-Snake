"use strict";
//定义类
/*


    定义食物类


*/
class Food {
    //根据id获取到对象
    constructor() {
        //获取页面中的food元素并将其赋值为element !表示不可能为空
        this.element = document.getElementById('food');
    }
    //定义获取食物x轴坐标的方法
    get X() {
        return this.element.offsetLeft;
    }
    //定义一个获取食物Y轴坐标的方法
    get Y() {
        return this.element.offsetTop;
    }
    //修改食物的位置
    change() {
        //生成一个随机的位置
        //食物的位置最小是0 最大是290
        //蛇移动一次就是一格 一格的大小是10 所以食物的坐标必须是10的倍数
        //round 四舍五入 random 0-1 不包含0和1 
        let left = Math.round(Math.random() * 29) * 10;
        let top = Math.round(Math.random() * 29) * 10;
        this.element.style.left = left + 'px';
        this.element.style.top = top + 'px';
    }
}
//test
// const food = new Food();
// console.log(food.X,food.Y);
// food.change();
// console.log(food.X,food.Y);
/*


    定义积分牌类


*/
class ScorePanel {
    //如果有传参进来就用传入的值 否则用默认值
    constructor(maxLevel = 10, upScore = 10) {
        //记录分数和等级
        this.score = 0;
        this.level = 1;
        //获取两个span标签 分数和等级所在的元素
        this.scoreEle = document.getElementById('score');
        this.levelEle = document.getElementById('level');
        this.maxLevel = maxLevel;
        this.upScore = upScore;
    }
    //设置加分的方法
    addScore() {
        this.scoreEle.innerHTML = ++this.score + ''; //自增后改回到界面中
        //判断分数是多少
        if (this.score % this.upScore === 0) {
            this.levelUp();
        }
    }
    //提升等级的方法
    levelUp() {
        if (this.level < this.maxLevel) {
            this.levelEle.innerHTML = ++this.level + '';
        }
    }
}
// const scorePanel = new ScorePanel(100,2);
// for(let i = 0;i<200;i++){
//     scorePanel.addScore();
// }
/*


    定义蛇类


*/
class Snake {
    constructor() {
        this.element = document.getElementById('snake');
        this.head = document.querySelector('#snake > div');
        this.bodies = this.element.getElementsByTagName('div');
    }
    //获取蛇的坐标
    get X() {
        return this.head.offsetLeft;
    }
    get Y() {
        return this.head.offsetTop;
    }
    //设置蛇头的坐标
    set X(value) {
        //如股票新值与旧值相同 则直接返回不再修改
        if (this.X === value) {
            return;
        }
        //X的值的合法范围是0-290
        if (value < 0 || value > 290) {
            throw new Error('蛇撞墙了!');
        }
        //修改X是在修改水平坐标 蛇在左右移动 蛇向左移动时 不能向右移动 反之亦然
        if (this.bodies[1] && this.bodies[1].offsetLeft === value) {
            // console.log('水平调头了');
            if (value > this.X) {
                //新值大于旧值 向右走 则不让他向右走，让他向左走
                value = this.X - 10;
            }
            else {
                value = this.X + 10;
            }
        }
        //移动身体
        this.moveBody();
        this.head.style.left = value + 'px';
        //检查有没有撞到自己
        this.checkHeadBody();
    }
    set Y(value) {
        if (this.Y === value) {
            return;
        }
        //Y的值的合法范围是0-290
        if (value < 0 || value > 290) {
            throw new Error('蛇撞墙了');
        }
        if (this.bodies[1] && this.bodies[1].offsetTop === value) {
            if (value > this.Y) {
                //新值大于旧值 向右走 则不让他向右走，让他向左走
                value = this.Y - 10;
            }
            else {
                value = this.Y + 10;
            }
        }
        //移动身体
        this.moveBody();
        this.head.style.top = value + 'px';
        //检查有没有撞到自己
        this.checkHeadBody();
    }
    //蛇增加身体的方法
    addBody() {
        //向element中添加一个div 在element结束标签之前的位置
        this.element.insertAdjacentHTML("beforeend", "<div></div>");
    }
    moveBody() {
        //将后边的身体设置为前边身体的位置
        //遍历获取所有的身体 从后往前取
        for (let i = this.bodies.length - 1; i > 0; i--) {
            //获取当前节 前一小节 的位置(此时蛇还没动)
            let X = this.bodies[i - 1].offsetLeft;
            let Y = this.bodies[i - 1].offsetTop;
            //将值设置到当前身体上(蛇开始动)
            this.bodies[i].style.left = X + 'px';
            this.bodies[i].style.top = Y + 'px';
        }
    }
    checkHeadBody() {
        // 获取所有的身体，检查其是否和蛇头的坐标发生重叠
        for (let i = 1; i < this.bodies.length; i++) {
            let bd = this.bodies[i];
            if (this.X === bd.offsetLeft && this.Y === bd.offsetTop) {
                //撞到了身体 游戏结束
                throw new Error('撞到自己了 GAME OVER!');
            }
        }
    }
}
/*


    游戏控制器类 控制其他的所有类


*/
class GameControl {
    constructor() {
        //创建一个属性存储蛇的移动方向
        this.direction = '';
        //创建一个属性用来记录游戏是否结束
        this.isLive = true;
        this.snake = new Snake();
        this.food = new Food();
        this.scorePanel = new ScorePanel(10, 2);
        this.init();
    }
    //游戏的初始化方法
    init() {
        //绑定键盘按下的事件
        document.addEventListener('keydown', this.keydownHandler.bind(this)); //创建新函数 把新函数的this绑定成这个this
        //调用run方法 使蛇移动
        this.run();
    }
    //创建一个键盘按下的响应函数
    keydownHandler(event) {
        //需要检查方向值是否合法
        this.direction = event.key;
    }
    //创建控制蛇移动的方法
    run() {
        //根据方向使蛇的位置改变
        //获取蛇限现在的坐标
        let X = this.snake.X;
        let Y = this.snake.Y;
        switch (this.direction) {
            case "ArrowUp":
                Y -= 10;
                break;
            case "ArrowDown":
                Y += 10;
                break;
            case "ArrowLeft":
                X -= 10;
                break;
            case "ArrowRight":
                X += 10;
                break;
        }
        //检查蛇是否吃到食物
        this.checkEat(X, Y);
        //修改蛇的坐标值
        try {
            this.snake.X = X;
            this.snake.Y = Y;
            //onsole.log(X,Y);
        }
        catch (e) {
            alert(e.message + ' GAME OVER!');
            this.isLive = false;
        }
        //开启一个定时调用
        this.isLive && setTimeout(this.run.bind(this), 300 - (this.scorePanel.level - 1) * 30); //确保this永远是start对象
    }
    //检查蛇是否吃到了食物
    checkEat(X, Y) {
        if (X === this.food.X && Y === this.food.Y) {
            this.food.change();
            this.scorePanel.addScore();
            this.snake.addBody();
        }
    }
}
/*


    开始执行


*/
const start = new GameControl();
