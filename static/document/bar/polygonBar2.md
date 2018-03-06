

```json
     width: 700, // svg的宽
      height: 300, // svg的高
      dur: 750, // 动画过渡时间
      tooltip: { // 提示框配置
        show: true // 是否显示提示框
      },
      itemStyle: { // 图形样式
        margin: { // 图形距离svg容器的边框
          top: 20, // 上边距
          right: 40, // 右边距
          bottom: 40, // 下边距
          left: 40 // 左边距
        },
        colors: [ // 图形填充色
          ['#17bec7', '#11244e'], 
          ['#6f44d1', '#0a0d38'],
          ['#0578d1', '#11286b'] 
        ],
        gradient: { // 渐变配置项
          x1: '0%', // 渐变X轴开始位置 
          y1: '0%', // 渐变Y轴开始位置
          x2: '0%', // 渐变X轴结束位置
          y2: '100%', // 渐变Y轴结束位置
          offset1: '0%', // 渐变色开始位置（<stop>标签使用）
          offset2: '100%', // 渐变色结束位置（<stop>标签使用）
          opacity1: 1, // 渐变色开始位置透明度
          opacity2: 1 // 渐变色结束位置透明度
        }, 
        hover: { // hover事件配置
          colors: [ // 图形填充色
            ['#008efc', '#1f75ff'],
            ['#3f4599', '#3f4599'],
            ['#5810ed', '#5810ed'] 
          ]
        }
      },
      topText: { // 顶部文字配置
        fontSize: 16, // 字体大小
        fill: '#fff', // 字体颜色
        textAnchor: 'middle' // 字体对齐方向
      }
      yAxis: { // y轴配置项
        axisLine: { // 轴线配置
          show: true // 是否显示轴线
        },
        gridLine: { // 网格张配置
          show: true // 是滞显示网格线
        },
        ticks: 5 // 刻度  
      }, 
      xText: { // x轴文字配置
        fontSize: 16, // 字体大小
        fill: '#fff', // 字体颜色
        textAnchor: 'middle' // 字体对齐方向
      }
```

