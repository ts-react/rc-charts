import React from 'react';
import classNames from 'classnames';
import {
  G2,
  Chart,
  Tooltip,
  Geom,
  Coord,
  Label,
  LabelProps,
  LegendProps, Legend
} from 'bizcharts';
import { DataView } from '@antv/data-set';
import FitText from 'rc-fit-text';
import { TPadding } from '@/global';
import './pie-chart.less';

const prefixCls = 'rc-pie-chart';

export interface IDataItem {
  x: string;
  y: number;
}

export interface IPieProps {
  className?: string;
  style?: React.CSSProperties;
  //
  type: 'polar' | 'theta';
  // 图表动画开关，默认为 true
  animate?: boolean;
  color?: string;
  colors?: string[];
  selected?: boolean;
  // 指定图表的高度，单位为 'px'
  height?: number;
  // 图表内边距
  padding?: TPadding;
  data: IDataItem[];
  total?: React.ReactNode | number | (() => React.ReactNode | number);
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  // 图例配置
  legend?: LegendProps;
  // 是否显示Label
  showLabel?: boolean;
  // 标注文本
  label?: LabelProps;
  titleMap?: {
    [key: string]: any;
  };
  // 是否显示tooltip
  tooltip?: boolean;
  // 设置半径，[0-1]的小数
  radius?: number;
  // 内部极坐标系的半径，[0-1]的小数
  innerRadius?: number;
  lineWidth?: number;
  // 百分比显示
  percent?: number;
  // 图表的宽度自适应开关
  forceFit?: boolean;
  // 获取 chart 实例的回调
  onGetG2Instance?: (chart: G2.Chart) => void;
}

const scale = {
  x: {
    type: 'cat',
    range: [0, 1],
  },
  y: {
    min: 0,
  },
};

const defaultScale = {
  x: {
    type: 'cat',
    range: [0, 1],
  },
  y: {
    min: 0,
  }
};

const PieChart: React.FC<IPieProps> = (props) => {
  const {
    className,
    style,
    type,
    height,
    forceFit,
    padding,
    animate,
    percent,
    color,
    colors,
    title,
    subTitle,
    label,
    showLabel,
    total,
    radius,
    legend,
    innerRadius,
    lineWidth,
    onGetG2Instance
  } = props;
  const [innerWidth, setInnerWidth] = React.useState<number>(0);

  const handleGetG2Instance = (chart: G2.Chart) => {
    setInnerWidth(chart.get('height') * innerRadius);
    onGetG2Instance && onGetG2Instance(chart);
  };

  const tooltipFormat: [
    string,
    (...args: any[]) => { name?: string; value: string }
    ] = [
    'x*percent',
    (x: string, p: number) => ({
      name: x,
      value: `${(p * 100).toFixed(2)}%`,
    }),
  ];

  const defaultColors = colors;
  let formatColor;
  let data = props.data || [];
  let tooltip = props.tooltip;
  let selected = props.selected;

  if (percent || percent === 0) {
    selected = false;
    tooltip = false;
    formatColor = (value: string) => {
      if (value === '占比') {
        return color || 'rgba(24, 144, 255, 0.85)';
      }
      return '#F0F2F5';
    };

    data = [
      {
        x: '占比',
        y: parseFloat(percent + ''),
      },
      {
        x: '反比',
        y: 100 - parseFloat(percent + ''),
      },
    ];
  }

  const dv = new DataView();
  dv.source(data).transform({
    type: 'percent',
    field: 'y',
    dimension: 'x',
    as: 'percent',
  });

  const cols = Object.assign({}, defaultScale, scale);

  return (
    <div
      className={classNames(className, {
        [`${prefixCls}`]: true
      })}
      style={style}
    >
      <div className={`${prefixCls}__chart`}>
        <Chart
          scale={type === 'theta' ? cols : undefined}
          height={height}
          forceFit={forceFit}
          data={dv}
          padding={padding}
          animate={animate}
          onGetG2Instance={handleGetG2Instance}
        >
          {/** 提示信息(tooltip)组件 */}
          {!!tooltip && <Tooltip showTitle={false} />}
          {/** 坐标系组件 */}
          <Coord
            type={type}
            radius={radius}
            innerRadius={innerRadius}
          />

          {/** 图例 */}
          <Legend {...legend}/>

          <Geom
            style={{ lineWidth, stroke: '#fff' }}
            tooltip={tooltip ? tooltipFormat : undefined}
            type={type === 'theta' ? 'intervalStack' : 'interval'}
            position={type === 'theta' ? 'percent' : 'x*percent'}
            color={
              [
                'x',
                percent || percent === 0 ? formatColor : defaultColors,
              ]
            }
            selected={selected}
          >
            {showLabel && (
              <Label content='percent' {...label}/>
            )}
          </Geom>
        </Chart>
        <FitText>
          <div
            className={`${prefixCls}__content`}
            style={{
              width: innerWidth,
              height: +innerWidth,
              padding: innerWidth * 0.2
            }}
          >
            <div>
              {title && (
                <h4>{title}</h4>
              )}
              {total && (
                <p>{typeof total === 'function' ? total() : total}</p>
              )}
              {subTitle && <h5>{subTitle}</h5>}
            </div>
          </div>
        </FitText>
      </div>
    </div>
  )
};

PieChart.defaultProps = {
  type: 'theta',
  animate: true,
  forceFit: true,
  showLabel: false,
  height: 400,
  radius: 1,
  innerRadius: 0,
  lineWidth: 1,
  legend: {
    visible: false
  },
  data: [],
  padding: 'auto'
};

export default PieChart;
