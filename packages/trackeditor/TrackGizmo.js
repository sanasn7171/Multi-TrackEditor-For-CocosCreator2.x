class FishTrackGizmo extends Editor.Gizmo
{
  selectedIdx = -1;
  timeout = -1;

  init ()
  { }
  onDestroy ()
  {
  }

  onCreateMoveCallbacks() {
    // 创建 gizmo 操作回调

    // 申明一些局部变量
    let start_vertex;        // 按下鼠标时记录的位置
    let pressx, pressy;     // 按下鼠标时记录的鼠标位置

    return {
      /**
       * 在 gizmo 上按下鼠标时触发
       * @param x 按下点的 x 坐标
       * @param y 按下点的 y 坐标
       * @param event mousedown dom event
       */
      start: (x, y, event, i, type) => {
          if(type == "line") {/*
              let target = this.target;
              let nextPoint = i == target.wayPoints.length-1 ? target.wayPoints[0] : target.wayPoints[i+1];
              let p = cc.v2((target.wayPoints[i].x + nextPoint.x)/2, (target.wayPoints[i].y + nextPoint.y)/2);
              target.wayPoints.splice(i+1, 0, p);*/
              return ;
          }

          if(this.selectedIdx === i) {
              if(this.target.wayPoints.length <= 3) return ;
              this.target.wayPoints.splice(i, 1);
              this.target.wayPoints = this.target.wayPoints;
              return ;
          }
          this.selectedIdx = i;
          clearTimeout(this.timeout);
          this.timeout = setTimeout(() => {
              this.selectedIdx = -1;
          }, 500);
          start_vertex = null;
          pressx = x;
          pressy = y;
      },

      /**
       * 在 gizmo 上按下鼠标移动时触发
       * @param dx 鼠标移动的 x 位移
       * @param dy 鼠标移动的 y 位移
       * @param event mousedown dom event
       */
      update: (dx, dy, event, i, type) => {
          if(type == "line") return ;
        // 获取 gizmo 依附的组件
        let target = this.target;
        if (!start_vertex) {
          start_vertex = target.wayPoints[i].clone();
        }
        target.wayPoints[i].x = start_vertex.x + dx / this._view.scale;
        target.wayPoints[i].y = start_vertex.y + dy / this._view.scale;
        target.wayPoints = target.wayPoints;
        // this.adjustValue(target);
      },

      /**
       * 在 gizmo 抬起鼠标时触发
       * @param event mousedown dom event
       */
      end: (updated, event) => {
      }
    };
  }

  onCreateRoot()
  {
    this._tool = this._root.group();
    let target = this.target;

    const circles = [];
    const lines = [];

    // 定義plot函數
    this._tool.plot = (points, position) => 
    {
      // 移动到节点位置
      this._tool.move(position.x, position.y);

      // 清除原来的点
      circles.forEach(v => v.radius(0));
      lines.forEach(v => v.plot(0, 0, 0, 0));

      for(let i=0; i<points.length; i++) 
      {
        // 轉換世界座標為視窗座標
        let v = points[i];
        v = Editor.GizmosUtils.snapPixelWihVec2(v.mul(this._view.scale)); 

        // 繪製圓形
        let circle = circles[i];
        // 初始化
        if(!circle) 
        {
          // 設定圓形顏色
          let circleColor;
          switch (i) {
            case 0:
              circleColor = 'rgba(255,255,255,0.9)'
              break;
            case points.length-1:
              circleColor = 'rgba(255,0,0,0.9)'
              break;
          
            default:
              circleColor = 'rgba(0,128,255,0.9)'
              break;
          }

          circle = circles[i] = this._tool.circle()
          .fill({ color: circleColor })
          .style('pointer-events', 'fill')
          .style('cursor', 'move');
          // 注册点击事件
          this.registerMoveSvg(circle, [i, "circle"], { cursor: 'pointer' });
        }
        circle.center(v.x, -v.y).radius(10 * this._view.scale); // 繪製圓形於SceneView

      }  // for 

      let line = null;
        
      let pointAmount = 500; // 線段節點數
      let preSlicedPoint = Editor.GizmosUtils.snapPixelWihVec2(points[0].mul(this._view.scale));
      let nextSlicedPoint = cc.v2(0,0);
      
      for(let i_point=0;i_point<pointAmount;i_point++)
      {
        // 初始化
        let lineColor = 'rgba('+target.lineColor.r+','+target.lineColor.g+','+target.lineColor.b+','+target.lineColor.a+')';
        let lineIndex =  i_point;
        line = lines[lineIndex]; // 定義線段ID
        if(!line) // 定義線段屬性
        { 
          line = lines[lineIndex] = this._tool.line()
          .stroke({ color: lineColor });

          this.registerMoveSvg(line, [lineIndex, "line"]); // 注册点击事件
        }

        let tempPoint = i_point / pointAmount; // 線段節點比例

        let tempX = this.InterpX(tempPoint,points);
        let tempY = this.InterpY(tempPoint,points);
        let tempNextSlicedPoint = cc.v2(tempX,tempY);
        if(tempNextSlicedPoint!=null)
        {
          nextSlicedPoint = Editor.GizmosUtils.snapPixelWihVec2(tempNextSlicedPoint.mul(this._view.scale)); 
        }
        
        line.plot(preSlicedPoint.x, -preSlicedPoint.y, nextSlicedPoint.x, -nextSlicedPoint.y).stroke({ width: 4 * this._view.scale }); // 繪製線條於SceneView
        preSlicedPoint = nextSlicedPoint;
      }// for
    };  // _tool.plot
  }    // onCreateRoot

	InterpX(t,pts)
  {
    let numSections = pts.length ;
    let currPt = Math.min(Math.floor(t *  numSections), numSections - 1);
    
    if(!pts[currPt]){
      return pts[pts.length-1].x;
    }

    let u = t * numSections -  currPt;
    let ax=(!pts[currPt])?pts[pts.length-1].x:pts[currPt].x;
    let bx=(!pts[currPt+1])?pts[pts.length-1].x:pts[currPt+1].x;
    let cx=(!pts[currPt+2])?pts[pts.length-1].x:pts[currPt+2].x;
    let dx=(!pts[currPt+3])?pts[pts.length-1].x:pts[currPt+3].x;

    return 0.5*((-ax+3*bx-3*cx+dx)*(u*u*u)+(2*ax-5*bx+4*cx-dx)*(u*u)+(-ax+cx)*u+2*bx);
	}

  InterpY(t,pts)
  {
    let numSections = pts.length ;
    let currPt = Math.min(Math.floor(t *  numSections), numSections - 1);
    
    if(!pts[currPt]){
      return pts[pts.length-1].y;
    }
    
    let u = t * numSections -  currPt;
    let ay=(!pts[currPt])?pts[pts.length-1].y:pts[currPt].y;
    let by=(!pts[currPt+1])?pts[pts.length-1].y:pts[currPt+1].y;
    let cy=(!pts[currPt+2])?pts[pts.length-1].y:pts[currPt+2].y;
    let dy=(!pts[currPt+3])?pts[pts.length-1].y:pts[currPt+3].y;

    return 0.5*((-ay+3*by-3*cy+dy)*(u*u*u)+(2*ay-5*by+4*cy-dy)*(u*u)+(-ay+cy)*u+2*by);
	}

  // 計算貝茲爾曲線
  CalculateBezierPointForCubic(t,p0,p1,p2,p3) 
  {
    // 轉換世界座標為視窗座標
      p0 = Editor.GizmosUtils.snapPixelWihVec2(p0.mul(this._view.scale)); 
      p1 = Editor.GizmosUtils.snapPixelWihVec2(p1.mul(this._view.scale)); 
      p2 = Editor.GizmosUtils.snapPixelWihVec2(p2.mul(this._view.scale)); 
      p3 = Editor.GizmosUtils.snapPixelWihVec2(p3.mul(this._view.scale)); 

      var point = cc.v2(0,0);
      var temp = 1 - t;
      point.x = p0.x * temp * temp * temp + 3 * p1.x * t * temp * temp + 3 * p2.x * t * t * temp + p3.x * t * t * t;
      point.y = p0.y * temp * temp * temp + 3 * p1.y * t * temp * temp + 3 * p2.y * t * t * temp + p3.y * t * t * t;
      return point;
  }

  onUpdate() {
    // 更新 svg 工具

    // 获取 gizmo 依附的组件
    let target = this.target;

    // 获取 gizmo 依附的节点
    let node = this.node;

    // // 获取节点世界坐标
    let position = node.convertToWorldSpaceAR(cc.v2(0, 0));

    // 转换世界坐标到 svg view 上
    // svg view 的坐标体系和节点坐标体系不太一样，这里使用内置函数来转换坐标
    position = this.worldToPixel(position);

    // 对齐坐标，防止 svg 因为精度问题产生抖动
    position = Editor.GizmosUtils.snapPixelWihVec2(position);

    // 移动 svg 工具到坐标
    this._tool.plot(target.wayPoints, position);
  }

  // Gizmos可視性
  visible ()  
  {
    return this.target.isActivedTrack;
  }
}

module.exports = FishTrackGizmo;