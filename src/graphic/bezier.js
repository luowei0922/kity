/**
 * 贝塞尔曲线
 */

define( function ( require, exports, module ) {

    var Utils = require( "core/utils" ),
        BezierUtil = {

            /*
             * 把给定的点的控制点转换为绝对坐标
             * @param points 需要转换的单个BezierPoint对象或者数组
             * @return 返回一个新的PlainObject对象，该对象的有三个key， 其中point代表原BezierPoint对象的顶点，
             *          forward代表原BezierPoint对象的前置控制点， backward代表原BezierPoint对象的后置控制点。
             *          每一个点也是PlainObject， 都有x、y两个属性， 分别代表点的x、y轴坐标。
             *
             *          如果传递的参数是一个数组， 则返回值也是一个数组。 数组的每个元素是之前描述的PlainObject对象。
             */
            parseToAbsolute: function ( points ) {

                var result = [];

                Utils.each( points, function ( bezierPoint ) {

                    //顶点
                    var vertex = bezierPoint.getPoint(),
                        forwardControlPoint = bezierPoint.getForward(),
                        backwardControlPoint = bezierPoint.getBackward();

                    result.push( {
                        point: {
                            x: vertex.x,
                            y: vertex.y
                        },
                        forward: {
                            x: vertex.x + forwardControlPoint.x,
                            y: vertex.y + forwardControlPoint.y
                        },
                        backward: {
                            x: vertex.x + backwardControlPoint.x,
                            y: vertex.y + backwardControlPoint.y
                        }
                    } );

                } );

                return result;

            }

        };

    return require( "core/class" ).createClass( 'Bezier', {

        mixins: [ require( "graphic/pointcontainer" ) ],

        base: require( "graphic/path" ),

        constructor: function ( points ) {

            this.callBase();

            points = points || [];

            this.changeable = true;
            this.setPoints( points );

        },

        //当点集合发生变化时采取的动作
        onContainerChanged: function () {

            if ( this.changeable ) {
                this.update();
            }

        },

        update: function () {


            var drawer = null,
                points = this.getPoints(),
                //把控制点转化为绝对坐标
                absolutePoints = null;

            //单独的一个点不画任何图形
            if ( points.length < 2 ) {
                return;
            }

            absolutePoints = BezierUtil.parseToAbsolute( points );

            drawer = this.getDrawer();

            //重绘需要clear掉
            drawer.clear();

            if ( !absolutePoints.length ) {
                return this;
            }

            drawer.moveTo( absolutePoints[ 0 ].point.x, absolutePoints[ 0 ].point.y );

            for ( var i = 1, point, forward, backward, len = absolutePoints.length - 1; i <= len; i++ ) {

                point = absolutePoints[ i ].point;
                backward = absolutePoints[ i ].backward;
                forward = absolutePoints[ i - 1 ].forward;

                drawer.besierTo( forward.x, forward.y, backward.x, backward.y, point.x, point.y );

            }

            return this;

        }

    } );

} );