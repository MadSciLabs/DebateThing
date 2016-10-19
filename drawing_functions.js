var IRIS_COLOR			=	"rgba(200,80,0,255)",
	GAZE_COLOR			=	"rgba(240,96,0,255)",
	BLACK_COLOR         =   "#000000",
	POINTS_COLOR	    =   "rgba(0,255,255,255)",
	SPLINES_COLOR       =   "rgba(176,196,222,160)",
	X_AXIS_COLOR        =   "rgba(255,0,0,0.2)",
	Y_AXIS_COLOR        =   "rgba(0,255,0,0.2)",
	Z_AXIS_COLOR        =   "rgba(0,0,255,0.2)";
	
var styles = {'LINE' : 0, 'LINELOOP' : 1, 'POINT' : 2, 'SPLINE' : 3}


/*
* Draw spline
*/
function drawSpline2D(points, color, resolution)
{
	var oldWidth = canCon.lineWidth;
	var step = 1 / resolution;

	canCon.beginPath();
	canCon.strokeStyle = color;
	canCon.lineWidth = 2; //0.05;
	canCon.moveTo(points[0], points[1]);

	var newPoints = [];

	for (var i = 0; i < resolution; i++)
	{
		var t = step * i;
		var B0 = Math.pow((1-t), 3)
		var B1 = 3 * t * Math.pow((1-t), 2);
		var B2 = 3 * Math.pow(t, 2) * (1-t)
		var B3 = Math.pow(t, 3);

		var px = (B0 * points[0]) + (B1 * points[2]) + (B2 * points[4]) + (B3 * points[6]);
		var py = (B0 * points[1]) + (B1 * points[3]) + (B2 * points[5]) + (B3 * points[7]);

		newPoints.push([px, py]);
	}

	newPoints.push([points[6], points[7]]);

	for (var i = 1; i < newPoints.length; i++)
	{
		canCon.lineTo(newPoints[i][0], newPoints[i][1]);
		canCon.stroke();
	}

	canCon.closePath();
	canCon.lineWidth = oldWidth;
}

/*
* Draw lines using canvas draw methods
*/
function drawPoints2D(points, pointsNum, style, featurePoints2D, color, radius)
{
	V = [];

	canCon.beginPath();
	canCon.closePath();
	
	var n = 0;
	for (var i = 0; i < pointsNum*2; i+=2){
		if (featurePoints2D.FPIsDefined(points[i],points[i+1]) === true){
			var x = featurePoints2D.getFPPos(points[i],points[i+1])[0]*canvas.width;
			var y = (1 - featurePoints2D.getFPPos(points[i],points[i+1])[1])*canvas.height;

			if (style === styles.SPLINE)
				createKnot(x,y);
			else
			{
				if (style === styles.POINT){
					canCon.beginPath();
					canCon.fillStyle = BLACK_COLOR;
					canCon.arc(x,y,radius,0,2*Math.PI,true);
					canCon.closePath();
					canCon.fill();
					//
					canCon.beginPath();
					canCon.fillStyle = color;
					canCon.arc(x,y,radius*0.6,0,2*Math.PI,true);
					canCon.closePath();
					canCon.fill();
				}
				if (style === styles.LINE){
					if (n%2 === 0){
						canCon.beginPath();
						canCon.moveTo(x,y);
					}
					else {
						canCon.lineTo(x,y);
						canCon.strokeStyle = color;
						canCon.stroke();
						canCon.closePath();
					}
				}
				if (style === styles.LINELOOP){
					if (n==0){
						canCon.beginPath();
						canCon.moveTo(x,y);
					}
					else{
						canCon.lineTo(x,y);
						canCon.strokeStyle = color;
						canCon.stroke();
						canCon.closePath();
						canCon.beginPath();
						canCon.moveTo(x,y);
					}
				}
			}
			
			n++;
		}
	}

	if (style === styles.SPLINE)
	{
		updateSplines();
		for (var m=0; m< S.length;m++)
		{
			for (var l=0; l< S[m].length;l+=2)
			{
				drawSpline2D (S[m], color, splineResolution);
			}
		}
	}
			
	if (style == styles.LINELOOP){
		var x = featurePoints2D.getFPPos(points[0],points[1])[0]*canvas.width;
		var y = (1 - featurePoints2D.getFPPos(points[0],points[1])[1])*canvas.height;
		canCon.lineTo(x,y);
		canCon.strokeStyle = color;
		canCon.stroke();
		canCon.closePath();
	}
}

/*
* Draw facial features
*/
function drawFaceFeatures(faceData)
{
	var radius = (faceData.faceScale / mWidth) * 10;
	
	var chinPoints = [
		2,	1,
	]

	drawPoints2D(chinPoints, 1, styles.POINT,  faceData.getFeaturePoints2D(),POINTS_COLOR,radius);

	
	var innerLipPoints = [
		2,	2,
		2,	6,
		2,	4,
		2,	8,
		2,	3,
		2,	9,
		2,	5,
		2,	7,
	]

	var upperInnerLipPoints = [
		2,	5,
		2,	7,
		2,	2,
		2,	6,
		2,	4,
	]

	var lowerInnerLipPoints = [
		2,	5,
		2,	9,
		2,	3,
		2,	8,
		2,	4,
	]

	drawPoints2D(upperInnerLipPoints, 5, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(lowerInnerLipPoints, 5, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(innerLipPoints, 8, styles.POINT, faceData.getFeaturePoints2D(), POINTS_COLOR,radius);

	var outerLipPoints = [
		8,	1,
		8,	10,
		8,	5,
		8,	3,
		8,	7,
		8,	2,
		8,	8,
		8,	4,
		8,	6,
		8,	9,
	]

	var upperOuterLipPointsLeft = [
		8,	4,
		8,	6,
		8,	9,
		8,	1,
	]

	var upperOuterLipPointsRight = [
		8,	1,
		8,	10,
		8,	5,
		8,	3,
	]

	var lowerOuterLipPoints = [
		8,	4,
		8,	8,
		8,	2,
		8,	7,
		8,	3,
	]

	drawPoints2D(upperOuterLipPointsLeft, 4, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(upperOuterLipPointsRight, 4, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(lowerOuterLipPoints, 5, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(outerLipPoints, 10, styles.POINT,faceData.getFeaturePoints2D(),POINTS_COLOR,radius);

	var nosePoints = [
		9,	1,
		9,	2,
		9,	3,
		9,	15,
	]
	var noseLinesPoints = [
		9,	1,
		9,	3,
		9,	2
	]

	drawPoints2D(nosePoints, 4, styles.POINT,faceData.getFeaturePoints2D(),POINTS_COLOR,radius);
	drawPoints2D(noseLinesPoints, 3, styles.SPLINE,faceData.getFeaturePoints2D(),SPLINES_COLOR);

	if(faceData.getEyeClosure()[0])
	{
		//if eye is open, draw the iris
		var irisPoints = [
			3,	6,
		]
		drawPoints2D(irisPoints, 1,styles.POINT, faceData.getFeaturePoints2D(),IRIS_COLOR,radius);
	}
	
	if(faceData.getEyeClosure()[1])
	{
		//if eye is open, draw the iris
		var irisPoints = [
			3,	5,
		]
		drawPoints2D(irisPoints, 1,styles.POINT, faceData.getFeaturePoints2D(),IRIS_COLOR,radius);
	}

	var eyesPointsR = [
		3,	2,
		3,	4,
		3,	8,
		3,	10,
		3,	12,
		3,	14,
		12, 6,
		12, 8,
		12, 10,
		12, 12,
	]
	var eyesPointsL = [
		3,	1,
		3,	3,
		3,	7,
		3,	9,
		3,	11,
		3,	13,
		12, 5,
		12, 7,
		12, 9,
		12, 11,
	]
	var rightEyeOuterUpper = [
		3,	12,
		3,	14,
		3,	8,
	]
	var rightEyeOuterLower = [
		3,	12,
		3,	10,
		3,	8,
	]
	var rightEyeInnerUpper = [
		3,	12,
		12, 10,
		3,	2,
		12, 6,
		3,	8,
	]
	var rightEyeInnerLower = [
		3,	12,
		12, 12,
		3,  4,
		12,	8,
		3,	8,
	]

	var leftEyeOuterUpper = [
		3,	11,
		3,	13,
		3,	7,
	]
	var leftEyeOuterLower = [
		3,	11,
		3,	9,
		3,	7,
	]
	var leftEyeInnerUpper = [
		3,	11,
		12, 9,
		3,	1,
		12, 5,
		3,	7,
	]
	var leftEyeInnerLower = [
		3,	11,
		12, 11,
		3,  3,
		12,	7,
		3,	7,
	]

	//draw points for right eye
	if(faceData.getEyeClosure()[1])
	{
		drawPoints2D(eyesPointsR, 10, styles.POINT,faceData.getFeaturePoints2D(),POINTS_COLOR,radius);
	}
	else if (!faceData.getEyeClosure()[1])
	{
		drawPoints2D(eyesPointsR, 10, styles.POINT,faceData.getFeaturePoints2D(),BLACK_COLOR,radius);
	}

	//draw points for left eye
	if(faceData.getEyeClosure()[0])
	{
		drawPoints2D(eyesPointsL, 10, styles.POINT,faceData.getFeaturePoints2D(),POINTS_COLOR,radius);
	}
	else if (!faceData.getEyeClosure()[0])
	{
		drawPoints2D(eyesPointsL, 10, styles.POINT,faceData.getFeaturePoints2D(),BLACK_COLOR,radius);
	}

	//draw lines for both eyes
	drawPoints2D(rightEyeOuterUpper, 3, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(rightEyeOuterLower, 3, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(rightEyeInnerUpper, 5, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(rightEyeInnerLower, 5, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	//
	drawPoints2D(leftEyeOuterUpper, 3, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(leftEyeOuterLower, 3, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(leftEyeInnerUpper, 5, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(leftEyeInnerLower, 5, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);

	//draw eyebrows
	var eyebrowPoints = [
		4,	1,
		4,	2,
		4,	3,
		4,	4,
		4,	5,
		4,	6,
		14, 1,
		14, 2,
		14, 3,
		14, 4,
	]
	var leftEyebrow = [
		4,	6,
		14, 4,
		4,	4,
		14, 2,
		4,	2,
	]
	var rightEyebrow = [
		4,	1,
		14, 1,
		4,	3,
		14, 3,
		4,	5,
	]

	drawPoints2D(leftEyebrow, 5, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(rightEyebrow, 5, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
	drawPoints2D(eyebrowPoints, 10, styles.POINT,faceData.getFeaturePoints2D(),POINTS_COLOR,radius);
    
    // visible contour
	var contourPointsVisible = [
		13,	1,
		13,	3,
		13,	5,
		13,	7,
		13,	9,
		13,	11,
		13,	13,
		13,	15,
		13,	17,
		13,	16,
		13,	14,
		13,	12,
		13,	10,
		13,	8,
		13,	6,
		13,	4,
		13,	2
	]
    
    drawPoints2D(contourPointsVisible, 17, styles.SPLINE, faceData.getFeaturePoints2D(), SPLINES_COLOR);
    drawPoints2D(contourPointsVisible, 17, styles.POINT, faceData.getFeaturePoints2D(), POINTS_COLOR,radius);
}


function multiplyMatrix(m1, m2, M, N, P) {
	
	var res = [];
	for(var i = 0; i < M; ++i)
	{
		for(var j = 0; j < P; ++j)
		{
			var sum = 0;
			for(var k = 0; k < N; ++k)
			{
				sum = sum + m1[i*N+k] * m2[k*P+j];
			}
			res[i*P+j] = sum;
		}
	}
	
	return res;
}

function drawFaceModelAxes(trackData){
	
	//set projection
	var f = 3;
	
	var x_offset = 1;
	var y_offset = 1;
	
	
	if (canvas.width > canvas.height)
		x_offset = canvas.width / canvas.height;
	else if (canvas.width < canvas.height)
		y_offset = canvas.height / canvas.width;
	
	
	var frustum_near = 0.001;
	var frustum_far = 30;
	var frustum_x = x_offset*frustum_near/f;
	var frustum_y = y_offset*frustum_near/f;
	
	var A = (frustum_x - frustum_x)/(frustum_x + frustum_x);
	var B = (frustum_y - frustum_y)/(frustum_y + frustum_y);
	var C = - ((frustum_far + frustum_near)/(frustum_far - frustum_near));
	var D = - ((2*frustum_near*frustum_far)/(frustum_far-frustum_near));
	var x1 = (2*frustum_near)/(frustum_x+frustum_x);
	var y2 = (2*frustum_near)/(frustum_y+frustum_y);
	var frustumMatrix = [x1, 0,  0,  0,
						0,  y2, 0,  0,
						A,  B,  C, -1,
						0,  0,  D,  0 ]; 
		
	var camera = [0, 0, 10];
	var origin = [0, 0, 0];
	var destX = [-1, 0, 0];
	var destY = [0, -1, 0];
	var destZ = [0, 0, 1];
	
	var sinrx = Math.sin(-trackData.getFaceRotation()[0]);
	var sinry = Math.sin(trackData.getFaceRotation()[1]);
	var sinrz = Math.sin(-trackData.getFaceRotation()[2]);
	var cosrx = Math.cos(trackData.getFaceRotation()[0]);
	var cosry = Math.cos(trackData.getFaceRotation()[1]);
	var cosrz = Math.cos(trackData.getFaceRotation()[2]);
	
	//set the rotation matrix
	var R00 = cosry*cosrz+sinrx*sinry*sinrz;
	var R01 = -cosry*sinrz+sinrx*sinry*cosrz;
	var R02 = cosrx*sinry;
	var R10 = cosrx*sinrz;
	var R11 = cosrx*cosrz;
	var R12 = -sinrx;
	var R20 = -sinry*cosrz+sinrx*cosry*sinrz;
	var R21 = sinry*sinrz+sinrx*cosry*cosrz;
	var R22 = cosrx*cosry;
	
	//apply rotation
	var dest_new_origin = [0,0,0];
	dest_new_origin[0] = 1*(R00*origin[0]+R01*origin[1]+R02*origin[2]);
	dest_new_origin[1] = 1*(R10*origin[0]+R11*origin[1]+R12*origin[2]);
	dest_new_origin[2] = 1*(R20*origin[0]+R21*origin[1]+R22*origin[2]);
	
	var dest_new_x = [0,0,0];
	dest_new_x[0] = 1*(R00*destX[0]+R01*destX[1]+R02*destX[2]);
	dest_new_x[1] = 1*(R10*destX[0]+R11*destX[1]+R12*destX[2]);
	dest_new_x[2] = 1*(R20*destX[0]+R21*destX[1]+R22*destX[2]);
	
	var dest_new_y = [0,0,0];
	dest_new_y[0] = 1*(R00*destY[0]+R01*destY[1]+R02*destY[2]);
	dest_new_y[1] = 1*(R10*destY[0]+R11*destY[1]+R12*destY[2]);
	dest_new_y[2] = 1*(R20*destY[0]+R21*destY[1]+R22*destY[2]);
	
	var dest_new_z = [0,0,0];
	dest_new_z[0] = 1*(R00*destZ[0]+R01*destZ[1]+R02*destZ[2]);
	dest_new_z[1] = 1*(R10*destZ[0]+R11*destZ[1]+R12*destZ[2]);
	dest_new_z[2] = 1*(R20*destZ[0]+R21*destZ[1]+R22*destZ[2]);
	
	//project on the screen
	var destPomOrigin = [dest_new_origin[0],dest_new_origin[1],dest_new_origin[2] - camera[2],1];
	var resultOrigin = multiplyMatrix(destPomOrigin,frustumMatrix,1,4,4);
	
	var destPomX = [dest_new_x[0],dest_new_x[1],dest_new_x[2] - camera[2],1];
	var resultX = multiplyMatrix(destPomX,frustumMatrix,1,4,4);
	
	var destPomY = [dest_new_y[0],dest_new_y[1],dest_new_y[2] - camera[2],1];
	var resultY = multiplyMatrix(destPomY,frustumMatrix,1,4,4);
	//
	var destPomZ = [dest_new_z[0],dest_new_z[1],dest_new_z[2] - camera[2],1];
	var resultZ = multiplyMatrix(destPomZ,frustumMatrix,1,4,4);
	
	var left_eyebrow = trackData.getFeaturePoints2D().getFP(4,1);
	var right_eyebrow = trackData.getFeaturePoints2D().getFP(4,2);
	
	var center_position = [];
	
	if (left_eyebrow.defined === 1 && right_eyebrow.defined === 1){
		center_position[0] = (left_eyebrow.getPos(0) +  right_eyebrow.getPos(0))/2.0;
		center_position[1] = 1-((left_eyebrow.getPos(1) +  right_eyebrow.getPos(1))/2.0);
	}
	
	var center_pos = [center_position[0]*canvas.width, center_position[1]*canvas.height];
	
	var dest = [0, 0, 0];
	var destOrigin = [0, 0, 0];
	
	
	destOrigin[0] = (resultOrigin[0]/resultOrigin[3] + 1) * canvas.width / 2;
	destOrigin[1] = (resultOrigin[1]/resultOrigin[3] + 1) * canvas.height / 2;
	destOrigin[2] = (resultOrigin[2]/resultOrigin[3] + 1) / 2;
	
	dest[0] = (resultX[0]/resultX[3] + 1) * canvas.width / 2;
	dest[1] = (resultX[1]/resultX[3] + 1) * canvas.height / 2;
	dest[2] = (resultX[2]/resultX[3] + 1) / 2;
	
	//draw x axis
	canCon.beginPath();
	canCon.moveTo(center_pos[0],center_pos[1]);
	canCon.lineTo(center_pos[0]+(dest[0]- destOrigin[0]),(center_pos[1]+(dest[1]-destOrigin[1])));
	canCon.strokeStyle = X_AXIS_COLOR;
	canCon.lineWidth = 3;
	canCon.stroke();
	canCon.closePath();
	
	dest[0] = (resultY[0]/resultY[3] + 1) * canvas.width / 2;
	dest[1] = (resultY[1]/resultY[3] + 1) * canvas.height / 2;
	dest[2] = (resultY[2]/resultY[3] + 1) / 2;
	
	//draw y axis
	canCon.beginPath();
	canCon.moveTo(center_pos[0],center_pos[1]);
	canCon.lineTo(center_pos[0]+(dest[0]- destOrigin[0]),(center_pos[1]+(dest[1]-destOrigin[1])));
	canCon.strokeStyle = Y_AXIS_COLOR;
	canCon.lineWidth = 3;
	canCon.stroke();
	canCon.closePath();
	
	dest[0] = (resultZ[0]/resultZ[3] + 1) * canvas.width / 2;
	dest[1] = (resultZ[1]/resultZ[3] + 1) * canvas.height / 2;
	dest[2] = (resultZ[2]/resultZ[3] + 1) / 2;

	//draw z axis
	canCon.beginPath();
	canCon.moveTo(center_pos[0],center_pos[1]);
	canCon.lineTo(center_pos[0]+(dest[0]- destOrigin[0]),(center_pos[1]+(dest[1]-destOrigin[1])));
	canCon.strokeStyle = Z_AXIS_COLOR;
	canCon.lineWidth = 3;
	canCon.stroke();
	canCon.closePath();
}

function drawGaze(trackData){

	if (!trackData.getEyeClosure()[1])
		return;
	
	//set projection
	var f = trackData.cameraFocus;
	var x_offset = 1;
	var y_offset = 1;

	if (canvas.width > canvas.height)
		x_offset = canvas.width / canvas.height;
	else if (canvas.width < canvas.height)
		y_offset = canvas.height / canvas.width;
		
	var frustum_near = 0.001;
	var frustum_far = 30;
	var frustum_x = x_offset*frustum_near/f;
	var frustum_y = y_offset*frustum_near/f;
	
	var A = (frustum_x - frustum_x)/(frustum_x + frustum_x);
	var B = (frustum_y - frustum_y)/(frustum_y + frustum_y);
	var C = - ((frustum_far + frustum_near)/(frustum_far - frustum_near));
	var D = - ((2*frustum_near*frustum_far)/(frustum_far-frustum_near));
	var x1 = (2*frustum_near)/(frustum_x+frustum_x);
	var y2 = (2*frustum_near)/(frustum_y+frustum_y);
	var frustumMatrix = [x1, 0,  0,  0,
						0,  y2, 0,  0,
						A,  B,  C, -1,
						0,  0,  D,  0 ]; 
	
	var dest = [0,0,1];
	var camera = [0,0,10];
	var origin = [0,0,0];
	
	var sinrx = Math.sin(trackData.getGazeDirectionGlobal()[0]);
	var sinry = Math.sin(trackData.getGazeDirectionGlobal()[1]);
	var sinrz = Math.sin(trackData.getGazeDirectionGlobal()[2]);
	var cosrx = Math.cos(trackData.getGazeDirectionGlobal()[0]);
	var cosry = Math.cos(trackData.getGazeDirectionGlobal()[1]);
	var cosrz = Math.cos(trackData.getGazeDirectionGlobal()[2]);
	
	//set the rotation matrix
	var R00 = cosry*cosrz+sinrx*sinry*sinrz;
	var R01 = -cosry*sinrz+sinrx*sinry*cosrz;
	var R02 = cosrx*sinry;
	var R10 = cosrx*sinrz;
	var R11 = cosrx*cosrz;
	var R12 = -sinrx;
	var R20 = -sinry*cosrz+sinrx*cosry*sinrz;
	var R21 = sinry*sinrz+sinrx*cosry*cosrz;
	var R22 = cosrx*cosry;
	
	//apply rotation
	var dest_new = [0,0,0];
	dest_new[0] = 1*(R00*dest[0]+R01*dest[1]+R02*dest[2]);
	dest_new[1] = 1*(R10*dest[0]+R11*dest[1]+R12*dest[2]);
	dest_new[2] = 1*(R20*dest[0]+R21*dest[1]+R22*dest[2]);
	
	var dest_new_origin = [0,0,0];
	dest_new_origin[0] = 1*(R00*origin[0]+R01*origin[1]+R02*origin[2]);
	dest_new_origin[1] = 1*(R10*origin[0]+R11*origin[1]+R12*origin[2]);
	dest_new_origin[2] = 1*(R20*origin[0]+R21*origin[1]+R22*origin[2]);
	
	//project on the screen
	var destPomOrigin = [dest_new_origin[0],dest_new_origin[1],dest_new_origin[2]-camera[2],1];
	var resultOrigin = multiplyMatrix(destPomOrigin,frustumMatrix,1,4,4);
	
	var destPom = [dest_new[0],dest_new[1],dest_new[2]-camera[2],1];
	var result = multiplyMatrix(destPom,frustumMatrix,1,4,4);
	
	
	resultOrigin[0] = (resultOrigin[0]/resultOrigin[3] + 1)/2;
	resultOrigin[1] = (resultOrigin[1]/resultOrigin[3] + 1)/2;
	resultOrigin[2] = (resultOrigin[2]/resultOrigin[3] + 1)/2;

	result[0] = (result[0]/result[3] + 1)/2;
	result[1] = (result[1]/result[3] + 1)/2;
	result[2] = (result[2]/result[3] + 1)/2;
	
	
	var left_eye_2d_fp = trackData.getFeaturePoints2D().getFP(3,5);
	var right_eye_2d_fp = trackData.getFeaturePoints2D().getFP(3,6);
	
	var left_eye_2d_pos = [];
	var right_eye_2d_pos = [];
	
	if (left_eye_2d_fp.defined === 1 && right_eye_2d_fp.defined === 1){
		left_eye_2d_pos[0] = left_eye_2d_fp.getPos(0);
		left_eye_2d_pos[1] = left_eye_2d_fp.getPos(1);
		right_eye_2d_pos[0] = right_eye_2d_fp.getPos(0);
		right_eye_2d_pos[1] = right_eye_2d_fp.getPos(1);
	}
	
	//apply translation
	var left_gaze_x = result[0] - resultOrigin[0] + left_eye_2d_pos[0];
	var left_gaze_y = result[1] - resultOrigin[1] + left_eye_2d_pos[1];
	
	var right_gaze_x = result[0] - resultOrigin[0] + right_eye_2d_pos[0];
	var right_gaze_y = result[1] - resultOrigin[1] + right_eye_2d_pos[1];
	
	//draw left eye gaze
	canCon.beginPath();
	canCon.moveTo(left_eye_2d_pos[0]*canvas.width,(1 - left_eye_2d_pos[1])*canvas.height);
	canCon.lineTo(left_gaze_x*canvas.width,(1 - left_gaze_y)*canvas.height);
	canCon.strokeStyle = GAZE_COLOR;
	canCon.lineWidth = 2;
	canCon.stroke();
	canCon.closePath();
	
	//draw right eye gaze
	canCon.beginPath();
	canCon.moveTo(right_eye_2d_pos[0]*canvas.width,(1 - right_eye_2d_pos[1])*canvas.height);
	canCon.lineTo(right_gaze_x*canvas.width,(1 - right_gaze_y)*canvas.height);
	canCon.strokeStyle = GAZE_COLOR;
	canCon.lineWidth = 2;
	canCon.stroke();
	canCon.closePath();
}