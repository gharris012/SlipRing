// args.type
// args.fit
// args.length
screw = function(type, args)
{
    var types = { // height excludes head
        "1/4-20": {
            "Name": "1/4-20",
            "fit": { // clearance and tap drill sizes (mostly from: http://www.etantdonnes.com/MACHINE/TABLES/screw.html)
                     // do not add tolerance
                "free": 6.8,    // 0.266in -> 6.7564mm
                "close": 6.6,   // 0.257in -> 6.5278mm
                "nominal": 6.3, // diameter including threads as measured using calipers
                "tap": 5.1     // 0.2101in -> 5.1054mm
            },
            "head": { // attempt to describe the type of head on the bolt
                "pan-square": {
                    "shape": "round",
                    "height": 4.2,
                    "diameter": 12.2
                }
            },
            "defaultLength": 76.0,
            "defaultFit": "free",
            "threadedInsert": {    // from McMaster Carr: http://www.mcmaster.com/#93365a160/=10lduwr
                "a": 8.86,         // 0.349"
                "b": 9.22,         // 0.363"
                "length": 7.62,    // 0.300"
                "diameter": 9.52,  // 0.375"
                "taper": 0.70 // percent of length for taper
            }
        },
        "#4-40": {
            "Name": "#4-40",
            "fit": { // clearance and tap drill sizes (mostly from: http://www.csgnetwork.com/screwnummachtable.html)
                     // do not add tolerance
                "free": 3.3,
                "close": 3.0,
                "nominal": 2.7, // diameter including threads as measured using calipers
                "tap": 2.30
            },
            "defaultLength": 6.0,
            "defaultFit": "free",
            "threadedInsert": { // from McMaster Carr: http://www.mcmaster.com/#93365a120/=zf6yg5
                "a": 3.88, // 0.153"
                "b": 4.14, // 0.163"
                "length": 3.42, // 0.135"
                "taper": 0.70 // percent of length for taper
            }
        },
        "M2.5": {
            "Name": "M2.5",
            "fit": { // clearance and tap drill sizes (mostly from: http://www.csgnetwork.com/screwmetmachtable.html)
                     // do not add tolerance
                "free": 3.1,
                "close": 2.7,
                "nominal": 2.40, // diameter including threads as measured using calipers
                "tap": 2.15
            },
            "defaultLength": 8.0,
            "defaultFit": "free"
        },
        "M3": {
            "Name": "M3",
            "fit": { // clearance and tap drill sizes (mostly from: http://www.csgnetwork.com/screwmetmachtable.html)
                     // do not add tolerance
                "free": 3.6,
                "close": 3.2,
                "nominal": 2.9, // diameter including threads as measured using calipers
                "tap": 2.50
            },
            "defaultLength": 8.0,
            "defaultFit": "free"
        },
        "M6": {
            "Name": "M6",
            "fit": { // clearance and tap drill sizes (mostly from: http://www.csgnetwork.com/screwmetmachtable.html)
                     // do not add tolerance
                "free": 7.0,
                "close": 6.4,
                "nominal": 5.80, // diameter including threads as measured using calipers
                "tap": 5.00
            },
            "defaultLength": 20.0,
            "defaultFit": "free"
        },
        "5/16-18": {
            "Name": "5/16-18",
            "fit": { // clearance and tap drill sizes (mostly from: http://www.csgnetwork.com/screwnummachtable.html)
                     // do not add tolerance
                "free": 8.43,
                "close": 8.20,
                "nominal": 8.0, // diameter including threads as measured using calipers
                "tap": 6.53
            },
            "defaultLength": 6.0,
            "defaultFit": "free",
            "threadedInsert": { // from McMaster Carr: https://www.mcmaster.com/93365a280
                "drillSize": 10.2, // 0.163"
                "length": 14.27, // 0.135"
                "taper": 0.70, // percent of length for taper
                "taperAngle": 8 // taper angle
            }
        },
        "EG1.5": { // ~ 1.5mm screws from eyeglass repair
            "Name": "EG1.5",
            "fit": {
                "free": 2.0,
                "close": 1.50,
                "nominal": 1.55, // diameter including threads as measured using calipers
                "tap": 1.40
            },
            "defaultLength": 5.0,
            "defaultFit": "free"
        }
    };
    this.type = types[type];
    this.length = args && args.length || this.type["defaultLength"];
    this.fit = args && args.fit || this.type.defaultFit;
    this.head = args && args.head || null;
    this.diameter = this.type.fit[this.fit];

    this.screw = function (args)
    {
        var head = this.type.head[this.head];
        var diameter = args && args.fit && this.type.fit[args.fit] || this.type.fit['nominal'];

        var shaft = CSG.cylinder({
                        start: [0,0,0],
                        end:   [0,0,this.length],
                        radius: diameter / 2
                    });

        if ( head )
        {
            if ( head.shape == 'round' )
            {
                shaft = shaft.union(CSG.cylinder({
                            start: [0,0,this.length],
                            end:   [0,0,this.length + head.height],
                            radius: head.diameter / 2
                        }));
            }
        }
        return shaft;
    }

    this.headRecess = function(args)
    {
        var head = args && args.head && this.type.head[args.head] || this.type.head[this.head];
        var tolerance  = args && args.tol || tol;
        return CSG.cylinder({
                            start: [0,0,0],
                            end:   [0,0,head.height + tolerance],
                            radius: ( head.diameter + tolerance ) / 2
                        })
    }

    this.roundPost = function (args)
    {
        var wallThickness = args && args.wallThickness || 2;
        var fit = args && args.fit || this.fit;
        var length = args && args.length || this.length;
        length = args && args.postLength || length;
        return CSG.cylinder({
                    start: [0,0,0],
                    end:   [0,0,length],
                    radius: ( this.diameter / 2 ) + wallThickness
                }).subtract(this.hole(args));
    }

    this.squarePost = function (wallThickness, length)
    {
        wallThickness = wallThickness || 2;
        length = length || this.length;
        return CSG.cube({
                    start: [0,0,0],
                    radius: [( this.diameter / 2 ) + wallThickness, ( this.diameter / 2 ) + wallThickness, length / 2 ]
                }).subtract(this.hole().translate([0,0,-length/2]));
    }

    this.hole = function (args)
    {
        var fit = args && args.fit || this.fit;
        var length = args && args.length || this.length;
        return CSG.cylinder({
                    start: [0,0,0],
                    end:   [0,0,length],
                    radius: ( this.type.fit[fit] ) / 2
                });
    }

    this.roundThreadedInsertPost = function (args)
    {
        var wallThickness = args && args.wallThickness || 2;
        var outerDiameter = args && args.outerDiamter;
        var length = args && args.length || this.type.threadedInsert.length;

        var maxDia;
        if ( this.type.threadedInsert.taperAngle )
        {
            var taperLength = this.type.threadedInsert.length * this.type.threadedInsert.taper;
            var taperAngle = this.type.threadedInsert.taperAngle;
            var minDia = this.type.threadedInsert.drillSize;
            var angleC = 180 - 90 - taperAngle;
            var angleC_R = angleC * Math.PI / 180;
            var taperAngle_R = taperAngle * Math.PI / 180;
            var diaExt = 0; // a = c*sin(A)/sin(C) - a:diaExt, c:taperLength, A:taperAngle, C:angleC
            diaExt = taperLength * (Math.sin(taperAngle_R)/Math.sin(angleC_R));
            //console.log("a = c*sin(A)/sin(C)");
            //console.log(diaExt + " = " + taperLength + " * (sin(" + taperAngle_R + ")/sin(" + angleC_R + "))");
            //console.log(diaExt + " = " + taperLength + " * (" + Math.sin(taperAngle_R) + "/" + Math.sin(angleC_R) + ")");
            maxDia = minDia + diaExt;
            console.log(this.type.Name + " Drill Dia: " + minDia + " ; Tapered Diameter: " + maxDia);
        }
        else
        {
            maxDia = this.type.threadedInsert.b;
        }

        var outerDiameter = args && args.outerDiameter || ( maxDia + ( wallThickness * 2 ) );
        // console.log("args: ", args);
        // console.log("maxDia: ", maxDia);
        // console.log("wallThickness: ", wallThickness);
        // console.log("outerDiameter: ", outerDiameter);

        var retHole = CSG.cylinder({
                    start: [0,0,0],
                    end:   [0,0,length],
                    radius: outerDiameter / 2
                });

        if ( args && args.hole )
        {
            retHole = retHole.subtract(this.threadedInsertHole())
                .rotateX(180)
                .translate([0,0,length]);
        }

        return retHole;
    }

    this.threadedInsertHole = function(args)
    {
        var minDia;
        var maxDia;
        var totalLength;
        var taperLength;
        var straightLength;
        totalLength = this.type.threadedInsert.length;
        straightLength = this.type.threadedInsert.length * ( 1.0 - this.type.threadedInsert.taper );
        taperLength = this.type.threadedInsert.length * this.type.threadedInsert.taper;

        console.log(this.type.Name + "Total Length: " + totalLength + " ; Straight Length: " + straightLength + " ; Taper Length: " + taperLength );

        if ( this.type.threadedInsert.taperAngle )
        {
            var taperAngle = this.type.threadedInsert.taperAngle;
            minDia = this.type.threadedInsert.drillSize;
            var angleC = 180 - 90 - taperAngle;
            var angleC_R = angleC * Math.PI / 180;
            var taperAngle_R = taperAngle * Math.PI / 180;
            var diaExt = 0; // a = c*sin(A)/sin(C) - a:diaExt, c:taperLength, A:taperAngle, C:angleC
            diaExt = taperLength * (Math.sin(taperAngle_R)/Math.sin(angleC_R));
            //console.log("a = c*sin(A)/sin(C)");
            //console.log(diaExt + " = " + taperLength + " * (sin(" + taperAngle_R + ")/sin(" + angleC_R + "))");
            //console.log(diaExt + " = " + taperLength + " * (" + Math.sin(taperAngle_R) + "/" + Math.sin(angleC_R) + ")");
            maxDia = minDia + diaExt;
        }
        else
        {
            minDia = this.type.threadedInsert.a;
            maxDia = this.type.threadedInsert.b;
        }
        var ihole = CSG.cylinder({ // b, with taper
                    start: [0,0,0],
                    end:   [0,0,taperLength],
                    radiusStart: maxDia / 2,
                    radiusEnd: minDia / 2
                }).union(
                CSG.cylinder({ // a, straight
                     start: [0,0,0],
                     end:   [0,0,straightLength],
                     radius: minDia / 2
                 }).translate([0,0,taperLength])
                );

        // extend B cutout if requested to allow sinking/non-flush mounting
        if ( args )
        {
            if ( args.extendB )
            {
                ihole = ihole.union(
                    CSG.cylinder({
                         start: [0,0,0],
                         end:   [0,0,args.extendB],
                         radius: maxDia / 2
                     }).translate([0,0,-args.extendB])
                    )
            }
            if ( args.flipX )
            {
                ihole = ihole.rotateX(180)
                        .translate([0,0,totalLength]);
            }
        }

        return ihole;
    }
}

washer = function(type, args)
{
    var types = {
        "M6": {
            "Name": "M6",
            "diameter": 12.0,
            "height": 1.0,
            "screw": "M6"
        },
        "M2.5": {
            "Name": "M2.5",
            "diameter": 5.9,
            "height": 0.6,
            "screw": "M2.5"
        }
    };
    this.type = types[type];
    this.diameter = this.type.diameter;
    this.height = this.type.height;

    this.screw;
    if ( args && typeof(args.screw) != 'undefined' )
    {
        if ( typeof(args.screw) == 'object' )
        {
            this.screw = args.screw;
        }
        else
        {
            this.screw = new screw(args.screw);
        }
    }
    else
    {
        this.screw = new screw(this.type.screw);
    }

    this.nut;
    if ( args && typeof(args.nut) != 'undefined' )
    {
        if ( typeof(args.nut) == 'object' )
        {
            this.nut = args.nut;
        }
        else
        {
            this.nut = new nut(args.nut);
        }
    }
    else
    {
        this.nut = new nut(this.type.screw);
    }

    this.getRecessHeight = function()
    {
        return this.height + this.nut.height;
    }

    this.washer = function()
    {
        return CSG.cylinder({
                    start: [0,0,0],
                    end:   [0,0,this.height],
                    radius: this.diameter / 2
                }).subtract(this.screw.hole())
    }

    this.hole = function(tolerance)
    {
        tolerance = tolerance || tol;
        return CSG.cylinder({
                    start: [0,0,0],
                    end:   [0,0,this.height + tolerance],
                    radius: ( this.diameter + tolerance ) / 2
                });
    }

    this.recess = function(tolerance)
    {
        tolerance = tolerance || tol;
        height = this.getRecessHeight()

        this.recessHeight = height;

        return CSG.cylinder({
                    start: [0,0,0],
                    end:   [0,0,height + tolerance],
                    radius: ( this.diameter + tolerance ) / 2
                });
    }
}

nut = function(type, args)
{
    var types = {
        "1/4-20": {
            "Name": "1/4-20",
            "diameter": 12.5, // distance from point to point
            "length": 11.0,   // distance from side to side
            "height": 5.0,
            "screw": "#4-40"
        },
        "#4-40": {
            "Name": "#4-40",
            "diameter": 7.0, // distance from point to point
            "length": 6.3,   // distance from side to side
            "height": 2.4,
            "screw": "#4-40"
        },
        "M6": {
            "Name": "M6",
            "diameter": 11.10, // distance from point to point
            "length": 9.8,   // distance from side to side
            "height": 3.8,
            "screw": "M6"
        },
        "M2.5": {
            "Name": "M2.5",
            "diameter": 5.5, // distance from point to point
            "length": 5.0,   // distance from side to side
            "height": 1.9,
            "screw": "M2.5"
        }
    };
    this.type = types[type];
    this.diameter = this.type.diameter;
    this.length = this.type.length;
    this.height = this.type.height;

    this.screw;
    if ( args && typeof(args.screw) != 'undefined' )
    {
        if ( typeof(args.screw) == 'object' )
        {
            this.screw = args.screw;
        }
        else
        {
            this.screw = new screw(args.screw);
        }
    }
    else
    {
        this.screw = new screw(this.type.screw);
    }

    this.nut = function()
    {
        return CSG.cylinder({
                    start: [0,0,0],
                    end:   [0,0,this.height],
                    radius: this.diameter / 2
                }).subtract(this.screw.hole())
    }

    this.hole = function(tolerance)
    {
        tolerance = tolerance || tol;
        return CSG.cylinder({
                    start: [0,0,0],
                    end:   [0,0,this.height + tolerance],
                    radius: ( this.diameter + tolerance ) / 2
                });
    }

    this.slot = function(tolerance)
    {
        tolerance = tolerance || tol;
        return CSG.cylinder({
                    start: [0,0,0],
                    end:   [0,0,this.height + tolerance],
                    radius: ( this.diameter + tolerance ) / 2,
                    resolution: 6
                });
    }

    this.insertHole = function(insetWidth, insetHeight)
    {
        insetWidth = insetWidth || 2;
        insetHeight = insetHeight || 1;

        return this.hole().translate([0,0,( this.screw.length - insetHeight )])
                .union(CSG.cylinder({
                            start: [0,0,0],
                            end:   [0,0,this.height - insetHeight],
                            radius: ( ( this.diameter ) - insetWidth ) / 2
                        }).translate([0,0,this.screw.length - this.height]))
                .union(this.screw.hole());
    }

    this.insert = function (wallThickness)
    {
        wallThickness = wallThickness || 2;

        return CSG.cylinder({
            start: [0,0,0],
            end:   [0,0,this.screw.length],
            radius: ( this.diameter + wallThickness ) / 2
        })
    }
}
