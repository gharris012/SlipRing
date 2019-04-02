Char = function (ltr)
{
    var l = vector_char(0,0,ltr);
    var a = l.segments;
    var p = [];
    a.forEach(function(s)
    {
        p.push(rectangular_extrude(s, { w:3, h:3 }));
    });
    return union(p).scale(1/6);
}

makeAxis = function (extents = [50, 50, 30])
{
    var axis = [];
    axis.push(cylinder({r:1, h:extents[2] + 5, center:true}).setColor(1,0,255));
    axis.push(Char('X').translate([extents[0] + 5,-6,0]).setColor(0,0,0));
    axis.push(Char('Y').translate([-5,extents[1] + 5,0]).setColor(0,0,0));
    return union(axis);
}

hullZ = function (e, offset)
{
    var body = union(e);
    var shape = body.sectionCut(CSG.OrthoNormalBasis.Z0Plane());
    var hulledShape = hull(shape);
    var hulledBody = hulledShape.extrude({offset:offset});
    return hulledBody;
}
