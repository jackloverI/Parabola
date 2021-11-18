import {_decorator, Component, Node, EditBox, v3, v2, EventTouch} from 'cc';

const {ccclass, property} = _decorator;

/**
 * Predefined variables
 * Name = TestScene
 * DateTime = Wed Nov 17 2021 11:21:55 GMT+0800 (中国标准时间)
 * Author = jackloverI
 * FileBasename = testScene.ts
 * FileBasenameNoExtension = testScene
 * URL = db://assets/testScene.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
let _tmpVec3 = v3();
let _tmpVec2 = v2();

@ccclass('TestScene')
export class TestScene extends Component {
    @property(EditBox)
    public speedEdit: EditBox = null;
    @property(EditBox)
    public accSpeedEdit: EditBox = null;
    @property(Node)
    public arrow: Node = null;
    @property(Node)
    public arrowRoot: Node = null;
    @property(Node)
    public arrowTarget: Node = null;


    private speed: number = 1000;    //arrow的初始速度
    private accSpeed: number = 600; //加速度（Y方向上的，模拟重力加速度）
    private _isMoving = false;    //是否正在移动
    private _totalTime = 0;       //arrow的运行时间

    private Vx = 360;     //瞬时速度Vx
    private Vy = 0;      //瞬时速度Vy
    private startVy = 0; //因为Y方向上的速度为线性变化，这里记录一下初始速度
    private Px = 720;  //点击坐标PosX
    private Py = 0;  //点击坐标PosY
    private Mx = 0;  //相对Root的横向移动距离MoveX
    private My = 0;  //相对Root的纵向移动距离MoveY


    onLoad() {
        this._initTouchEvent();
    }

    private _initTouchEvent() {
        this.arrowTarget.on(Node.EventType.TOUCH_END, this._touchArrowTargetEndEvent, this);
        this.arrowTarget.on(Node.EventType.TOUCH_MOVE, this._touchArrowTargetMoveEvent, this);
        this.arrowRoot.on(Node.EventType.TOUCH_END, this._touchArrowRootEndEvent, this);
        this.arrowRoot.on(Node.EventType.TOUCH_MOVE, this._touchArrowRootMoveEvent, this);
    }

    update(deltaTime: number) {
        if (this._isMoving) {
            this._totalTime += deltaTime;
            this.Mx = this.Vx * this._totalTime;
            //Vy每帧都在变化
            this.Vy = this.Vy - this.accSpeed * deltaTime;
            //通过线性速度的平均速度求纵向移动距离
            this.My = (this.startVy + this.Vy) / 2 * this._totalTime;
            //发射起点+移动距离=当前弓箭位置
            this.arrow.setPosition(this.arrowRoot.position.x + this.Mx, this.arrowRoot.position.y + this.My, 0);
            let VyOverVx = this.Vy / this.Vx;
            let rotZ = Math.atan(VyOverVx) * 180 / 3.1415926;
            this.arrow.setRotationFromEuler(0, 0, rotZ);
            //超出屏幕则结束射箭
            if (this.Mx > 800) {
                this._isMoving = false;
            }
        }
    }

    //射箭
    onArcheryClick() {
        this.arrow.setWorldPosition(this.arrowRoot.worldPosition);
        this.Px = this.arrowTarget.worldPosition.x - this.arrowRoot.worldPosition.x;
        this.Py = this.arrowTarget.worldPosition.y - this.arrowRoot.worldPosition.y;
        // this._isMoving = this.calculateSubSpeed();
        this._isMoving = this.calculateSpeedY();
        this.startVy = this.Vy;
        this._totalTime = 0;
    }

    //估计初速度大小 计算初始的Vx和Vy
    calculateSubSpeed() {
        //标准化三元一次方程式；aX**2 + bX + c = 0;
        let a = (this.Py ** 2) / (this.Px ** 2) + 1;
        let b = this.accSpeed * this.Py - (this.speed ** 2);
        let c = ((this.accSpeed ** 2) * (this.Px ** 2)) / 4;

        let Vx2 = ((b ** 2) / ((a ** 2) * 4) - (c / a)) ** 0.5 - (b / (2 * a));
        //Vx存在非负性
        this.Vx = Vx2 ** 0.5;
        //绝对值
        this.Vy = ((this.speed ** 2) - Vx2) ** 0.5;

        let t = this.Px / this.Vx;
        let Vyl = this.Vy - this.accSpeed * t;
        //计算出Vy的正负
        if (Math.floor((Vyl + this.Vy) / 2 * t) != Math.floor(this.Py)) {
            console.error('要求相反数', ' Vx= ', this.Vx, ' Vy= ', this.Vy, ' this.Py= ', this.Py, ' posY= ', (Vyl + this.Vy) / 2 * t);
            this.Vy = -this.Vy;
            Vyl = this.Vy - this.accSpeed * t;
            if (Math.floor((Vyl + this.Vy) / 2 * t) != Math.floor(this.Py)) {
                console.error('无法求解公式:', ' Vx= ', this.Vx, ' Vy= ', this.Vy, ' this.Py= ', this.Py, ' posY= ', (Vyl + this.Vy) / 2 * t);
                return false;
            }
        }
        return true;
    }

    calculateSpeedY() {
        let t = ((this.Px ** 2 + this.Py ** 2) ** 0.5) / this.speed;
        this.Vx = this.Px / t;
        //this.Vz = this.Pz / t;
        this.Vy = (this.Py * 2 / t + this.accSpeed * t) / 2;
        return true;
    }

    //拖动目标点
    private _touchArrowTargetMoveEvent(event: EventTouch) {
        event.getUILocation(_tmpVec2);
        _tmpVec3.set(_tmpVec2.x, _tmpVec2.y, 0);
        this.arrowTarget.setPosition(_tmpVec3);
    }

    //拖动目标点结束，开始射箭
    private _touchArrowTargetEndEvent(event: EventTouch) {
        event.getUILocation(_tmpVec2);
        _tmpVec3.set(_tmpVec2.x, _tmpVec2.y, 0);
        this.arrowTarget.setPosition(_tmpVec3);
        this.onArcheryClick();
    }

    //拖动发射点
    private _touchArrowRootMoveEvent(event: EventTouch) {
        event.getUILocation(_tmpVec2);
        _tmpVec3.set(_tmpVec2.x, _tmpVec2.y, 0);
        this.arrowRoot.setPosition(_tmpVec3);
    }

    //拖动发射点结束，开始射箭
    private _touchArrowRootEndEvent(event: EventTouch) {
        event.getUILocation(_tmpVec2);
        _tmpVec3.set(_tmpVec2.x, _tmpVec2.y, 0);
        this.arrowRoot.setPosition(_tmpVec3);
        this.onArcheryClick();
    }

    //设置初始速度大小并开始射箭
    onSetSpeedEditClick() {
        if (this.speedEdit) {
            this.speed = parseFloat(this.speedEdit.string);
            this.onArcheryClick();
        }
    }

    //设置加速度大小并开始射箭
    onSetAccSpeedEditClick() {
        if (this.accSpeedEdit) {
            this.accSpeed = parseFloat(this.accSpeedEdit.string);
            this.onArcheryClick();
        }
    }
}
