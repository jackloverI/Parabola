# Parabola
- 两种抛物线算法
- 已知条件：初速度、重力加速度
- 目的：求出从任意起点发射，必过任意目标点的一条曲线
##1.固定初速度大小 
- 计算初始的Vx和Vy
```typescript
calculateSubSpeed();
```
###此算法比较常规，就是一个解三元一次方程式的通用公式

##2.不固定初速度大小，
- 尽量接近初速度
```typescript
calculateSpeedY();
```
###1.计算无重力情况下初始点到目标点的总时间
```typescript
let t = ((this.Px ** 2 + this.Py ** 2) ** 0.5) / this.speed;
```
###2.速度在X轴上的分量
```typescript
this.Vx = this.Px / t;
```
###3.加上重力加速度因素，计算想要在一定时间内通过目标点，Vy的速度
```typescript
this.Vy = (this.Py * 2 / t + this.accSpeed * t) / 2;
```
