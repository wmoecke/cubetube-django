class Cube {
    color[][][] voxels;
    int size;
    int scale;
    PVector center;
    PApplet parent;
    Cube(PApplet _parent)
    {	
	parent=_parent;
	size=8;
	scale=height/size/2;
	voxels=new color[size][size][size];
	center=new PVector(scale*(size-1)/2, scale*(size-1)/2, scale*(size-1)/2);
	//ortho();   //use orthographic projection (no perspective)
    }
    void draw()
    {
	//set the background color and mouse-controlled rotations
	parent.background(0);
	translate(width/2, height/2);
	rotateY(mouseX/60);
	rotateX(mouseY/60);

	for (int x=0; x<size; x++)
      	    for (int y=0; y<size; y++)
		for (int z=0; z<size; z++)
		    {
			pushMatrix();
			translate(scale*x-center.x, scale*(size-1-y)-center.y, scale* z-center.z);
			color voxelColor=voxels[x][y][z];
			stroke(255, 100);
			if (brightness(voxelColor)>0)
			    fill(voxelColor);
			else
			    noFill();
			box(scale);
			popMatrix();
		    }
    }
    void setVoxel(float x, float y, float z, color col)
    {
	PVector pos=new PVector(x,y,z);
	if ((pos.x>=0)&&(pos.x<size))
	    if ((pos.y>=0)&&(pos.y<size))
		if ((pos.z>=0)&&(pos.z<size))
		    voxels[(int)pos.x][(int)pos.y][(int)pos.z]=col;
    }

    void setVoxel(PVector pos, color col)
    {
	if ((pos.x>=0)&&(pos.x<size))
	    if ((pos.y>=0)&&(pos.y<size))
		if ((pos.z>=0)&&(pos.z<size))
		    voxels[(int)pos.x][(int)pos.y][(int)pos.z]=col;
    }

    void background(color col)
    {
	for (int x=0; x<size; x++)
	    for (int y=0; y<size; y++)
		for (int z=0; z<size; z++)
		    voxels[x][y][z]=col;
    }

    void sphere(PVector center, float radius, color col)
    {
	float steps=30;
	for (float theta=0; theta<steps; theta++)
	    for (float phi=0; phi<steps; phi++)
		setVoxel( new PVector((float)(center.x + radius * Math.sin((float) Math.PI *theta/ steps) * Math.cos((float) 2 * Math.PI *phi/ steps)), 
				      (float)(center.y + radius * Math.sin((float) Math.PI *theta/ steps) * Math.sin((float) 2 * Math.PI *phi/ steps)), 
				      (float)(center.z + radius * Math.cos((float) Math.PI *theta/ steps))), 
			  col);
    }


    void shell(float x, float y,float z, float r, color col)
    {
	float thickness =0.1;
	for(int i=0;i<size;i++)
	    for(int j=0;j<size;j++)
		for(int k=0;k<size;k++)
		    if(abs(sqrt(pow(i-x,2)+pow(j-y,2)+pow(k-z,2))-r)<thickness)
			setVoxel(i,j,k,col);
    }

    /** Draw a shell (empty sphere).                                                                                                                                                     
                                                                                                                                                                                     
  @param x Position of the center of the shell.                                                                                                                                      
  @param y Position of the center of the shell.                                                                                                                                      
  @param z Position of the center of the shell.                                                                                                                                      
  @param r Radius of the shell.                                                                                                                                                      
  @param thickness Thickness of the shell.                                                                                                                                           
  @param col Color of the shell.                                                                                                                                                     
    */
    void shell(float x, float y,float z, float r, float thickness, color col)
    {
	for(int i=0;i<size;i++)
	    for(int j=0;j<size;j++)
		for(int k=0;k<size;k++)
		    if(abs(sqrt(pow(i-x,2)+pow(j-y,2)+pow(k-z,2))-r)<thickness)
			setVoxel(i,j,k,col);
    }

    void shell(PVector p, float r, color col)
    {
	shell(p.x, p.y, p.z, r, col);
    }

    /** Draw a shell (empty sphere).                                                                                                                                                     
                                                                                                                                                                                     
  @param p Position of the center of the shell.                                                                                                                                      
  @param r Radius of the shell.                                                                                                                                                      
  @param thickness Thickness of the shell                                                                                                                                            
  @param col Color of the shell.                                                                                                                                                     
    */
    void shell(PVector p, float r, float thickness, color col)
    {
	shell(p.x, p.y, p.z, r, thickness, col);
    }

    

    // returns the color at the integer location closest
    // to the PVector point
    color getVoxel(PVector pos) {
	if ((pos.x>=0)&&(pos.x<size))
	    if ((pos.y>=0)&&(pos.y<size))
		if ((pos.z>=0)&&(pos.z<size))
		    return voxels[(int) pos.x][(int) pos.y][(int) pos.z];
	return color(0);
    }

    // draws a line from point p1 to p2 and colors each of the points according
    // to the col parameter
    // p1 and p2 can be outsize of the cube, but it will only draw the parts of
    // the line that fall
    // insize the cube
    void line(PVector p1, PVector p2, color col) {
	// thanks to Anthony Thyssen for the original write of Bresenham's line
	// algorithm in 3D
	// http://www.ict.griffith.edu.au/anthony/info/graphics/bresenham.procs

	float dx, dy, dz, l, m, n, dx2, dy2, dz2, i, x_inc, y_inc, z_inc, err_1, err_2;
	PVector currentPoint = new PVector(p1.x, p1.y, p1.z);
	dx = p2.x - p1.x;
	dy = p2.y - p1.y;
	dz = p2.z - p1.z;
	x_inc = (dx < 0) ? -1 : 1;
	l = Math.abs(dx);
	y_inc = (dy < 0) ? -1 : 1;
	m = Math.abs(dy);
	z_inc = (dz < 0) ? -1 : 1;
	n = Math.abs(dz);
	dx2 = l * 2;
	dy2 = m * 2;
	dz2 = n * 2;

	if ((l >= m) && (l >= n)) {
	    err_1 = dy2 - l;
	    err_2 = dz2 - l;
	    for (i = 0; i < l; i++) {
		setVoxel(currentPoint, col);
		if (err_1 > 0) {
		    currentPoint.y += y_inc;
		    err_1 -= dx2;
		}
		if (err_2 > 0) {
		    currentPoint.z += z_inc;
		    err_2 -= dx2;
		}
		err_1 += dy2;
		err_2 += dz2;
		currentPoint.x += x_inc;
	    }
	} else if ((m >= l) && (m >= n)) {
	    err_1 = dx2 - m;
	    err_2 = dz2 - m;
	    for (i = 0; i < m; i++) {
		setVoxel(currentPoint, col);
		if (err_1 > 0) {
		    currentPoint.x += x_inc;
		    err_1 -= dy2;
		}
		if (err_2 > 0) {
		    currentPoint.z += z_inc;
		    err_2 -= dy2;
		}
		err_1 += dx2;
		err_2 += dz2;
		currentPoint.y += y_inc;
	    }
	} else {
	    err_1 = dy2 - n;
	    err_2 = dx2 - n;
	    for (i = 0; i < n; i++) {
		setVoxel(currentPoint, col);
		if (err_1 > 0) {
		    currentPoint.y += y_inc;
		    err_1 -= dz2;
		}
		if (err_2 > 0) {
		    currentPoint.x += x_inc;
		    err_2 -= dz2;
		}
		err_1 += dy2;
		err_2 += dx2;
		currentPoint.z += z_inc;
	    }
	}

	setVoxel(currentPoint, col);
    }
  
    // draws a line from point p1 to p2 and colors each of the points according
    // to the col parameter
    // p1 and p2 can be outsize of the cube, but it will only draw the parts of
    // the line that fall
    // inside the cube
    void rainbowLine(PVector p1, PVector p2, color startColor, color endColor) {
	// thanks to Anthony Thyssen for the original write of Bresenham's line
	// algorithm in 3D
	// http://www.ict.griffith.edu.au/anthony/info/graphics/bresenham.procs

	float dx, dy, dz, l, m, n, dx2, dy2, dz2, i, x_inc, y_inc, z_inc, err_1, err_2;
	PVector currentPoint = new PVector(p1.x, p1.y, p1.z);
	dx = p2.x - p1.x;
	dy = p2.y - p1.y;
	dz = p2.z - p1.z;
	x_inc = (dx < 0) ? -1 : 1;
	l = Math.abs(dx);
	y_inc = (dy < 0) ? -1 : 1;
	m = Math.abs(dy);
	z_inc = (dz < 0) ? -1 : 1;
	n = Math.abs(dz);
	dx2 = l * 2;
	dy2 = m * 2;
	dz2 = n * 2;

	if ((l >= m) && (l >= n)) {
	    err_1 = dy2 - l;
	    err_2 = dz2 - l;
	    for (i = 0; i < l; i++) {
		setVoxel(currentPoint, lerpColor(startColor, endColor, currentPoint.dist(p1)/p2.dist(p1)));
		if (err_1 > 0) {
		    currentPoint.y += y_inc;
		    err_1 -= dx2;
		}
		if (err_2 > 0) {
		    currentPoint.z += z_inc;
		    err_2 -= dx2;
		}
		err_1 += dy2;
		err_2 += dz2;
		currentPoint.x += x_inc;
	    }
	} else if ((m >= l) && (m >= n)) {
	    err_1 = dx2 - m;
	    err_2 = dz2 - m;
	    for (i = 0; i < m; i++) {
		setVoxel(currentPoint, lerpColor(startColor, endColor, currentPoint.dist(p1)/p2.dist(p1)));
		if (err_1 > 0) {
		    currentPoint.x += x_inc;
		    err_1 -= dy2;
		}
		if (err_2 > 0) {
		    currentPoint.z += z_inc;
		    err_2 -= dy2;
		}
		err_1 += dx2;
		err_2 += dz2;
		currentPoint.y += y_inc;
	    }
	} else {
	    err_1 = dy2 - n;
	    err_2 = dx2 - n;
	    for (i = 0; i < n; i++) {
		setVoxel(currentPoint, lerpColor(startColor, endColor, currentPoint.dist(p1)/p2.dist(p1)));
		if (err_1 > 0) {
		    currentPoint.y += y_inc;
		    err_1 -= dz2;
		}
		if (err_2 > 0) {
		    currentPoint.x += x_inc;
		    err_2 -= dz2;
		}
		err_1 += dy2;
		err_2 += dx2;
		currentPoint.z += z_inc;
	    }
	}

	setVoxel(currentPoint, lerpColor(startColor, endColor, currentPoint.dist(p1)/p2.dist(p1)));
    }
  
  

    color colorMap(float val, float min, float max) {
	float range = 1024;
	val = map(val, min, max, 0, range);
	color colors[] = new color[6];
	colors[0] = color(0, 0, 255);
	colors[1] = color(0, 255, 255);
	colors[2] = color(0, 255, 0);
	colors[3] = color(255, 255, 0);
	colors[4] = color(255, 0, 0);
	colors[5] = color(255, 0, 255);
	if (val <= range / 6) {
	    return (lerpColor(colors[0], colors[1], val / (range / 6)));
	} else if (val <= 2 * range / 6)
	    return (lerpColor(colors[1], colors[2], 
			      (val / (range / 6)) - 1));
	else if (val <= 3 * range / 6)
	    return (lerpColor(colors[2], colors[3], 
			      (val / (range / 6)) - 2));
	else if (val <= 4 * range / 6)
	    return (lerpColor(colors[3], colors[4], 
			      (val / (range / 6)) - 3));
	else if (val <= 5 * range / 6)
	    return (lerpColor(colors[4], colors[5], 
			      (val / (range / 6)) - 4));
	else
	    return (lerpColor(colors[5], colors[0], 
			      (val / (range / 6)) - 5));
    }
}
